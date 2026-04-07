import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export const maxDuration = 30;
export const runtime = "nodejs";

/* ───────────────────────────────────────────
   POST /api/parse-resume
   Accepts a file (PDF, DOCX, TXT) via FormData
   and returns clean extracted text. Strips
   null bytes and other binary garbage so the
   text can be safely stored in Postgres.
   ─────────────────────────────────────────── */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_LEN = 20000;

const ALLOWED_EXT = ["pdf", "docx", "doc", "txt"] as const;
type AllowedExt = (typeof ALLOWED_EXT)[number];

function clean(text: string): string {
  return text
    .replace(/\u0000/g, "") // null bytes — break Postgres text
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "") // other control chars
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT_LEN);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large (max 10MB)" }, { status: 413 });
    }

    const name = file.name || "upload";
    const ext = name.split(".").pop()?.toLowerCase() as AllowedExt | undefined;

    if (!ext || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 415 }
      );
    }

    let rawText = "";

    if (ext === "txt") {
      rawText = await file.text();
    } else if (ext === "pdf") {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocumentProxy(buffer);
      const result = await extractText(pdf, { mergePages: true });
      rawText = Array.isArray(result.text) ? result.text.join("\n\n") : result.text;
    } else {
      // docx / doc — mammoth handles .docx; .doc is best-effort
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    }

    const text = clean(rawText);

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "Could not extract readable text from this file. Try pasting instead." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, fileName: name });
  } catch (err) {
    console.error("parse-resume error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { error: "Failed to parse file. Try pasting the text instead." },
      { status: 500 }
    );
  }
}

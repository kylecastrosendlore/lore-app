import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
export const runtime = "nodejs";

/* ───────────────────────────────────────────
   POST /api/extract-star
   Body: { resumeText, targetTitle, targetCompany, senderName? }
   Returns: { starDraft: string }

   Picks the 1–2 strongest bullets from the
   resume that map to the target role and
   drafts a STAR-formatted accomplishment.
   The user is expected to edit the ACTION
   line to add the HOW.
   ─────────────────────────────────────────── */

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText: string = (body?.resumeText || "").toString().slice(0, 18000);
    const targetTitle: string = (body?.targetTitle || "").toString().slice(0, 200);
    const targetCompany: string = (body?.targetCompany || "").toString().slice(0, 200);
    const senderName: string = (body?.senderName || "").toString().slice(0, 120);

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
    }
    if (!targetTitle.trim() && !targetCompany.trim()) {
      return NextResponse.json(
        { error: "targetTitle or targetCompany is required" },
        { status: 400 }
      );
    }

    const client = getClient();

    const system = `You are LORE's accomplishment scout. You read a resume and a target role, then pick the 1–2 strongest bullets from the resume that map to that role's needs, and rewrite them as ONE clean STAR-formatted accomplishment.

Output rules — strict:
- Output ONLY the STAR text. No preamble, no explanation, no markdown fences.
- Use this exact 4-line format with em dashes:
  SITUATION — <one sentence with a real number from the resume>
  TASK — <one sentence, "I owned ...">
  ACTION — <one sentence describing WHAT was done. Keep it factual to what the bullet says — do NOT invent specific tactics. End the line with: "[edit to add the HOW]">
  RESULT — <one sentence with the real metric from the resume>
- First person, "I" not "we".
- No buzzwords (synergy, leveraged, spearheaded, drove, utilized).
- If the resume has no quantified bullet that maps to the target role, pick the closest qualitative win and use whatever number IS in the resume.
- Total length under 110 words.`;

    const user = `TARGET ROLE: ${targetTitle || "(not specified)"}${
      targetCompany ? ` at ${targetCompany}` : ""
    }
${senderName ? `CANDIDATE: ${senderName}\n` : ""}
RESUME:
${resumeText}

Pick the 1–2 bullets that best match this target role and output a single STAR draft following the rules above.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: user }],
    });

    const block = response.content[0];
    const text = block && block.type === "text" ? block.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "No draft produced" }, { status: 502 });
    }

    return NextResponse.json({ starDraft: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract-star] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

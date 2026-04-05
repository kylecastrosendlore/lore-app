import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/* ───────────────────────────────────────────
   GET /api/briefs/[id]
   Fetches a brief by ID. Returns status + content.
   Used by the brief viewer page for polling.
   ─────────────────────────────────────────── */

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Brief ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: brief, error } = await supabase
      .from("briefs")
      .select(
        "id, brief_status, brief_html, email_subject, email_body, target_name, sender_name, user_type, payment_status, contact_id_status"
      )
      .eq("id", id)
      .single();

    if (error || !brief) {
      return NextResponse.json(
        { error: "Brief not found" },
        { status: 404 }
      );
    }

    if (brief.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Brief has not been paid for" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: brief.id,
      status: brief.brief_status,
      targetName: brief.target_name,
      senderName: brief.sender_name,
      userType: brief.user_type,
      briefHtml: brief.brief_status === "ready" ? brief.brief_html : null,
      emailSubject: brief.brief_status === "ready" ? brief.email_subject : null,
      emailBody: brief.brief_status === "ready" ? brief.email_body : null,
      contactIdStatus: brief.contact_id_status,
    });
  } catch (err) {
    console.error("Brief fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch brief" },
      { status: 500 }
    );
  }
}

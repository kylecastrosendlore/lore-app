import { NextResponse } from "next/server";
import { generateBrief } from "@/lib/ai";
import { getSupabaseAdmin } from "@/lib/supabase";

/* ───────────────────────────────────────────
   POST /api/generate
   Generates an AI intelligence brief for a paid brief.
   Expects: { briefId }
   Updates the brief with generated HTML + email copy.
   ─────────────────────────────────────────── */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { briefId } = body;

    if (!briefId || typeof briefId !== "string") {
      return NextResponse.json(
        { error: "briefId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    /* ── Fetch the full brief ── */
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .select("*")
      .eq("id", briefId)
      .single();

    if (briefError || !brief) {
      return NextResponse.json(
        { error: "Brief not found" },
        { status: 404 }
      );
    }

    if (brief.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Brief must be paid before generation" },
        { status: 400 }
      );
    }

    if (brief.brief_status === "ready") {
      return NextResponse.json(
        { error: "Brief has already been generated" },
        { status: 400 }
      );
    }

    /* ── Mark as generating ── */
    await supabase
      .from("briefs")
      .update({ brief_status: "generating" })
      .eq("id", briefId);

    /* ── Parse Apollo enrichment data if available ── */
    let enrichmentData = null;
    if (brief.contact_id_data) {
      try {
        enrichmentData = JSON.parse(brief.contact_id_data);
      } catch {
        console.warn("Failed to parse enrichment data for brief", briefId);
      }
    }

    /* ── Generate the brief with AI ── */
    const result = await generateBrief({
      userType: brief.user_type,
      senderName: brief.sender_name,
      senderRole: brief.sender_role || undefined,
      senderBackground: brief.sender_background || undefined,
      senderCompany: brief.sender_company || undefined,
      senderCompanyDesc: brief.sender_company_desc || undefined,
      resumeText: brief.resume_text || undefined,
      targetName: brief.target_name,
      targetTitle: brief.target_title || undefined,
      targetCompany: brief.target_company || undefined,
      targetLinkedIn: brief.target_linkedin || undefined,
      outreachType: brief.outreach_type || undefined,
      goal: brief.goal || undefined,
      notes: brief.notes || undefined,
      roleHiringFor: brief.role_hiring_for || undefined,
      roleCompelling: brief.role_compelling || undefined,
      specificAngle: brief.specific_angle || undefined,
      prospectIndustry: brief.prospect_industry || undefined,
      painPoints: brief.pain_points || undefined,
      yourProduct: brief.your_product || undefined,
      enrichmentData,
    });

    /* ── Save generated output ── */
    const { error: updateError } = await supabase
      .from("briefs")
      .update({
        brief_html: result.briefHtml,
        email_subject: result.emailSubject,
        email_body: result.emailBody,
        brief_status: "ready",
      })
      .eq("id", briefId);

    if (updateError) {
      console.error("Failed to save generated brief:", updateError.message);
      await supabase
        .from("briefs")
        .update({ brief_status: "error" })
        .eq("id", briefId);
      return NextResponse.json(
        { error: "Failed to save generated brief" },
        { status: 500 }
      );
    }

    console.log(`✅ Brief ${briefId} generated successfully`);

    return NextResponse.json(
      {
        success: true,
        briefId,
        emailSubject: result.emailSubject,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Generate API error:", message);

    /* Try to mark brief as error if we have the ID */
    try {
      const body = await request.clone().json();
      if (body.briefId) {
        const supabase = getSupabaseAdmin();
        await supabase
          .from("briefs")
          .update({ brief_status: "error" })
          .eq("id", body.briefId);
      }
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: `Brief generation failed: ${message}` },
      { status: 500 }
    );
  }
}

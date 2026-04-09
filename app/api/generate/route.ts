import { NextResponse } from "next/server";
import { generateBrief, generateBriefJson } from "@/lib/ai";
import { getSupabaseAdmin } from "@/lib/supabase";

/* Allow up to 300s — sonnet-4-5 generating 16K tokens of HTML can take 90-180s */
export const maxDuration = 300;

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

    /* ── Claim the row atomically ──
       Only proceed if the status is still 'draft'. This prevents
       duplicate concurrent generations (e.g. React double-invokes,
       webhook + client race, retries) from each burning an Anthropic call. */
    const { data: claimed, error: claimError } = await supabase
      .from("briefs")
      .update({ brief_status: "generating" })
      .eq("id", briefId)
      .eq("brief_status", "draft")
      .select("id")
      .maybeSingle();

    if (claimError) {
      return NextResponse.json(
        { error: "Failed to claim brief for generation" },
        { status: 500 }
      );
    }

    if (!claimed) {
      /* Another worker already picked this up — not an error. */
      return NextResponse.json(
        { success: true, alreadyInFlight: true, briefId },
        { status: 200 }
      );
    }

    /* ── Parse Apollo enrichment data if available ── */
    let enrichmentData = null;
    if (brief.contact_id_data) {
      try {
        enrichmentData = JSON.parse(brief.contact_id_data);
      } catch {
        console.warn("Failed to parse enrichment data for brief", briefId);
      }
    }

    /* ── Shared input payload for both generation paths ── */
    const aiInput = {
      userType: brief.user_type,
      senderName: brief.sender_name,
      senderEmail: brief.sender_email || undefined,
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
      brandCreatorName: brief.brand_creator_name || undefined,
      partnershipType: brief.partnership_type || undefined,
      partnershipFit: brief.partnership_fit || undefined,
      audienceOverlapNotes: brief.audience_overlap_notes || undefined,
      uniqueAngle: brief.unique_angle || undefined,
      mediaKitText: brief.media_kit_text || undefined,
      jobPostingText: brief.job_posting_text || undefined,
      publishedWorkLinks: brief.published_work_links || undefined,
      enrichmentData,
    };

    /* ── Dual-write: JSON brief (shell) is primary.
       Legacy HTML brief is a fallback if the JSON path fails,
       so we never ship a dead link. ── */
    let brief_json: unknown = null;
    let brief_html: string | null = null;
    let email_subject = "";
    let email_body = "";

    try {
      const jsonResult = await generateBriefJson(aiInput);
      brief_json = jsonResult.content;
      email_subject = jsonResult.content.email.subject;
      email_body = jsonResult.content.email.body;
      console.log(`✅ Brief ${briefId} generated via JSON shell path`);
    } catch (jsonErr) {
      const msg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      console.warn(`⚠️  JSON brief path failed for ${briefId}, falling back to legacy HTML: ${msg}`);
      const legacy = await generateBrief(aiInput);
      brief_html = legacy.briefHtml;
      email_subject = legacy.emailSubject;
      email_body = legacy.emailBody;
    }

    /* ── Save generated output (dual-write columns) ── */
    const { error: updateError } = await supabase
      .from("briefs")
      .update({
        brief_json,
        brief_html,
        email_subject,
        email_body,
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

    console.log(`✅ Brief ${briefId} saved (json=${brief_json ? "yes" : "no"}, html=${brief_html ? "yes" : "no"})`);

    return NextResponse.json(
      {
        success: true,
        briefId,
        emailSubject: email_subject,
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

    void message;
    return NextResponse.json(
      { error: "Brief generation failed" },
      { status: 500 }
    );
  }
}

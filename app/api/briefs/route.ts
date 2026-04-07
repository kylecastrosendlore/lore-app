import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/* ───────────────────────────────────────────
   POST /api/briefs
   Saves intake form data to Supabase.
   Returns the new brief ID for payment flow.
   ─────────────────────────────────────────── */

/* Allowed values for validation */
const VALID_USER_TYPES = [
  "job_seeker",
  "hiring_manager",
  "salesperson",
  "influencer_brand",
];
const VALID_PLANS = ["one_off", "subscription", "pack_five"];
const VALID_OUTREACH = ["cold", "warm", "referral", "followup"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /* ── Input validation ── */
    if (!body.userType || !VALID_USER_TYPES.includes(body.userType)) {
      return NextResponse.json(
        { error: "Invalid or missing user_type" },
        { status: 400 }
      );
    }

    if (!body.senderName?.trim()) {
      return NextResponse.json(
        { error: "sender_name is required" },
        { status: 400 }
      );
    }

    if (!body.targetName?.trim()) {
      return NextResponse.json(
        { error: "target_name is required" },
        { status: 400 }
      );
    }

    if (body.plan && !VALID_PLANS.includes(body.plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    if (body.outreachType && !VALID_OUTREACH.includes(body.outreachType)) {
      return NextResponse.json(
        { error: "Invalid outreach_type" },
        { status: 400 }
      );
    }

    /* ── Email format check (sender_email is optional but must be valid if present) ── */
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (body.senderEmail && (typeof body.senderEmail !== "string" || !EMAIL_REGEX.test(body.senderEmail) || body.senderEmail.length > 320)) {
      return NextResponse.json(
        { error: "Invalid sender email" },
        { status: 400 }
      );
    }

    /* ── Sanitize: strip HTML, problematic characters, and cap length ── */
    const MAX_LEN = 4000;
    const MAX_RESUME_LEN = 20000;
    const sanitize = (val: unknown, max: number = MAX_LEN): string | null => {
      if (typeof val !== "string") return null;
      const cleaned = val
        .replace(/<[^>]*>/g, "")                              // strip HTML tags
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "") // strip control chars (keep tab + LF)
        .replace(/\\u0000/g, "")                              // escaped null bytes
        .trim();
      if (!cleaned) return null;
      return cleaned.slice(0, max);
    };

    /* ── Build row ── */
    const row = {
      user_type: body.userType,
      sender_name: sanitize(body.senderName),
      sender_email: sanitize(body.senderEmail),
      sender_role: sanitize(body.senderRole),
      sender_background: sanitize(body.senderBackground),
      sender_company: sanitize(body.senderCompany),
      sender_company_desc: sanitize(body.senderCompanyDesc),
      resume_text: sanitize(body.resumeText, MAX_RESUME_LEN),
      resume_file_name: sanitize(body.resumeFileName),
      target_name: sanitize(body.targetName),
      target_title: sanitize(body.targetTitle),
      target_company: sanitize(body.targetCompany),
      target_linkedin: sanitize(body.targetLinkedIn),
      outreach_type: sanitize(body.outreachType),
      goal: sanitize(body.goal),
      notes: sanitize(body.notes),
      role_hiring_for: sanitize(body.roleHiringFor),
      role_compelling: sanitize(body.roleCompelling),
      specific_angle: sanitize(body.specificAngle),
      prospect_industry: sanitize(body.prospectIndustry),
      pain_points: sanitize(body.painPoints),
      your_product: sanitize(body.yourProduct),
      brand_creator_name: sanitize(body.brandCreatorName),
      partnership_type: sanitize(body.partnershipType),
      partnership_fit: sanitize(body.partnershipFit),
      audience_overlap_notes: sanitize(body.audienceOverlapNotes),
      unique_angle: sanitize(body.uniqueAngle),
      media_kit_text: sanitize(body.mediaKitText, MAX_RESUME_LEN),
      media_kit_file_name: sanitize(body.mediaKitFileName),
      job_posting_text: sanitize(body.jobPostingText, MAX_RESUME_LEN),
      published_work_links: sanitize(body.publishedWorkLinks),
      plan: body.plan || "one_off",
      payment_status: "pending" as const,
      brief_status: "draft" as const,
      contact_id_requested: body.contactIdRequested === true,
    };

    /* ── Insert ── */
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("briefs")
      .insert(row)
      .select("id, access_token")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.message, error.code, error.details);
      const isDev = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        { error: isDev ? `Failed to save brief: ${error.message}` : "Failed to save brief" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { briefId: data.id, accessToken: data.access_token },
      { status: 201 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

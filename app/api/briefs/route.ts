import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/* ───────────────────────────────────────────
   POST /api/briefs
   Saves intake form data to Supabase.
   Returns the new brief ID for payment flow.
   ─────────────────────────────────────────── */

/* Allowed values for validation */
const VALID_USER_TYPES = ["job_seeker", "hiring_manager", "salesperson"];
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

    /* ── Sanitize: strip HTML and problematic characters ── */
    const sanitize = (val: unknown): string | null => {
      if (typeof val !== "string") return null;
      return val
        .replace(/<[^>]*>/g, "")       // strip HTML tags
        .replace(/\x00/g, "")           // remove null bytes
        .replace(/\\u0000/g, "")        // remove escaped null bytes
        .trim() || null;
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
      resume_text: sanitize(body.resumeText),
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
      plan: body.plan || "one_off",
      payment_status: "pending" as const,
      brief_status: "draft" as const,
    };

    /* ── Insert ── */
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("briefs")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.message, error.details, error.hint);
      return NextResponse.json(
        { error: `Failed to save brief: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ briefId: data.id }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

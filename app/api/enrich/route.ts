import { NextResponse } from "next/server";
import { enrichPerson, parseName } from "@/lib/apollo";
import { getSupabaseAdmin } from "@/lib/supabase";

export const maxDuration = 30;

/* ───────────────────────────────────────────
   POST /api/enrich
   Enriches a brief's target person via Apollo.
   Called after payment is confirmed.
   Expects: { briefId }
   Returns: { enriched, person } or { enriched: false }
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

    /* ── Fetch the brief to get target info ── */
    const supabase = getSupabaseAdmin();
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .select(
        "id, target_name, target_title, target_company, target_linkedin, payment_status"
      )
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
        { error: "Brief must be paid before enrichment" },
        { status: 400 }
      );
    }

    /* ── Parse the target name ── */
    const { firstName, lastName } = parseName(brief.target_name);

    /* ── Call Apollo ── */
    const result = await enrichPerson({
      firstName,
      lastName,
      company: brief.target_company || undefined,
      linkedinUrl: brief.target_linkedin || undefined,
    });

    /* ── Save enrichment result to the brief ── */
    await supabase
      .from("briefs")
      .update({
        contact_id_status: result.found ? "found" : "not_found",
        contact_id_data: result.found
          ? JSON.stringify(result.person)
          : null,
      })
      .eq("id", briefId);

    if (result.found) {
      console.log(`✅ Apollo enrichment found data for brief ${briefId}`);
    } else {
      console.log(`❌ Apollo enrichment found nothing for brief ${briefId}`);
    }

    return NextResponse.json(
      {
        enriched: result.found,
        person: result.found ? result.person : null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Enrich API error:", err);
    return NextResponse.json(
      { error: "Enrichment failed" },
      { status: 500 }
    );
  }
}

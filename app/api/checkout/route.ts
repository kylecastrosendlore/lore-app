import { NextResponse } from "next/server";
import { getStripe, getPriceId } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

/* ───────────────────────────────────────────
   POST /api/checkout
   Creates a Stripe Checkout Session for a brief.
   Expects: { briefId, plan, email }
   Returns: { url } — the Stripe Checkout URL
   ─────────────────────────────────────────── */

const VALID_PLANS = ["one_off", "subscription", "pack_five"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { briefId, plan, email } = body;

    /* ── Validate inputs ── */
    if (!briefId || typeof briefId !== "string") {
      return NextResponse.json(
        { error: "briefId is required" },
        { status: 400 }
      );
    }

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    /* ── Verify the brief exists and is pending ── */
    const supabase = getSupabaseAdmin();
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .select("id, payment_status")
      .eq("id", briefId)
      .single();

    if (briefError || !brief) {
      return NextResponse.json(
        { error: "Brief not found" },
        { status: 404 }
      );
    }

    if (brief.payment_status === "paid") {
      return NextResponse.json(
        { error: "This brief has already been paid for" },
        { status: 400 }
      );
    }

    /* ── Build Stripe Checkout Session ── */
    const stripe = getStripe();
    const priceId = getPriceId(plan);
    const origin = request.headers.get("origin") || "https://sendlore.com";

    const isSubscription = plan === "subscription";

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        briefId,
        plan,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&brief_id=${briefId}`,
      cancel_url: `${origin}/payment/cancel?brief_id=${briefId}`,
    });

    /* ── Save Stripe session ID to the brief ── */
    await supabase
      .from("briefs")
      .update({ stripe_session_id: session.id })
      .eq("id", briefId);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Checkout API error:", message);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

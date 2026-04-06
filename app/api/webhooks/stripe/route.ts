import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { enrichPerson, parseName } from "@/lib/apollo";

/* ───────────────────────────────────────────
   POST /api/webhooks/stripe
   Handles Stripe webhook events:
   - checkout.session.completed → mark brief as paid
   - customer.subscription.updated → sync subscription status
   - customer.subscription.deleted → cancel subscription

   SECURITY: Verifies webhook signature with STRIPE_WEBHOOK_SECRET.
   If no secret is set, skips verification (dev mode only).
   ─────────────────────────────────────────── */

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  let event;

  /* ── Verify webhook signature ── */
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } else {
    /* No secret configured — ONLY allowed outside production. */
    if (process.env.NODE_ENV === "production") {
      console.error("STRIPE_WEBHOOK_SECRET is not set in production — refusing webhook");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }
    console.warn("⚠️  No STRIPE_WEBHOOK_SECRET set — skipping signature check (dev only)");
    event = JSON.parse(body);
  }

  /* ── Handle events ── */
  try {
    switch (event.type) {
      /* ── Checkout completed (one-off or subscription first payment) ── */
      case "checkout.session.completed": {
        const session = event.data.object;
        const briefId = session.metadata?.briefId;
        const plan = session.metadata?.plan;

        if (!briefId) {
          console.error("No briefId in session metadata");
          break;
        }

        /* Mark brief as paid */
        await supabase
          .from("briefs")
          .update({
            payment_status: "paid",
            stripe_session_id: session.id,
            stripe_customer_id: session.customer,
          })
          .eq("id", briefId);

        /* Handle subscription — create subscription record */
        if (plan === "subscription" && session.subscription) {
          const subResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub = subResponse as any;

          await supabase.from("subscriptions").insert({
            email: session.customer_email,
            stripe_customer_id: session.customer,
            stripe_subscription_id: sub.id,
            status: sub.status,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          });
        }

        /* Handle pack_five — create credit pack record */
        if (plan === "pack_five") {
          await supabase.from("credit_packs").insert({
            email: session.customer_email,
            stripe_session_id: session.id,
            total_credits: 6, // 5 + 1 free
            used_credits: 0,
          });
        }

        /* ── Trigger Apollo enrichment (non-blocking, opt-in) ── */
        try {
          const { data: briefData } = await supabase
            .from("briefs")
            .select("target_name, target_company, target_linkedin, contact_id_requested, plan")
            .eq("id", briefId)
            .single();

          // Only run Apollo if the user opted in on the review step.
          // Unlimited-plan users always get contact lookups (plan includes them).
          const shouldEnrich =
            briefData?.contact_id_requested === true ||
            briefData?.plan === "subscription";

          if (shouldEnrich && briefData?.target_name) {
            const { firstName, lastName } = parseName(briefData.target_name);
            const enrichResult = await enrichPerson({
              firstName,
              lastName,
              company: briefData.target_company || undefined,
              linkedinUrl: briefData.target_linkedin || undefined,
            });

            await supabase
              .from("briefs")
              .update({
                contact_id_status: enrichResult.found ? "found" : "not_found",
                contact_id_data: enrichResult.found
                  ? JSON.stringify(enrichResult.person)
                  : null,
              })
              .eq("id", briefId);

            console.log(
              `🔍 Apollo enrichment: ${enrichResult.found ? "found" : "not found"} for ${briefData.target_name}`
            );
          }
        } catch (enrichErr) {
          console.error("Apollo enrichment error (non-fatal):", enrichErr);
        }

        /* AI generation is triggered by the brief viewer page
           calling /api/generate — NOT here in the webhook.
           This keeps the webhook fast and avoids Vercel timeouts. */

        console.log(`✅ Brief ${briefId} marked as paid (${plan}). Generation will be triggered by the viewer.`);
        break;
      }

      /* ── Subscription updated (renewal, plan change, etc.) ── */
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;

        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          })
          .eq("stripe_subscription_id", sub.id);

        console.log(`🔄 Subscription ${sub.id} updated to ${sub.status}`);
        break;
      }

      /* ── Subscription canceled ── */
      case "customer.subscription.deleted": {
        const sub = event.data.object;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);

        console.log(`❌ Subscription ${sub.id} canceled`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

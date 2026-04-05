import Stripe from "stripe";

/* ───────────────────────────────────────────
   Stripe Server Client
   SECURITY: Only used in API routes (server-side).
   Never import this file in client components.
   ─────────────────────────────────────────── */

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

/* ───────────────────────────────────────────
   Price ID Mapping
   Maps our internal plan names to Stripe Price IDs.
   ─────────────────────────────────────────── */

export function getPriceId(plan: string): string {
  const prices: Record<string, string | undefined> = {
    one_off: process.env.NEXT_PUBLIC_STRIPE_PRICE_ONE_OFF,
    subscription: process.env.NEXT_PUBLIC_STRIPE_PRICE_SUBSCRIPTION,
    pack_five: process.env.NEXT_PUBLIC_STRIPE_PRICE_PACK_FIVE,
  };

  const priceId = prices[plan];
  if (!priceId) {
    throw new Error(`No Stripe price ID configured for plan: ${plan}`);
  }
  return priceId;
}

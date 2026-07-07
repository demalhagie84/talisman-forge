import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    })
  : null;

export type StripeTier = "PREMIUM" | "PRO";

export interface CheckoutSessionOptions {
  tier: StripeTier;
  userId: string;
  customerEmail?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

function getPriceId(tier: StripeTier) {
  switch (tier) {
    case "PREMIUM":
      return process.env.STRIPE_PRICE_PREMIUM;
    case "PRO":
      return process.env.STRIPE_PRICE_PRO;
    default:
      throw new Error(`Unsupported stripe tier: ${tier}`);
  }
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Create a Stripe Checkout session for recurring subscription billing.
 */
export async function createCheckoutSession({
  tier,
  userId,
  customerEmail,
  successUrl,
  cancelUrl,
}: CheckoutSessionOptions) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const priceId = getPriceId(tier);
  if (!priceId) {
    throw new Error(`Missing Stripe price for tier: ${tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl ?? `${getAppUrl()}/dashboard?checkout=success`,
    cancel_url: cancelUrl ?? `${getAppUrl()}/dashboard?checkout=canceled`,
    metadata: {
      userId,
      tier,
    },
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe Billing Portal session for plan changes and cancellations.
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl?: string;
}) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? `${getAppUrl()}/dashboard`,
  });

  return session;
}

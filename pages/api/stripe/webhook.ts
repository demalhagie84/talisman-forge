import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

async function readRawBody(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseStripeEvent(payload: Buffer, signature: string) {
  if (!stripe || !getWebhookSecret()) {
    throw new Error("Stripe webhook is not configured.");
  }

  return stripe.webhooks.constructEvent(payload, signature, getWebhookSecret() as string);
}

async function updateSubscriptionTier(
  userId: string | null,
  tier: "FREE" | "PREMIUM" | "PRO",
  status: "ACTIVE" | "PAUSED" | "CANCELED" | "PAST_DUE"
) {
  if (!userId) {
    return;
  }

  const existing = await prisma.subscription.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        tier,
        status,
        updatedAt: new Date(),
      },
    });
    return;
  }

  await prisma.subscription.create({
    data: {
      userId,
      tier,
      status,
    },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
      return res.status(400).json({ error: "Missing Stripe signature" });
    }

    const payload = await readRawBody(req);
    const event = parseStripeEvent(payload, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = (session.metadata?.tier as "PREMIUM" | "PRO" | undefined) ?? "PREMIUM";
        await updateSubscriptionTier(userId ?? null, tier, "ACTIVE");
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const status =
          subscription.status === "active" || subscription.status === "trialing"
            ? "ACTIVE"
            : subscription.status === "canceled"
              ? "CANCELED"
              : subscription.status === "past_due"
                ? "PAST_DUE"
                : "PAUSED";
        const tier =
          subscription.items.data[0]?.price.lookup_key === "pro" ||
          subscription.items.data[0]?.price.id === process.env.STRIPE_PRICE_PRO
            ? "PRO"
            : "PREMIUM";
        await updateSubscriptionTier(userId ?? null, tier, status);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        await updateSubscriptionTier(userId ?? null, "FREE", "CANCELED");
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return res.status(400).json({ error: "Webhook verification failed" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { generateApiKeyForSubscription } from "../../../lib/apiKey";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await auth(req, res);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptions: { select: { id: true, tier: true, status: true } } },
  });

  const subscription = user?.subscriptions?.[0];
  if (!subscription || subscription.tier !== "PRO" || subscription.status !== "ACTIVE") {
    return res.status(403).json({ error: "An active Pro subscription is required for API access." });
  }

  const apiKey = generateApiKeyForSubscription(subscription.id);
  return res.status(200).json({ apiKey });
}

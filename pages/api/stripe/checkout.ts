import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { createCheckoutSession } from "../../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await auth(req, res);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { tier } = req.body as { tier?: "PREMIUM" | "PRO" };
  if (tier !== "PREMIUM" && tier !== "PRO") {
    return res.status(400).json({ error: "A valid tier is required" });
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }

    const checkoutSession = await createCheckoutSession({
      tier,
      userId: userRecord.id,
      customerEmail: userRecord.email,
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session creation failed", error);
    return res.status(500).json({ error: "Unable to start checkout" });
  }
}

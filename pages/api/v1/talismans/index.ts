import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { authenticateApiRequest, isApiAuthError } from "../../../../lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await authenticateApiRequest(req);
  if (isApiAuthError(auth)) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const take = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const talismans = await prisma.talisman.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        element: true,
        weekday: true,
        squareMethod: true,
        abjadValue: true,
        tags: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ talismans, count: talismans.length });
  } catch (error) {
    console.error("Pro API talisman listing failed", error);
    return res.status(500).json({ error: "Unable to list talismans." });
  }
}

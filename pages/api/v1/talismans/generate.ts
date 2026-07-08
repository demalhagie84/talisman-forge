import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { authenticateApiRequest, isApiAuthError } from "../../../../lib/apiAuth";
import { TEMPLATES, buildTemplate, type TemplateId } from "../../../../lib/talismanTemplates";

interface GenerateBody {
  template?: string;
  name?: string;
  intention?: string;
  weekday?: string;
}

function toSquareSizeAndSequence(result: ReturnType<typeof buildTemplate>): {
  squareSize: number;
  sequence: number[];
} {
  if (result.type === "grid") {
    return { squareSize: result.size, sequence: result.cells.flat() };
  }
  if (result.type === "circle") {
    return { squareSize: result.ringSize, sequence: result.segments.map((segment) => segment.value) };
  }
  return { squareSize: result.rows.length, sequence: result.rows.map((row) => row.value) };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await authenticateApiRequest(req);
  if (isApiAuthError(auth)) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const body = (req.body ?? {}) as GenerateBody;
  const templateId = body.template as TemplateId;

  if (!templateId || !(templateId in TEMPLATES)) {
    return res.status(400).json({
      error: `A valid "template" is required. Options: ${Object.keys(TEMPLATES).join(", ")}`,
    });
  }

  if (!body.intention || !body.intention.trim()) {
    return res.status(400).json({ error: "\"intention\" is required." });
  }

  const meta = TEMPLATES[templateId];
  const result = buildTemplate(templateId, body.intention);
  const abjadValue = "abjadValue" in result ? result.abjadValue : 0;
  const squareMethod =
    result.type === "grid" ? "Siamese" : result.type === "circle" ? "circle-abjad" : "sequence-abjad";
  const { squareSize, sequence } = toSquareSizeAndSequence(result);

  try {
    const talisman = await prisma.talisman.create({
      data: {
        userId: auth.user.id,
        name: body.name?.trim() || `${meta.name} - ${new Date().toISOString().slice(0, 10)}`,
        intention: body.intention,
        element: meta.element,
        weekday: body.weekday?.trim() || "Any",
        squareSize,
        squareData: JSON.stringify(result),
        squareMethod,
        abjadValue,
        abjadSequence: JSON.stringify(sequence),
        tags: [templateId],
      },
      select: {
        id: true,
        name: true,
        element: true,
        weekday: true,
        squareMethod: true,
        abjadValue: true,
        createdAt: true,
      },
    });

    await prisma.usageAnalytics.create({
      data: {
        userId: auth.user.id,
        eventType: "talisman_generated_api",
        metadata: JSON.stringify({ template: templateId }),
      },
    });

    return res.status(201).json({ talisman, result });
  } catch (error) {
    console.error("Pro API talisman generation failed", error);
    return res.status(500).json({ error: "Unable to generate talisman." });
  }
}

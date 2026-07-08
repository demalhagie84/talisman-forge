import type { NextApiRequest } from "next";
import { prisma } from "./prisma";
import { parseApiKey } from "./apiKey";

export interface ApiAuthResult {
  user: { id: string; email: string | null; name: string | null };
  subscription: { id: string; tier: string; status: string };
}

export interface ApiAuthError {
  status: number;
  error: string;
}

function extractApiKey(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  const queryKey = req.query.api_key;
  if (typeof queryKey === "string") {
    return queryKey;
  }
  if (Array.isArray(queryKey) && queryKey.length > 0) {
    return queryKey[0];
  }

  return null;
}

/**
 * Authenticates a request against the Pro API using a signed API key.
 * Returns either the resolved user/subscription or an error to send back.
 */
export async function authenticateApiRequest(
  req: NextApiRequest
): Promise<ApiAuthResult | ApiAuthError> {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return {
      status: 401,
      error: "Missing API key. Provide it via 'Authorization: Bearer <key>'.",
    };
  }

  const parsed = parseApiKey(apiKey);
  if (!parsed) {
    return { status: 401, error: "Invalid API key." };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: parsed.subscriptionId },
    select: { id: true, tier: true, status: true, userId: true },
  });

  if (!subscription || subscription.tier !== "PRO" || subscription.status !== "ACTIVE") {
    return {
      status: 403,
      error: "This API key is not associated with an active Pro subscription.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: subscription.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return { status: 404, error: "User not found for this API key." };
  }

  return {
    user,
    subscription: { id: subscription.id, tier: subscription.tier, status: subscription.status },
  };
}

export function isApiAuthError(result: ApiAuthResult | ApiAuthError): result is ApiAuthError {
  return (result as ApiAuthError).error !== undefined && (result as ApiAuthResult).user === undefined;
}

import crypto from "crypto";

/**
 * Pro API keys are self-verifying signed tokens rather than a stored secret.
 * The key encodes the subscription id plus an HMAC signature (keyed with
 * AUTH_SECRET), so a request can be authenticated with a single DB lookup
 * by id and no separate api-key column/migration is required.
 */
const KEY_PREFIX = "tf_pro_";

function getSigningSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured; cannot sign API keys.");
  }
  return secret;
}

function sign(subscriptionId: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(subscriptionId)
    .digest("hex")
    .slice(0, 32);
}

export function generateApiKeyForSubscription(subscriptionId: string): string {
  const encodedId = Buffer.from(subscriptionId, "utf8").toString("base64url");
  return `${KEY_PREFIX}${encodedId}.${sign(subscriptionId)}`;
}

export function parseApiKey(apiKey: string): { subscriptionId: string } | null {
  if (!apiKey || !apiKey.startsWith(KEY_PREFIX)) {
    return null;
  }

  const [encodedId, signature] = apiKey.slice(KEY_PREFIX.length).split(".");
  if (!encodedId || !signature) {
    return null;
  }

  let subscriptionId: string;
  try {
    subscriptionId = Buffer.from(encodedId, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(subscriptionId);
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(signature);

  if (expectedBuf.length !== givenBuf.length || !crypto.timingSafeEqual(expectedBuf, givenBuf)) {
    return null;
  }

  return { subscriptionId };
}

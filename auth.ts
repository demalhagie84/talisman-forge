import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";

/**
 * Full Auth.js (next-auth v5) configuration. Runs in the Node.js runtime.
 *
 * The Prisma adapter is attached only when DATABASE_URL is configured, so the
 * app still builds and runs in environments without a database (e.g. preview
 * deployments before the database is provisioned). When a database is present,
 * users and OAuth accounts are persisted while sessions remain stateless JWTs
 * (required for Edge middleware compatibility).
 *
 * Required environment variables (see .env.example):
 *   - AUTH_SECRET
 *   - AUTH_GITHUB_ID
 *   - AUTH_GITHUB_SECRET
 *   - DATABASE_URL (optional; enables persistence)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
});

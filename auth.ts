import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";

const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

/**
 * Full Auth.js (next-auth v5) configuration for the Node.js runtime.
 *
 * The Prisma adapter is only attached when a database is configured so the app
 * can still boot in preview or local environments before the database is ready.
 * Sessions remain JWT-based to stay compatible with the middleware.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: isDatabaseConfigured ? PrismaAdapter(prisma) : undefined,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
});

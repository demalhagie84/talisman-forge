import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Auth.js (next-auth v5) configuration for Talisman Forge.
 *
 * Uses the JWT session strategy so the app builds and runs without a live
 * database connection. When a Postgres database is available you can add the
 * Prisma adapter (@auth/prisma-adapter) and switch to the "database" strategy.
 *
 * Required environment variables (see .env.example):
 *   - AUTH_SECRET
 *   - AUTH_GITHUB_ID
 *   - AUTH_GITHUB_SECRET
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // Attach the user id to the session for use in the app.
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

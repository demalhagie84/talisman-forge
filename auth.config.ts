import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

const githubClientId = process.env.AUTH_GITHUB_ID;
const githubClientSecret = process.env.AUTH_GITHUB_SECRET;

const providers = [
  ...(githubClientId && githubClientSecret
    ? [
        GitHub({
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        }),
      ]
    : []),
];

type SessionUserWithId = {
  id?: string;
};

/**
 * Edge-safe Auth.js configuration.
 *
 * This file stays adapter-free so it can run in the Edge runtime used by the
 * middleware. The Prisma adapter and database-backed session wiring remain in
 * auth.ts, which runs in the Node.js runtime.
 */
export const authConfig = {
  trustHost: true,
  providers,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboardRoute) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as SessionUserWithId).id = token.sub;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

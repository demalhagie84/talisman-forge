import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Edge-runtime middleware. Uses the adapter-free Edge-safe config so it can run
 * on the Edge. The `authorized` callback in auth.config.ts decides access and
 * redirects unauthenticated users to the sign-in page.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except Next.js internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

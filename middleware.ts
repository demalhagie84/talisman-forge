import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Edge runtime middleware that protects dashboard routes and redirects
 * unauthenticated visitors to the sign-in experience.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/tools/:path*"],
};

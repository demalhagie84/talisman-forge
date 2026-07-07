import { auth } from "./auth";

/**
 * Protect the /dashboard route. Unauthenticated users are redirected to the
 * sign-in page by Auth.js (the `pages.signIn` value in auth.ts).
 */
export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};

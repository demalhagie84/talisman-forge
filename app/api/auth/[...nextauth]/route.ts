// Auth.js (next-auth v5) route handler for the App Router.
// This coexists with the Pages Router used for the UI pages.
import NextAuth from "next-auth";
import authConfig from "../../../auth.config";

const handler = NextAuth(authConfig);
export const { GET, POST } = handler;
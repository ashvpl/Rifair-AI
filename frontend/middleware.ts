import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Rifair AI Middleware
 * Handles authentication and route protection at the edge.
 *
 * Public routes are matched first; all other routes require authentication.
 */

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/api/webhooks(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/refund(.*)",
  "/demo(.*)",
  "/demo-features(.*)",
  "/demo-hero(.*)",
  "/demo-navbar(.*)",
  "/demo-shimmer(.*)",
  "/demo-sign-in(.*)",
  "/sso-callback(.*)",
  "/help(.*)",

]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

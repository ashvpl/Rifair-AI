import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Rifair AI Proxy (Next.js 16+ convention — replaces middleware.ts)
 * Handles authentication and route protection at the edge.
 *
 * Next.js 16 renamed "middleware" to "proxy" to better reflect its role.
 * The proxy file must export a default function and a config object.
 *
 * Public routes are matched first; all other routes require authentication.
 */

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/api/webhooks(.*)",
  "/api/debug-log",
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
  "/blog(.*)",
  "/features(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/api/run-engine",
  "/api/download-csv",
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

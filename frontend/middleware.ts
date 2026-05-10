import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Rifair AI Middleware
 * Handles authentication and route protection.
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
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Note: Use the latest async protection pattern
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Standard Next.js middleware matcher
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

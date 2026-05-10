import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy Boundary (formerly middleware.ts)
 * This file handles authentication and request interception at the Edge.
 */

// 1. Define Public Routes
// These routes do not require authentication
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

// 2. Main Proxy Handler
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Production-safe diagnostic logging
  // Use a unique prefix to find these in Vercel Logs
  console.log(`[CLERK_PROXY] Processing: ${req.method} ${pathname}`);

  // Fallback environment check to prevent silent runtime crashes
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.error("[CLERK_PROXY] CRITICAL: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing!");
  }

  // 3. Protection Logic
  if (!isPublicRoute(req)) {
    console.log(`[CLERK_PROXY] Protecting route: ${pathname}`);
    // This will redirect to sign-in automatically if unauthorized
    // Note: auth() is async in recent Clerk versions
    await auth().protect();
  }

  return NextResponse.next();
}, {
  // Explicitly passing keys to ensure no development leak or loading issues
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// 4. Matcher Configuration
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

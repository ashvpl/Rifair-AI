import { auth } from "@clerk/nextjs/server";

/**
 * Robustly retrieves a token for backend communication.
 * Tries the 'backend' JWT template first, then falls back to the default session token.
 * 
 * @param context A string describing the calling route for logging (e.g., "KIT", "REPORTS")
 * @returns The token string or null if no session exists.
 */
export async function getBackendToken(context: string): Promise<string | null> {
  try {
    // 1. Validate environment configuration
    if (!process.env.CLERK_SECRET_KEY) {
      console.error(`[FRONTEND ${context}] CRITICAL: CLERK_SECRET_KEY is missing from environment.`);
    }

    const authData = await auth();
    const { userId, getToken } = authData;
    
    if (!userId) {
      console.warn(`[FRONTEND ${context}] No userId found in session.`);
      return null;
    }

    // 2. Attempt custom template first ('backend')
    // This is the preferred method as it contains the custom claims the backend expects.
    let token = await getToken({ template: "backend" }).catch((err: Error) => {
      console.warn(`[FRONTEND ${context}] 'backend' JWT template retrieval failed:`, err.message);
      return null;
    });

    // 3. Fallback to default token if template fails or isn't found
    if (!token) {
      console.log(`[FRONTEND ${context}] Falling back to default session token...`);
      token = await getToken();
    }

    // 4. Final check and logging
    if (!token) {
      console.error(`[FRONTEND ${context}] Critical: Failed to retrieve ANY token for user ${userId}. 
        Check if:
        1. JWT template 'backend' exists in Clerk Dashboard.
        2. CLERK_SECRET_KEY matches the Publishable Key.
        3. Middleware is properly configured as 'middleware.ts'.`);
    } else {
      console.log(`[FRONTEND ${context}] Token successfully retrieved.`);
    }

    return token;
  } catch (error) {
    console.error(`[FRONTEND ${context}] Unexpected error in getBackendToken:`, error);
    return null;
  }
}

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
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.warn(`[FRONTEND ${context}] No userId found in session.`);
      return null;
    }

    // Attempt custom template first
    let token = await getToken({ template: "backend" }).catch((err: Error) => {
      console.warn(`[FRONTEND ${context}] 'backend' JWT template retrieval failed:`, err.message);
      return null;
    });

    // Fallback to default token
    if (!token) {
      token = await getToken();
    }

    if (!token) {
      console.error(`[FRONTEND ${context}] Critical: Failed to retrieve any token for user ${userId}`);
    }

    return token;
  } catch (error) {
    console.error(`[FRONTEND ${context}] Unexpected error in getBackendToken:`, error);
    return null;
  }
}

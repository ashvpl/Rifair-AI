/**
 * Centralized API configuration for EquiHire AI.
 * This ensures consistency across all API calls and Vercel compatibility.
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  "http://localhost:5001"; // Default for development

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.error("❌ NEXT_PUBLIC_BACKEND_URL is not defined in the production environment!");
}

if (!API_BASE_URL) {
  throw new Error("Missing backend URL configuration. Please check your environment variables.");
}

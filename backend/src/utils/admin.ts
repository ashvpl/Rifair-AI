/**
 * Centralized admin identity utility for Rifair AI.
 * Used to safely identify administrative accounts across the platform.
 */

export const ADMIN_EMAILS = [
  "aashu20p@gmail.com",
  "god95448@gmail.com",
  "rifairaiteam@gmail.com"
];

/**
 * Checks if a given email address belongs to an authorized admin.
 * Performs case-insensitive comparison and handles null/undefined safely.
 */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => 
    adminEmail.toLowerCase() === normalizedEmail
  );
}

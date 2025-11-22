/**
 * Local development auth helper - DEPRECATED
 * 
 * Note: This file is no longer needed. Edge functions now use the 'apikey' header
 * which works for unauthenticated access in Supabase local.
 * 
 * Kept for backward compatibility.
 */

export function getAuthToken() {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  return anonKey
}

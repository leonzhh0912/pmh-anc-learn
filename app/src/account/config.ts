/**
 * Accounts are switched on only when a build is given a Supabase project URL and its *publishable* key
 * (both are public by design; access is enforced by the database). The public GitHub Pages build has
 * neither, so it behaves exactly as before: no sign-in, no network calls, progress on the device only.
 * Never put a secret/service-role key in a VITE_ variable: everything VITE_ ends up in the browser.
 */
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const accountsEnabled = Boolean(supabaseUrl && supabasePublishableKey);

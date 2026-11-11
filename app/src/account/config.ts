/**
 * Accounts are switched on only when a build is given a Supabase project URL and its *publishable* key
 * (both are public by design; access is enforced by the database). The public GitHub Pages build has
 * neither, so it behaves exactly as before: no sign-in, no network calls, progress on the device only.
 * Never put a secret/service-role key in a VITE_ variable: everything VITE_ ends up in the browser.
 */
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const accountsEnabled = Boolean(supabaseUrl && supabasePublishableKey);

/**
 * How people sign in (comma list). PMH default (2026-11-11, budget): "password" only, staff-issued
 * patient ID + password, no SMS/email cost. "phone" (SMS code) and "email" (email code) need a paid
 * sender and can be switched on later without code changes.
 */
const methods = ((import.meta.env.VITE_SIGNIN_METHODS as string | undefined) ?? "password")
  .split(",")
  .map((m) => m.trim())
  .filter((m): m is "password" | "phone" | "email" => m === "password" || m === "phone" || m === "email");
export const signinMethods = methods.length ? methods : (["password"] as const);
/** Staff sign in with work email + password (default) or an email code ("email"). Always + authenticator. */
export const staffSignin = ((import.meta.env.VITE_STAFF_SIGNIN as string | undefined) ?? "password") === "email" ? "email" : "password";

/**
 * Sign in before learning (developer for PMH, 2026-11-11: "login before access, so we track everything").
 * Only possible when accounts exist (this build has an account server). Set VITE_REQUIRE_LOGIN=false to let
 * guests learn again. Pages that teach HOW to sign in stay open: sign-in, Lesson 0, help, privacy, about.
 */
export const requireLogin = accountsEnabled && (import.meta.env.VITE_REQUIRE_LOGIN as string | undefined) !== "false";
export const openWithoutLogin = ["/signin", "/start", "/help", "/privacy", "/about", "/poster"];

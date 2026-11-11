import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

// Loaded on demand (dynamic import) so guests on the public build never download it.
export const supabase = createClient(supabaseUrl!, supabasePublishableKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // codes are typed in; no sign-in links
    storageKey: "pmh-anc-learn:auth",
  },
});

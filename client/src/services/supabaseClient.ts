import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseFunctionsUrlRaw = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseClientConfigured = Boolean(supabaseUrl && supabasePublicKey);

export const supabase = isSupabaseClientConfigured
  ? createClient(supabaseUrl!, supabasePublicKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;

const normalizedFunctionsUrl = supabaseFunctionsUrlRaw?.trim()
  ? supabaseFunctionsUrlRaw.trim().replace(/\/+$/, "")
  : null;
const resolvedFunctionsUrl = normalizedFunctionsUrl
  ? normalizedFunctionsUrl.endsWith("/functions/v1")
    ? normalizedFunctionsUrl
    : `${normalizedFunctionsUrl}/functions/v1`
  : null;

if (supabase && resolvedFunctionsUrl) {
  // Override the Edge Functions base URL when a custom host is provided.
  (supabase as unknown as { functionsUrl: URL }).functionsUrl = new URL(resolvedFunctionsUrl);
}

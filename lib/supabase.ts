import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-direct Supabase client (CLAUDE.md §2 rule 1 — no backend service).
 * Only the anon key ships here, ever; RLS in docs/SUPABASE_SCHEMA.sql is what
 * protects it.
 *
 * The client is a lazy singleton so a missing .env.local doesn't crash every
 * page that transitively imports this module — only the review UI calls
 * `getSupabase()`, and it checks `supabaseConfigured` first and renders a
 * fallback instead.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and " +
        "fill in NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from " +
        "Supabase -> Settings -> API.",
    );
  }
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

/**
 * Identity model: Supabase Anonymous Auth (CLAUDE.md §2 rule 2), never a
 * client-invented id. Mints a session on first call; reuses it after.
 * `auth.uid()` in every RLS policy comes from the JWT this produces.
 */
export async function ensureAnonSession(): Promise<string> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    throw new Error(error?.message ?? "Could not start a review session.");
  }
  return data.session.user.id;
}

export { getSupabase };

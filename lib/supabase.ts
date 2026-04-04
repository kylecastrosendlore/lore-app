import { createClient } from "@supabase/supabase-js";

/* ───────────────────────────────────────────
   Supabase Clients

   We use TWO clients:
   1. supabaseAnon — for client-side / limited ops (insert briefs)
   2. supabaseAdmin — for server-side / full access (read, update, delete)

   SECURITY: The service_role key is NEVER exposed to the browser.
   It's only used in API routes (server-side).
   ─────────────────────────────────────────── */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* Client-side safe — limited by RLS */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* Server-side only — bypasses RLS, full access */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

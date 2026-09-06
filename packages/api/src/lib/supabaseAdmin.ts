import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/**
 * Client admin untuk operasi yang tidak bisa dilakukan dengan anon key,
 * satu-satunya: menghapus auth user (dipakai danger zone hapus akun).
 *
 * Service role key melewati RLS dan berkuasa penuh — tidak pernah dikirim
 * ke client, tidak pernah di-log, dan endpoint pemakainya mewajibkan
 * konfirmasi email yang cocok.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    cached = null;
    return cached;
  }

  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return cached;
}

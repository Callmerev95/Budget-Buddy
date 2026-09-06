import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/**
 * Client Supabase untuk sisi server.
 *
 * Wajib stateless: server menangani banyak user dalam satu proses, jadi client
 * tidak boleh menyimpan atau menyegarkan session milik siapa pun.
 * Client lama memakai konfigurasi default yang persist session antar request.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

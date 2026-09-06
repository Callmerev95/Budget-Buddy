import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Client Supabase untuk browser.
 *
 * Auth sepenuhnya ditangani Supabase: signUp, signIn, reset password, dan
 * refresh token. Tidak ada lagi JWT buatan sendiri seperti versi sebelumnya.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

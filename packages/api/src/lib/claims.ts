import type { JWTPayload } from "jose";

/**
 * Nama tampilan dari klaim token Supabase.
 *
 * Client mengisi `user_metadata.full_name` saat signUp. Bila kosong (mis.
 * pengguna lama atau metadata terhapus), kembalikan null dan biarkan
 * pemanggil memutuskan fallback-nya.
 *
 * Modul ini sengaja murni (tanpa env, tanpa database) agar bisa diuji
 * tanpa konfigurasi environment.
 */
export function resolveDisplayName(payload: JWTPayload): string | null {
  if (!payload.user_metadata || typeof payload.user_metadata !== "object") {
    return null;
  }

  const fullName = (payload.user_metadata as Record<string, unknown>).full_name;

  if (typeof fullName !== "string") return null;

  const trimmed = fullName.trim();
  return trimmed.length > 0 ? trimmed : null;
}

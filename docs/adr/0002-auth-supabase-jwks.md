# ADR-0002: Auth Supabase JWT via JWKS

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Aplikasi butuh login; pilihan utama: menulis JWT sendiri, atau memakai
layanan auth eksternal. Budget Buddy adalah aplikasi finansial — sesi yang
dapat dipalsukan adalah risiko reputasi dan data.

## Keputusan

- Login/registrasi diserahkan ke Supabase Auth (email/password, custom SMTP,
  Turnstile CAPTCHA, reset password, PKCE flow).
- API **tidak pernah memproduksi JWT**, dan tidak memakai SDK Supabase server
  untuk memverifikasi setiap request. Sebaliknya, `middleware/auth.ts`
  memverifikasi token via `jose` JWKS:
  - `issuer = {SUPABASE_URL}/auth/v1`, `audience = "authenticated"`.
  - Public keys di-fetch dari `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
    dan dipakai `createRemoteJWKSet` (cache oleh library).
  - Klaim `sub` (auth user id) + `email`/`name` jadi identitas.
- `ensureProfile` memetakan `sub` → baris `User` lokal (transparent),
  menyediakan `getProfileId(req)` untuk semua controller. `requireAuth`
  hanya menjawab "token ini valid", `ensureProfile` menjawab "sediakan profil".

## Konsekuensi

- Tidak ada secret signing mandiri; rotasi kunci Supabase aman.
- SDK anon hanya dipakai web (client). Server memakai JWKS + `fetch` ke
  Admin API hanya untuk hapus akun (service role key, opsional).
- Supabase menjamin keamanan password/login di luar tanggung jawab kita.
- `ensureProfile` membuat user saat belum ada — race `P2002` saat dua
  request bersamaan didokumentasikan di audit Fase A (bug B1) dan ditutup
  di Fase C (re-lookup berurutan + unit test, `ensureProfile.test.ts`).
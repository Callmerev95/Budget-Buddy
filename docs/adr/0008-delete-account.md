# ADR-0008: Hapus akun — email konfirmasi, data dulu lalu auth

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

GDPR-style data erasure dan keluhan "akun saya bocor/menghilang". Dua hal
yang wajib dijamin: (1) akun tidak bisa dihapus oleh orang lain dengan
session yang disuntik (atau klik tunggal), (2) penghapusan tidak meninggalkan
data yatim yang tak bisa diakses — dan tidak menghapus akun tanpa data.

## Keputusan

- `DELETE /api/user/account` mewajibkan body `{ email }` yang cocok
  case-insensitif dengan email profil — satu-satunya konfirmasi manusia
  (selain sesi login itu sendiri). Mismatch → `400 confirmation_mismatch`.
- **Urutan operasi** (penting):
  1. Hapus seluruh data aplikasi dengan cascade `User.delete` (transaksi
     bukan satu atomic, tapi langkah bersih).
  2. Hapus auth user via Supabase Admin API (`deleteUser`).
  3. Jika delete auth gagal (mis. service role key tak terpasang atau
     network), data sudah nol tapi pengguna masih terautentikasi dan bisa
     mencoba lagi. Kebalikannya — auth hilang lebih dulu — menciptakan
     orphan permanen (data x dan login tidak ada). Itulah mengapa urutan
     di atas dipilih.
- Butuh `SUPABASE_SERVICE_ROLE_KEY`; tanpa itu endpoint menjawab
  `503 admin_disabled` (jangan pernah hapus hanya data lokal).

## Konsekuensi

- Flow end-to-end ikut diverifikasi di smoke Fase A: isi email → "Ya, hapus
  permanen" → `POST /api/user/account` → redirect `/login`.
- Orphan-check dilakukan manual via SQL setelah test (baris `auth.users`
  dan `auth.identities` dihapus tambahan bila admin gagal) — itu kasus yang
  dibahas pada audit.
- Kurangi suratan pelengkap: tidak ada tombol hapus tanpa modal konfirmasi
  (bukan `window.confirm` — lihat bug B5).
- Catatan: hapus akun *menghapus* semua; tidak ada "undo". Di Fase D
  tambahkan copy peringatan + waktu tunggu opsional di UI.
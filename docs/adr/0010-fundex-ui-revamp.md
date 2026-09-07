# ADR-0010: Rombak UI mengikuti referensi Fundex (diusulkan)

- **Status:** Diusulkan (Fase D roadmap, belum diimplementasikan)
- **Tanggal:** 2026-09

## Konteks

Produk v2 mengerjakan semua fitur fungsional (Fase 0–5); smoke test Fase A
menghasilkan 30/30. Namun keputusan visual masih "apple-like generik".
Pemilik produk menetapkan referensi visual baru (aplikasi Fundex) dan
meminta UI dirombak agar "persis" menurut referensi itu.

## Keputusan (proposal)

- **Palet & styling**: ganti token `tokens.css` + `tailwind.config.js` agar
  mengikuti palet Fundex (accent hijau/teal, skema yang lebih berani) tanpa
  mengubah `ThemeProvider` (tetap class `dark`).
- **Layout**: pertahankan arsitektur responsif yang sudah ada (sidebar ≥1024,
  bottom-nav + FAB mobile) kecuali referensi Fundex secara eksplisit beda.
  Verifikasi tiap bagian terhadap screenshot referensi.
- **Tidak mengubah** arsitektur ID 1–9: tetap `tokens.css` sebagai satu
  sumber, komponen memakai token bukan hex.
- Dilepas: `window.confirm` (B5), tombol hapus tanpa modal Fundex, dan
  "budget progress bar" yang diganti indikator sesuai referensi.

## Konsekuensi

- Migrasi terisolasi di web (api tak tersentuh); risiko rendah terhadap logika.
- Butuh referensi yang tersedia untuk setiap halaman (diberikan by product
  owner); screenshot Fase A jadi baseline "sebelum".
- Menghindari regresi aksesibilitas: kontras dan `.tnum` wajib tetap
  (pengujian prefer-reduced-motion + keyboard).
- ADR ini stereotipe "diusulkan" sampai Fase D selesai dan divalidasi —
  lalu diganti status Diadopsi dan detail palet dicantumkan.
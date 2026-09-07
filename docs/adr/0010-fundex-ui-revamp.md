# ADR-0010: Rombak UI mengikuti referensi Fundex

- **Status:** Diadopsi (Fase D selesai, divalidasi via compare referensi vs lokal)
- **Tanggal:** 2026-09

## Konteks

Produk v2 mengerjakan semua fitur fungsional (Fase 0–5); smoke test Fase A
menghasilkan 30/30. Namun keputusan visual masih "apple-like generik".
Pemilik produk menetapkan referensi visual baru (aplikasi Fundex,
`https://fundex.demos.tailgrids.com/` — template React JS-rendered yang
butuh browser untuk di-scrape) dan meminta UI dirombak agar "persis"
menurut referensi itu.

## Keputusan

- **Palet & styling**: ganti token `tokens.css` + `tailwind.config.js` dari
  hijau/teal ke **violet** (warna aksen Fundex). `ThemeProvider` tidak
  berubah (tetap class `dark`).
  - `--accent`: teks/ikon — violet-600 terang (124 58 237), violet-400 gelap
    (167 139 250) untuk kontras WCAG AA.
  - `--accent-fill` / `--on-accent-fill`: tombol solid — violet-600 di kedua
    mode dengan teks putih (rasio 5.7:1), dipakai `Button primary`, logo,
    FAB, toggle aktif.
  - `--income` emerald (terang emerald-700, gelap emerald-400),
    `--expense` merah (terang red-600, gelap red-400-sedikit), `--warning`
    amber; `--radius-*`, `--shadow-card`, `--shadow-pop` mengikuti referensi.
- **Layout**: pertahankan arsitektur responsif (sidebar ≥1024, bottom-nav +
  FAB mobile) namun rombak visual mengikuti Fundex:
  - Sidebar tetap kiri seluruh halaman kita (Beranda, Transaksi, Budget,
    Akun, Target) + kelompok sekunder (Laporan, Pengaturan, Notifikasi) +
    kartu profil + **Keluar** merah seperti referensi.
  - Topbar desktop baru (`Topbar.tsx`): pencarian global (mengisi
    `?q=` di halaman Transaksi), toggle tema, lonceng dengan badge belum
    dibaca, avatar profil.
  - Drawer mobile off-canvas dari kiri (bukan dropdown).
  - Nav aktif: `bg-accent/10 text-accent`.
- **Primitif baru** (`components/ui/`): `PageHeader`, `StatCard`
  (label/ikon/ton), `Badge` (pill bertitik), `Tabs` (segmented), `SearchInput`,
  `Avatar` (inisial), `Dialog` (modal tengah, pengganti `window.confirm`
  untuk 5 aksi hapus — B5), `DataTable` (tabel desktop) + baris kartu
  mobile, hook bersama `useModalA11y` (dipakai `Sheet` & `Dialog`).
- **Fitur demo dilewati** (keputusan pemilik produk): tanpa "Upgrade to
  pro", tanpa Export CSV/PDF, tanpa pemilih mata uang USD/EUR/GBP, tanpa
  logo Fundex, tanpa tombol aksi yang tidak punya backend.
- **Pagination tidak dibangun**: pola data kita infinite-scroll cursor
  (tanpa total halaman), jadi tombol "Muat lebih banyak" dipakai baik di
  tabel maupun list, bukan `Pagination` ala Fundex.
- **Tidak mengubah** arsitektur ID 1–9: tetap `tokens.css` sebagai satu
  sumber, komponen memakai token bukan hex (hex hanya untuk warna kategori
  pengguna), matematika uang tetap di server, tanggal tetap lewat helper.

## Konsekuensi

- Migrasi terisolasi di web (api tak tersentuh); risiko rendah terhadap logika.
- Kontras dan `.tnum` tetap dijaga; verifikasi final membandingkan aksibility
  tree + snapshot referensi vs aplikasi di 390×844 dan 1440×900.
- Toggle dekoratif `--on-accent` dipertahankan untuk kompatibilitas; tombol
  solid memakai `--accent-fill` agar teks putih selalu AA di kedua tema.
- Butuh akun smoke test baru (akun lama dihapus baik backend maupun
  Supabase) untuk membuka halaman berbasis data dalam verifikasi browser.
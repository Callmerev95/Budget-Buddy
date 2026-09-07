# Fitur & Alur Penggunaan — Budget Buddy v2

Dokumen ini adalah referensi perilaku aplikasi yang diharapkan, disusun dari
hasil smoke test Fase A (per 2026-09-07) terhadap build lokal. Label tombol
dan label teks memakai yang muncul di aplikasi agar cocok dengan UI aktual.

## Ringkasan Arsitektur

- **Web**: Vite + React 18 + TanStack Query, Tailwind CSS, Recharts.
- **API**: Express 5 + Prisma 7 (Vercel Function). Validasi Zod dari
  `@budget-buddy/shared` di semua batas.
- **DB/auth**: Supabase Postgres (region ap-southeast-1) + JWT Supabase,
  verify via JWKS pada `packages/api/src/middleware/auth.ts`.
- **Tenancy**: guard Prisma wajib scoping `userId` (`lib/prisma.ts` +
  `lib/tenancy.ts`); model `RecurringOccurrence` dikecualikan karena dijangkau
  lewat rule yang ter-scope.
- **Perintah dev**: `npm run dev` (web :5173), `npm run dev:api` (api :5001).

## Navigasi

| Route             | Halaman                | Akses                  |
| ----------------- | ---------------------- | ---------------------- |
| `/login`          | Masuk                  | publik (ok jika auth)  |
| `/register`       | Daftar                 | publik (ok jika auth)  |
| `/forgot-password`| Lupa kata sandi        | publik (ok jika auth)  |
| `/reset-password` | Atur ulang sandi       | publik (ok jika auth)  |
| `/onboarding`     | Onboarding            | wajib setelah login pertama |
| `/dashboard`      | Beranda (ringkasan)    | auth                   |
| `/transactions`   | Transaksi              | auth                   |
| `/budgets`        | Budget (amplop)       | auth                   |
| `/accounts`       | Akun & Tagihan         | auth                   |
| `/goals`          | Target                 | auth                   |
| `/reports`        | Laporan + export CSV   | auth                   |
| `/notifications`  | Notifikasi             | auth                   |
| `/settings`       | Pengaturan             | auth                   |
| `/` dan `*`       | redirect ke `/dashboard` | auth                 |

Layout: **mobile** bottom-nav (Beranda/Transaksi/Budget/Akun/Target) + FAB
`+` (Tambah transaksi) + menu drawer; **desktop ≥1024px** sidebar + topbar.

## Otentikasi & Onboarding

1. **Masuk** — email + kata sandi. Berhasil → `/onboarding` bila profil baru,
   `/dashboard` bila sudah ada. Ambil identitas pakai `getAuth(req)`.
2. **Daftar** — nama + email + sandi; Turnstile aktif di produksi.
3. **Onboarding (2 langkah, `/onboarding`)**
   - Langkah 1: buat akun (nama, jenis Tunai/tabungan/e-wallet, saldo awal).
   - Langkah 2: rencana keuangan (pemasukan bulanan, target tabungan).
   - Selesai → `/dashboard`.

Behavior yang terverifikasi:

- Jatah harian = `(pemasukan − target tabungan) / sisa hari bulan berjalan`.
  Contoh: 5.000.000 − 500.000 = 4.500.000; hari ke-7 dari 30 → 24 hari sisa →
  `Rp 187.500`. Edit plan menaikkan pemasukan → jatah ikut dihitung ulang.
- Sisa budget bulan ini = budget − total EXPENSE bulan ini (pemasukan tidak
  menambahkan budget).

## Transaksi

**Catat (sheet global, FAB `+` / tombol "Tambah transaksi")**

1. Pilih jenis: `Keluar` (EXPENSE) atau `Masuk` (INCOME).
2. Isi Nominal, Deskripsi (wajib, maks 120), Kategori (dropdown seed).
3. `Simpan` → toast "Pemasukan/pengeluaran tersimpan." → muncul di
   dashboard "AKTIVITAS TERBARU" dan daftar Transaksi.

Catatan: sheet memakai akun pertama bila akun tidak dipilih. Tidak ada
pilihan akun di sheet — pertimbangan UX untuk Fase C/D.

**Daftar (`/transactions`)**

- Searchbox "Cari transaksi" filter client-side (substring, case-insensitive).
- Filter: `Semua` / `Keluar` / `Masuk`.
- Hapus: tombol `Hapus <deskripsi>` → `window.confirm` → toast "Transaksi dihapus."
- Jumlah ditampilkan: "N transaksi".

## Transfer antar Akun

1. `/accounts` → tombol `Transfer` → sheet "Transfer antar akun".
2. Pilih `Dari` dan `Ke`, isi Nominal, `Catat transfer` → toast "Transfer tercatat."
3. Server mencatat **dua baris** TRANSFER yang terhubung lewat `transferGroupId`
   (keluar `-50000` di sumber, masuk `+50000` di tujuan).

## Akun

- Daftar akun + jenis (Tunai, dll.) + tagihan menunggu.
- `+ Akun` → nama, jenis, saldo awal → `Simpan`. Saldo awal disimpan di
  kolom `initialBalance` (bukan transaksi).
- Hapus: `Hapus akun <nama>` → `window.confirm`.
- Saldo = `initialBalance` + jumlah transaksi.

## Kategori

- Kategori adalah **seed tetap** di `packages/shared/src/domain/category.ts`
  (6 expense: Makan & Minum, Transportasi, Belanja, Hiburan, Tagihan, Lainnya;
  4 income: Gaji, Bonus, Usaha, Lainnya). Ikon & warna dibaca dari API catalog.
- Tidak ada CRUD kategori di UI. Kategori tambahan lewat
  `POST /api/catalog/categories` bila pemanggilan langsung.

## Budget (Amplop)

1. `/budgets` → `+ Budget` atau "Buat budget pertama" → pilih Kategori + Batas
   bulanan → `Simpan`.
2. Card budget menampilkan "Rp X dari Rp Y".
3. Ambang visual progressbar:
   - < 85%: hijau (`bg-income`)
   - ≥ 85%: amber (`bg-warning`)
   - ≥ 100%: merah (`bg-expense`), teks tetap "Rp 210.000 dari Rp 200.000"
4. Budget per bulan, tidak bergulir otomatis; periode ditulis "Periode 2026-09".
5. Hapus budget tersedia.

## Tagihan Rutin & Pengingat

1. `/accounts` → `+ Tagihan` → nama, nominal, "Jatuh tempo tiap tanggal"
   (dayOfMonth) → `Simpan` → muncul di section "TAGIHAN RUTIN".
2. Engine recurring diproses oleh **cron `/api/cron/daily`** (harus dipanggil
   Vercel Cron; lokal bisa di-trigger manual dengan `Authorization: Bearer $CRON_SECRET`).
   - Belum jatuh tempo → occurrence `PENDING` (masuk daftar "TAGIHAN MENUNGGU").
   - Jatuh tempo + `autoPost:false` → kirim satu notifikasi pengingat
     (idempoten by `(ruleId, periodKey)`).
   - Jatuh tempo + `autoPost:true` → catat transaksi otomatis.
3. `Bayar` pada tagihan menunggu → mencatat EXPENSE bertipe `Pembayaran <nama>`
   terhubung `recurringRuleId`, occurrence jadi `PAID`, tambah notifikasi.
4. `Lewati` (SKIPPED) tersedia untuk occurrence status PENDING.

## Target (Savings Goal)

1. `/goals` → `+ Target` → nama + target nominal → `Simpan`.
2. `+ Nabung` → nominal → `Catat` → `saved += amount`, tampil
   "Rp X dari Rp Y" + "Kurang Rp Z" + date "perkiraan tercapai <tanggal> bila konsisten".
3. Hapus target: `Hapus target <nama>` → `window.confirm`.

> Bug Fase A (sudah diperbaiki secara lokal): `PATCH /api/catalog/goals/:id/progress`
> memakai `savingsGoal.update({ where: { id } })` tanpa `userId`, ditolak guard
> tenancy → top-up selalu gagal 500. Fix: `updateMany({ where: { id, userId } })`.

## Laporan & Export CSV

- `/reports`:
  - Pilih rentang: 3/6/12 bln.
  - "Arus kas per bulan" (tab Masuk/Keluar) — Recharts.
  - "Banding <bulan> → <bulan berikutnya>": pemasukan/pengeluaran + breakdown
    kategori (delta vs bulan lalu).
  - "Rincian bulan ini": persentase per kategori.
- Tombol `CSV` → GET `/api/transactions/export?from=&to=` (JWT) → download
  `budget-buddy-<bulan>.csv` dengan kolom
  `tanggal,jenis,deskripsi,kategori,akun,nominal`.

## Notifikasi

- Badge di ikon/notif menampilkan jumlah belum dibaca.
- `/notifications`: filter `Semua`/`Belum dibaca`, baris belum dibaca
  bertambah counter, `Tandai semua` → toast "Semua ditandai dibaca."
- Tipe notifikasi: `TRANSACTION_RECORDED` (Catatan tersimpan), `PAYMENT_RECEIVED`
  (… berhasil dibayar), `BILL_REMINDER` (Waktunya membayar …), dst.

## Pengaturan

- Profil (email), Tampilan: `Terang`/`Gelap`/`Sistem` (toggle class `dark` di
  `<html>`, tema via `ThemeProvider`).
- Rencana keuangan: Pemasukan bulanan + Target tabungan (`Simpan rencana`),
  cara input Nominal/Persen untuk target.
- Notifikasi: "Nyalakan" pengingat tagihan (toggle).
- `Keluar` (logout).
- `Hapus akunku…` → dialog permanen meminta **email konfirmasi** → `Ya, hapus permanen`
  → hapus seluruh data pengguna (transaksi, budget, target, akun) → redirect `/login`.

## Catatan UX yang jadi masukan Fase C/D

1. Konfirmasi destructive memakai `window.confirm` native (halaman Transaksi,
   Akun, Target). Tidak konsisten dengan UI, memblokir automation, dan gagal
   aksesibilitas → ganti komponen `Dialog`/`AlertDialog` custom.
2. Search transaksi tidak mereset saat field dikosongkan sampai reload.
3. Dashboard "Terpakai hari ini" sempat menghitung pemasukan (fix sudah dibuat:
   hanya EXPENSE).
4. Sheet transaksi tidak menawarkan pilihan akun (selalu akun pertama).
5. `CRON_SECRET` di `.env` lokal memakai literal quotes — dotenv me-strip tapi
   pemanggil manual harus ikut strip.
# Audit Fase A — Hasil Smoke Test & Baseline

Tanggal: 2026-09-07 · Lingkup: build lokal (web :5173, api :5001) terhadap
Supabase project production `budget-buddy` (wfpmscgpjifpbjwfzjpq).

Pendekatan: akun test dibuat via UI, semua fitur dijalankan lewat browser
(agent-browser, headful), output diverifikasi via accessibility tree + query
DB langsung, lalu akun test dihapus dan data dibersihkan.

Matriks hasil dan daftar bug di sini adalah **baseline Fase A**, basis untuk
PR Fase B (dokumentasi), Fase C (alur UX), dan Fase D (rombak UI Fundex).

## Rincian Lingkungan Test

- Test account: `Smoke Tester`, `smoke.rev0907@gmail.com` (dihapus setelah uji).
- Onboarding: akun "Dompet" & "Dompet Test", plan pemasukan 5.000.000 /
  target 500.000; kemudian plan diedit ke 6.000.000/500.000.
- Captcha (Turnstile) & email confirmation **dimatikan di Supabase** selama
  uji (Turnstile gagal issue token di browser otomatis). Wajib dinyalakan lagi.
- `CRON_SECRET` tidak di-commit; cron diuji dengan memanggil
  `/api/cron/daily` manual.

## Matriks Hasil

| # | Fitur / skenario | Hasil | Bukti kunci |
|---|---|---|---|
| 1 | Register + login + email confirm (via SQL) | ✅ | sampai `/dashboard` |
| 2 | Onboarding 2 langkah (akun + plan) | ✅ | 2 akun + plan 5jt/500rb tersimpan |
| 3 | Dashboard: jatah harian | ✅ | 187.500 = (5jt−500rb)/24 hari |
| 4 | Dashboard: sisa budget, empty states | ✅ | 4.475.000→4.990.000 setelah edit plan |
| 5 | Tambah EXPENSE via sheet | ✅ | jatah & sisa budget berubah benar |
| 6 | Tambah INCOME via sheet | ✅ | Rp 350.000 tampil di aktivitas |
| 7 | Daftar transaksi + urutan | ✅ | sorted tanggal desc |
| 8 | Filter Keluar/Masuk | ✅ | "1 transaksi" hanya baris sesuai |
| 9 | Search transaksi | ✅ | "makan siang" → 1 hasil |
| 10 | Hapus transaksi | ✅ | toast + baris hilang |
| 11 | Transfer antar akun | ✅ | 2 lead TRANSFER, satu `transferGroupId` |
| 12 | Akun: buat + saldo awal | ✅ | `initialBalance` tersimpan |
| 13 | Akun: hapus | ✅ | baris hilang |
| 14 | Kategori (seed + ikon/warna) | ✅ | combobox lengkap, API catalog balas |
| 15 | Budget: buat 2 amplop | ✅ | 200.000 & 100.000 |
| 16 | Budget: ambang 85% | ✅ | `bg-warning`, aria-valuenow 85 |
| 17 | Budget: overspend 105% | ✅ | `bg-expense`, teks 210.000/200.000 |
| 18 | Tagihan rutin: buat rule | ✅ | "Tiap tanggal 5 · Rp 150.000" |
| 19 | Cron: generate occurrence + reminder | ✅ | `waiting:1 reminded:1`, notif terkirim |
| 20 | Tagihan: bayar | ✅ | EXPENSE "Pembayaran Listrik PLN" + `recurringRuleId` + occurrence PAID |
| 21 | Notifikasi: badge + list | ✅ | 6 aksi, badge "2"→"6"→hilang |
| 22 | Notifikasi: tandai semua | ✅ | "Semua sudah dibaca." |
| 23 | Laporan: tren + banding + rincian % | ✅ | 58%/42% benar (210/360, 150/360) |
| 24 | Export CSV | ✅ | `/transactions/export` balas CSV utuh |
| 25 | Target: buat | ✅ | "Rp 0 dari Rp 1.000.000" |
| 26 | Target: nabung (top-up) | 🔴→✅ | bug PATCH goals, fix lokal, lalu 250.000 tersimpan + ETA |
| 27 | Target: hapus | ✅ | toast + empty state |
| 28 | Pengaturan: tema Gelap/Terang | ✅ | class `dark` toggle |
| 29 | Pengaturan: edit rencana | ✅ | jatah dihitung ulang ke 222.916 |
| 30 | Pengaturan: hapus akun | ✅ | redirect `/login`, data terkuras |

Hasil akhir: **28/30 langsung PASS**, 2 menemukan bug (26 = fixed lokal, dan
dua bug tambahan di bawah).

## Temuan Bug & Rekomendasi

### B1. `ensureProfile` race P2002 (P1, belum diperbaiki)
- **Gejala**: 5x `prisma:error` di log api — `Unique constraint failed on
  User_email_key` dari `ensureProfile.ts:42` saat burst request pertama
  setelah login (parallel `user.create()`).
- **Dampak**: request kedua gagal walau middleware punya catch P2002 yang
  mengadopsi orphan; log kotor; berpotensi race di produksi Vercel.
- **Rekomendasi**: buat profil dengan pattern upsert/transaksi, atau
  `find` first lalu `create` dalam satu transaction dengan P2002 → refetch.
  Masuk Fase C (fix) dengan unit test.

### B2. Goals top-up ditolak guard tenancy (P1 — FIXED lokal)
- **Gejala**: `PATCH /api/catalog/goals/:id/progress` → 500
  `Query SavingsGoal.update tanpa scoping userId ditolak.`; `saved` tak
  pernah bertambah; UI toast "Gagal mencatat."
- **Akar**: `addGoalProgress` memakai `update({ where: { id } })`; guard
  tenancy (`lib/tenancy.ts`) menuntut `userId` di `where`.
- **Fix (sudah diterapkan)**: `updateMany({ where: { id, userId } })` + cek
  count → NotFound bila 0. Scope terverifikasi: `SavingsGoal` ada di
  `SCOPED_MODELS`; `RecurringOccurrence` tidak (sengaja, via rule ter-scope).

### B3. Dashboard "Terpakai hari ini" menghitung pemasukan (P1 — FIXED lokal)
- **Gejala**: setelah ada INCOME hari itu, "Terpakai hari ini Rp 710.000"
  padahal pengeluaran riil Rp 360.000 (170+40+150).
- **Akar**: `DashboardPage.spentToday` menjumlahkan semua `txn.amount` hari
  ini tanpa filter type (INCOME bertambah dengan tanda +; TRANSFER saling
  hapus). Dampak: "Sisa" bisa lebih dari jatah, persen salah.
- **Fix (sudah diterapkan)**: filter `.type === "EXPENSE"` sebelum sum.
- **Pertimbangan**: apakah transfer keluar dihitung "terpakai"? Desain saat
  ini tidak — dokumentasikan di threshold/decision bila berubah.

### B4. Search transaksi tidak reset (P2, belum diperbaiki)
- **Gejala**: mengosongkan "Cari transaksi" tidak memulihkan daftar sampai
  reload. Setelah hapus + clear, UI tampil "0 transaksi" walau DB 1 baris.
- **Rekomendasi**: reset filter via event/value change yang benar (debounce
  harus melihat nilai kosong), + invalidate query. Masuk Fase C/D.

### B5. `window.confirm` native dihapus (P3)
- Halaman Transaksi, Akun, Target memakai `window.confirm`. Tidak konsisten
  dengan gaya UI baru (Fase D wajib `Dialog`/`AlertDialog`), dan memblokir
  automation (harus `dialog accept` eksplisit). Termasuk blocker a11y.

### Catatan non-bug
- Tagihan `autoPost:false` hanya mengingatkan; `Bayar` manual mencatat
  transaksi — by design.
- `CRON_SECRET` lokal memakai literal quotes di `.env`; dotenv me-strip, jadi
  curl manual harus ikut me-strip.
- Export CSV perlu param `from` & `to` (YYYY-MM-DD), bukan `month`.
- Delete-account menghapus seluruh tabel app dengan benar; akun `auth.users`
  tersisa bila SRK admin tidak valid (dibersihkan manual saat test).

## Screenshot (referensi Fase D)

Disimpan di bawah direktori log sesi (T/opencode/bb-logs):
`mob-*.png` (mobile 390×844): dashboard, transactions, budgets, accounts,
goals, reports, notifications, settings, sheet-tambah-transaksi,
menu-drawer.
`desk-*.png` (desktop 1440×900): halaman sama + sheet-tambah-transaksi.
Topik sesuai permintaan UI Fondasi Fundex (sidebar/topbar desktop, data
table, stat-card, empty states, sheet/dialog).

## Langkah Berikut (Fase B → E)

1. Fase B: dokumentasi (architecture, api, ADR, user-guide) → PR 1.
2. Fase C: fix B1 + B4, alur UX → PR 2.
3. Fase D: rombak UI mengikuti Fundex (palet `tokens.css`, komponen baru
   StatCard/DataTable/PageHeader/Badge/Tabs/Dialog/Pagination/Avatar/Topbar;
   konfirmasi destructive pakai Dialog; desktop sidebar) → PR 3.
4. Fase E: verifikasi akhir + jaga 6 perintah CI hijau.
5. **Ops**: setelah smoke test beres, nyalakan kembali captcha protection &
   email confirmation di Supabase.
# Panduan Pengguna — Budget Buddy v2

Manual pengguna akhir (Bahasa Indonesia). Ikhtisar fitur & alur lengkap ada
di [features-and-flows.md](./features-and-flows.md); dokumen ini fokus
"bagaimana melakukannya" per halaman.

## 1. Mulai

1. Buka app → **Daftar** (nama, email, password). Capaian email konfirmasi
   lalu masuk ke **Onboarding**.
2. Onboarding meminta buat **akun finansial pertama** (nama + saldo awal).
   Tanpa minimal satu akun, app mengarahkan ulang ke `/onboarding`.
3. Di **Pengaturan → Rencana keuangan** isi: pemasukan bulanan, target
   tabungan (nominal atau %), dan biarkan tagihan rutin menyesuaikan
   **jatah harian** otomatis.

> Jatah harian selalu **dihitung server**:
> `(pemasukan − tabungan − tagihan tetap) ÷ sisa hari bulan ini`.

## 2. Dashboard

- **Sisa budget bulan ini**: pemasukan − tabungan − tagihan − yang sudah
  terpakai.
- **Terpakai hari ini**: jumlah transaksi *pengeluaran* hari ini (WIB).
- **Sisa**: `jatah harian − terpakai hari ini`. Bar merah berarti mendekati
  habis; hijau berarti aman.
- Daftar transaksi terbaru; ketuk untuk detail/hapus.

## 3. Transaksi

- **Tambah**: tombol **Tambah transaksi** (FAB di mobile, tombol di
  desktop) → sheet: deskripsi, nominal, kategori, akun, jenis
  Pemasukan/Pengeluaran.
- **Transfer antar akun**: di halaman Akun → **Transfer** — pilih asal,
  tujuan, nominal. Server mencatat dua sisi (keluar −, masuk +); saldo akun
  ikut berubah otomatis.
- **Cari**: kolom pencarian memfilter daftar client-side.
- **Hapus**: swipe/menu → konfirmasi.
- Semua transaksi tercatat dengan tanda waktu WIB; paginasi otomatis saat
  menggulir.

## 4. Akun

Tiga tipe: **Tunai (CASH)**, **Bank (BANK)**, **E-Wallet (EWALLET)**.
- Saldo tampil = saldo awal + semua mutasi (transaksi + transfer).
- Akun yang sudah pernah dipakai transaksi **tidak bisa dihapus**
  (`409 account_in_use`) — arsipkan saja. Kalau belum dipakai, bisa dihapus.

## 5. Kategori

- Disediakan sistem: **Pengeluaran** — Makan & Minum, Transportasi, Belanja,
  Hiburan, Tagihan, Lainnya; **Pemasukan** — Gaji, Bonus, Usaha, Lainnya.
- Buat kategori sendiri (nama + ikon + warna hex) di halaman kategori;
  kategori sistem selalu tersedia untuk semua pengguna.

## 6. Budget (Amplop per Kategori)

- **Buat**: pilih kategori + nominal untuk periode bulan.
- Progress menampilkan `spent / amount`; **warna menandakan**:
  - 0–84% — normal
  - 85% — peringatan mendekati batas
  - 100% — batas tercapai (dan melebihi)
- Data budget tiap bulan berbeda; pilih bulan untuk melihat tampilannya.

## 7. Target Tabungan (Goals)

- Buat target (nama, nominal sasaran, tanggal target opsional, akun opsional).
- **Tambah tabungan**: isi nominal → `saved` bertambah (kuota via
  `updateMany` ter-scope pengguna, jadi aman).
- Progres + estimasi tercapai; hapus target kapan saja.

## 8. Tagihan Rutin (Recurring)

- **Buat tagihan**: nama, nominal, hari jatuh tempo (tanggal bulanan).
- Setiap periode, sistem membuat **occurrence** (instance tagihan) dengan
  status:
  - `PENDING` — akan jatuh tempo (terlihat di daftar tagihan mendatang)
  - `PAID` — terbayar
  - `SKIPPED` — dilewati periode ini
- **Mode**:
  - **Auto-posting**: saat jatuh tempo, sistem otomatis mencatat transaksi
    pengeluaran sebesar nominal.
  - **Non auto-posting**: sistem hanya mengingatkan (notifikasi/push), lalu
    kamu menekan **Bayar**.
- **Bayar** satu occurrence mencatat transaksi `Pembayaran <nama>` dan
  menandai `PAID`; **Lewati** menandai `SKIPPED` tanpa transaksi.
- Cron Vercel menjalankan pengingat ±08:00 WIB setiap hari.

## 9. Pusat Notifikasi

- Berisi: pengingat tagihan (`BILL_DUE`), konfirmasi bayar
  (`PAYMENT_RECEIVED`), tanda terima catatan transaksi
  (`TRANSACTION_RECORDED`).
- Ketuk notifikasi untuk menandai dibaca; **Tandai semua dibaca** di bagian
  atas. Badge unread muncul di menu navigasi.
- Push Web (jika diizinkan) berjalan bersamaan; foto halaman ini dalam
  verifikasi Fase A: `mob-notifications.png` / `desk-notifications.png`.
  Subscription bisa dinonaktifkan di Pengaturan.

## 10. Laporan

- **Tren bulanan**: pemasukan vs pengeluaran per bulan (1–24 bulan).
- **Bandingkan**: bulan tertentu vs bulan sebelumnya — total + per kategori
  (client menghitung delta/persen).
- Batas bulan dihitung di zona waktu pengguna (default WIB).
- **Export CSV**: pilih rentang (maks 366 hari) → file
  `budget-buddy-{from}_{to}.csv` (UTF-8, cocok Excel/Sheets). Berguna juga
  sebagai backup manual karena Free plan Supabase tanpa backup unduhan.
  > 5000 baris dipotong dengan tanda `# TERPOTONG`.

## 11. Pengaturan

- **Profil**: nama & email (dari akun Supabase).
- **Rencana keuangan**: pemasukan, target tabungan, % / nominal → jatah
  harian dihitung ulang.
- **Tampilan**: Terang / Gelap / Sistem.
- **Notifikasi push**: izinkan / cabut (subscription dibuat/diakhiri).
- **Hapus akun** (danger zone): ketik email konfirmasi → **Ya, hapus
  permanen** → data + login dihapus; redirect ke `/login`. Tidak bisa
  dibatalkan.

## 12. Platform

- **PWA**: installable, offline shell, push notification.
- Responsif: **mobile** = bottom navigation + tombol + (FAB); **desktop/tablet
  ≥1024px** = sidebar. Tema mengikuti sistem bila dipilih.
- Aksesibilitas: navigasi keyboard (focus outline), angka tabular pada kolom
  nominal, `prefers-reduced-motion` ditaati.

## 13. Tanya jawab singkat

| Pertanyaan | Jawaban |
| --- | --- |
| Kenapa jatah harian berubah? | Karena pemasukan/tabungan/tagihan berubah atau sisa hari mengecil. |
| Transfer keluar dua baris — kenapa? | Server mencatat dua sisi supaya saldo akun akurat; itu disengaja. |
| Tagihan `PENDING` tidak terbayar sendiri? | Cek modenya; non-autoPost tetap perlu tombol Bayar. |
| Akun tidak bisa dihapus? | Sudah dipakai transaksi — arsipkan. |
| Export dipotong? | Persempit rentang ≤ 5000 baris. |
| Angka tanggal aneh? | Waktu WIB selalu via helper; jangan surat menyalahkan UTC. |
| Hapus akun jalan? | Harus sempurna konfigurasi service role key; kalau tidak → 503. |
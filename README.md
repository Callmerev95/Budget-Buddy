# Budget Buddy

Aplikasi pencatat keuangan personal: jatah harian, tagihan tetap, dan laporan pengeluaran.

> **Status: v2 selesai.** Seluruh fase (0–5) sudah live di produksi.

## Stack

| Lapisan  | Teknologi                                                    |
| -------- | ------------------------------------------------------------ |
| Frontend | Vite, React 18, TypeScript, Tailwind CSS, Recharts           |
| Backend  | Express 5, Prisma 7, dijalankan sebagai Vercel Function       |
| Database | Supabase Postgres (region Singapore)                         |
| Auth     | Supabase Auth, token diverifikasi via JWKS                   |
| Bersama  | Zod di `packages/shared`, satu sumber untuk web dan api       |
| Hosting  | Vercel, satu project, satu origin                            |

## Struktur

```
api/index.ts       Vercel Function untuk seluruh /api/*
apps/web/          Frontend
packages/api/      Express + Prisma
packages/shared/   Skema Zod + tipe domain
prisma/            Skema database
```

Monorepo npm workspaces. Web dan API berbagi origin, jadi tidak ada konfigurasi CORS di produksi.

## Menjalankan secara lokal

Butuh Node.js 20.11+ dan sebuah project Supabase.

```bash
git clone https://github.com/Callmerev95/Budget-Buddy.git
cd Budget-Buddy
npm install

cp .env.example .env      # isi kredensial Supabase
npm run prisma:generate   # wajib sebelum typecheck pertama
npm run prisma:migrate    # menyiapkan skema database

npm run dev:api           # http://localhost:5001
npm run dev               # http://localhost:5173
```

## Perintah

```bash
npm run lint          # eslint
npm run typecheck     # tsc di root + semua workspace
npm test              # vitest
npm run format:check  # prettier
npm run build         # build produksi
```

Keenam perintah itu dijalankan CI pada setiap push dan pull request.

## Fitur

- Jatah harian dihitung server dari pemasukan, target tabungan, tagihan tetap, dan sisa hari bulan berjalan
- Pencatatan pemasukan dan pengeluaran per kategori, dengan akun terpisah (tunai, bank, e-wallet)
- Transfer antar akun yang tercatat dua sisi
- Tagihan rutin dengan pengingat harian, occurrence per periode, dan opsi bayar/lewati
- Budget amplop per kategori dengan peringatan 85% dan 100%
- Target tabungan dengan progres dan estimasi tercapai
- Laporan tren bulanan, rincian kategori, banding dengan bulan lalu, dan export CSV
- Mode terang, gelap, dan mengikuti sistem; layout mobile + desktop
- PWA: install, offline shell, push notification pengingat tagihan
- Hapus akun penuh (data + login) dari Pengaturan

## Peta jalan

| Fase | Isi                                                                      | Status  |
| ---- | ------------------------------------------------------------------------ | ------- |
| 0    | Monorepo, tooling, CI, validasi environment, Express di Vercel            | Selesai |
| 1    | Auth Supabase penuh, custom SMTP, CAPTCHA, pengetatan keamanan            | Selesai |
| 2    | Data model baru: akun, kategori, budget, goals, transaksi berulang        | Selesai |
| 3    | Service layer ter-scope pengguna, matematika uang di server, cron batched | Selesai |
| 4    | Redesign antarmuka, token CSS, layout desktop, aksesibilitas, PWA         | Selesai |
| 5    | Pemasukan, transfer antar akun, ekspor CSV, banding periode               | Selesai |

## Konvensi

Lihat [AGENTS.md](./AGENTS.md) untuk aturan yang ditegakkan: nol `any`, semua query ter-scope `userId`, validasi Zod di batas, matematika uang di server, dan penanganan tanggal khusus zona waktu WIB.

## Batasan yang diketahui

- Vercel Hobby membatasi cron ke sekali sehari dengan presisi ±59 menit, jadi pengingat tagihan tidak bisa mengikuti zona waktu masing-masing pengguna.
- SMTP bawaan Supabase hanya mengirim ke anggota tim project dengan batas 2 email per jam. Custom SMTP diperlukan agar pengguna lain bisa mendaftar.
- Project Supabase pada Free plan dapat dijeda setelah tujuh hari aktivitas rendah.
- Free plan tidak menyediakan backup yang bisa diunduh.

## Lisensi

ISC

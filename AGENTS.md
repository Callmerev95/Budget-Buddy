# AGENTS.md

Konvensi kerja untuk Budget Buddy v2. Baca ini sebelum mengubah kode.

## Perintah

```bash
npm install              # sekali di root, npm workspaces
npm run prisma:generate  # wajib sebelum typecheck pertama
npm run dev              # web di :5173
npm run dev:api          # api di :5001
npm run lint             # eslint, harus 0 error
npm run typecheck        # tsc di root + semua workspace
npm test                 # vitest di semua workspace
npm run format:check     # prettier
npm run build            # build web ke apps/web/dist
```

CI menjalankan keenam perintah verifikasi itu. Jalankan lokal sebelum push.

## Struktur

```
api/index.ts            Vercel Function, mengekspor buildApp() dari packages/api
apps/web/               Frontend Vite + React 18
packages/api/           Express + Prisma. src/app.ts adalah entrypoint yang dipakai bersama
packages/shared/        Skema Zod + tipe domain. Satu sumber untuk web dan api
prisma/schema.prisma    Skema database
prisma.config.ts        Konfigurasi Prisma CLI (Prisma 7)
vercel.json             Region, rewrites, cron
```

Import antar workspace lewat nama paket, bukan path relatif:

```ts
import { createTransactionSchema } from "@budget-buddy/shared"; // benar
import { x } from "../../../shared/src/...";                    // jangan
```

## Aturan yang ditegakkan

- **Nol `any`.** `@typescript-eslint/no-explicit-any` diset error.
- **Nol JWT buatan sendiri.** Auth memverifikasi token Supabase via JWKS di `packages/api/src/middleware/auth.ts`. Ambil identitas dengan `getAuth(req)`, jangan `req.user`.
- **Semua query harus ter-scope `userId`.** Aplikasi multi-user; query tanpa scope membocorkan data antar pengguna.
- **Validasi di batas.** Setiap endpoint yang menerima body memakai `validateBody(schema)` dengan skema dari `@budget-buddy/shared`.
- **Matematika uang di server.** Client tidak pernah mengirim nilai turunan seperti `dailyLimit`. Lihat `packages/api/src/domain/finance.ts`.
- **Tanggal lewat helper.** Pakai `lib/calendar.ts` (api) atau `lib/format.ts` (web). Jangan `toISOString().split('T')[0]` — itu menghasilkan tanggal UTC dan salah untuk WIB.
- **Format mata uang lewat `formatCurrency`.** Jangan panggil `toLocaleString('id-ID')` langsung di komponen.
- **Tanpa proses long-lived.** Vercel Function tidak punya `node-cron`. Penjadwalan lewat Vercel Cron ke `/api/cron/daily`.

## Environment

Semua variabel divalidasi Zod saat boot: `packages/api/src/config/env.ts` dan `apps/web/src/lib/env.ts`. Aplikasi menolak start bila konfigurasi tidak lengkap. Salin `.env.example` ke `.env`.

`DATABASE_URL` memakai Supavisor transaction pooler port `6543` dengan `pgbouncer=true` untuk runtime. `DIRECT_URL` memakai port `5432` untuk migrasi.

## Database

Prisma 7: generator `prisma-client` dengan `output` wajib, dan `PrismaClient` butuh driver adapter. Client ter-generate ke `packages/api/generated/prisma` dan tidak di-commit.

```ts
import { prisma } from "../lib/prisma.js"; // instance tunggal, jangan buat baru
```

## Git

- Conventional commits.
- Jangan push ke `main` langsung.
- Jangan commit `.env`.
- Agent tidak commit tanpa diminta.

## Batasan yang diketahui

- Vercel Hobby membatasi cron ke sekali sehari dengan presisi ±59 menit. `0 1 * * *` UTC = 08:00 WIB.
- Session Supabase disimpan di localStorage, jadi masih rentan XSS. Mitigasinya CSP ketat dan nol `dangerouslySetInnerHTML`.
- Deteksi "tagihan sudah dibayar" di `cron.controller.ts` masih memakai pencocokan teks deskripsi. Tabel `RecurringOccurrence` di Fase 2 akan menggantikannya dengan kunci idempoten.
- Tema lewat `ThemeProvider` (`apps/web/src/theme/`), bukan prop-drilling. Token di `styles/tokens.css`, dipetakan di `tailwind.config.js`.

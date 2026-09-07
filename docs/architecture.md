# Arsitektur — Budget Buddy v2

Gambaran teknis menyeluruh bagi pengembang baru. Untuk perilaku fitur dari
sisi pengguna lihat [features-and-flows.md](./features-and-flows.md); kontrak
HTTP di [api.md](./api.md); keputusan bermotivasi di
[adr/](./adr/README.md).

## 1. Gambaran Besar

Monorepo npm workspaces, satu project Vercel, satu origin. Web dan API
berbagi domain; `vercel.json` me-rewrite `/api/(.*)` ke Vercel Function
`api/index.ts` dan sisanya ke `index.html` (SPA fallback).

```
┌─────────────── Vercel (region sin1) ───────────────┐
│  apps/web/dist (statis, PWA, service worker)       │
│  └─ /api/*  →  api/index.ts (Vercel Function)      │
│                └─ @budget-buddy/api (Express 5)     │
└──────────────────────┬──────────────────────────────┘
                 Supabase (ap-southeast-1)
  ├─ Auth: JWT HS256 → diverifikasi JS side via JWKS
  ├─ Postgres: skema `public` (Prisma)
  └─ Supavisor transaction pooler (port 6543) runtime
     DIRECT_URL port 5432 hanya untuk Prisma CLI (migrasi)
```

Aliran request terautentikasi:

1. Browser menyisipkan `Authorization: Bearer <access_token>` via interceptor
   axios (`apps/web/src/lib/api.ts`); `supabase.auth.getSession()` menyegarkan
   token kedaluwarsa otomatis.
2. `requireAuth` (`middleware/auth.ts`) memverifikasi token terhadap JWKS
   project Supabase (`audience: "authenticated"`, `issuer: {SUPABASE_URL}/auth/v1`).
3. `ensureProfile` (`middleware/ensureProfile.ts`) memastikan baris `User`
   ada; translasi `supabase_id` → `profile_id` terjadi di satu tempat ini.
4. Controller mengambil id dengan `getProfileId(req)` dan meng-query dengan
   `prisma` (client ter-guard tenancy) — semua di-scope `userId`.

## 2. Workspace

| Paket              | Peran                                                        |
| ------------------ | ------------------------------------------------------------ |
| `packages/shared`  | Skema Zod + tipe domain; satu-satunya sumber kontrak antar layer (`@budget-buddy/shared`) |
| `packages/api`     | Express 5 + Prisma 7; semua logika keuangan, recurring engine, notifikasi |
| `apps/web`         | Vite + React 18 + TanStack Query; PWA (vite-plugin-pwa, injectManifest) |
| `api/`             | Vercel Function tipis yang mengekspor `buildApp()`           |
| `prisma/`          | `schema.prisma`, migrasi, seed kategori sistem                |

Impor antar workspace memakai nama paket, bukan path relatif (aturan
AGENTS.md). Semua kode ESM (`"type": "module"`), impor memakai akhiran `.js`.

## 3. Lapisan API (`packages/api/src`)

```
config/env.ts        Validasi Zod environment saat boot; window dotenv naik
                     hingga menemukan .env di root monorepo.
routes/*.ts          Definisi route + pipeline middleware + validate.
controllers/*.ts     Handler HTTP; memakai getProfileId, prisma (ter-guard).
services/recurring   Engine murni tagihan (testable, tanpa DB) + PrismaStore.
domain/finance.ts    Matematika uang murni (jatah harian, due date, dst.).
lib/                 calendar (WIB), tenancy (guard), prisma (extension),
                     notifications (in-app), push (web-push), supabase(A)dmin,
                     references (resolusi nama lama → id), csp.
middleware/          auth (JWKS), ensureProfile, validate (Zod), error.
```

Middleware pipeline per router terautentikasi selalu
`requireAuth → ensureProfile → validate* → handler`. Pengecualian: `/api/push/config`
publik, `/api/cron/daily` — verifikasi `Authorization: Bearer CRON_SECRET`
di dalam controller (`assertCronCaller`).

### 3.1 Prisma 7 + adapter PG

- Generator `prisma-client` dengan `output` wajib
  (`packages/api/generated/prisma`, tidak di-commit).
- `PrismaClient` memakai driver adapter `@prisma/adapter-pg` +
  `DATABASE_URL` (Supavisor transaction pooler, `pgbouncer=true`).
- Satu instance per proses di-cache `globalThis` (sort life serverless warm).
- `prismaSystem` = client tanpa guard (cron/seed/script internal).
  `prisma = prismaSystem.$extends(tenancyGuard)` dipakai semua request handler.

### 3.2 Guard tenancy

Prisma connect sebagai owner DB sehingga RLS Postgres tidak melindungi
antar-pengguna. Lapis struktural menolak query ke model user-owned yang tidak
menyebut `userId`:

- `SCOPED_MODELS` = Transaction, Account, Category, Budget, RecurringRule,
  SavingsGoal, FinancialPlan, Notification.
- create: wajib `userId` di `data`; read/update/delete: wajib `userId` di
  `where` (top-level, atau seluruh cabang `OR`). `NOT` sengaja ditolak.
- User & RecurringOccurrence bebas: User disentuh dengan id turunan server;
  occurrence dijangkau lewat `rule: { userId }` yang sudah ter-scope.
- Pelanggaran → 500 `unscoped_query` (gagal di dev, bukan bocor di prod).

### 3.3 Validasi di batas

`validateBody/Params/Query(schema)` memakai skema dari `@budget-buddy/shared`;
hasil `safeParse` menggantikan `req.body` sehingga controller memegang data
ternormalisasi bertipe. `ZodError` diterjemahkan `errorHandler` menjadi
`400 validation_error` dengan `issues: [{path, message}]`.

Error terpusat `middleware/error.ts`: `ValidationError`(400),
`AppError(status, message, code)` — termasuk `NotFoundError`, detail stack
hanya di non-produksi.

## 4. Web (`apps/web/src`)

```
main.tsx             mount; StrictMode.
App.tsx              QueryClientProvider → ThemeProvider → Toaster → Router;
                     OnboardingGate (redirect /onboarding saat 0 akun) +
                     Shell + AddTransactionSheet global.
pages/              13 halaman: auth publik (Login, Register, ForgotPassword,
                     ResetPassword), Onboarding, dan halaman app (Dashboard,
                     Transactions, Budgets, Accounts, Goals, Reports,
                     Notifications, Settings). Shell menangani 404 SPA.
components/layout/   Shell responsif (sidebar ≥1024px + bottom nav + FAB).
components/ui/       Button, Sheet, Field, AmountInput, Primitives, Money,
                     CategoryIcon, Progress, AddTransactionSheet.
hooks/               useCatalog, useFinance, useNotifications, useRecurring
                     (TanStack Query: queryKeys + invalidations).
theme/               ThemeProvider + ThemeContext (class `dark`).
lib/                 env (Zod), api (axios + interceptor token), query,
                     supabase (PKCE), format (Currency/date WIB), ProtectedRoute.
sw.ts                Service worker: precache + offline shell + push handling.
```

- **Routing**: `react-router-dom`; halaman sheltered di `ProtectedRoute`
  (validates via `getSession`, bukan `localStorage.token`).
- **Tema**: CSS variables RGB di `styles/tokens.css` dimapping
  `tailwind.config.js` (`bg-surface`); class `dark` di `<html>`; tiga mode
  Terang/Gelap/Sistem (localStorage `budget-buddy-theme`, tanpa inline script
  agar aman CSP).
- **State server**: TanStack Query, `staleTime` 30s, cache 5m, retry 1,
  tanpa refetch on window focus. Optimistic delete transaksi dengan rollback.
- **API client**: origin relatif `/api`; interceptor menempel access token
  setiap request.

### 4.1 Ringkasan halaman

| Halaman        | Data (React Query)                                       |
| -------------- | -------------------------------------------------------- |
| Dashboard      | summary, profile, transactions (terbaru), accounts       |
| Transactions   | transaksi infinite cursor, kategorisasi tab/filter       |
| Budgets        | budgets by month, categories                             |
| Accounts       | accounts + balance (+ Tagihan rutin, Transfer sheet)     |
| Goals          | goals + progress mutation                               |
| Reports        | monthly trend, compare, export CSV                      |
| Notifications  | list + unreadCount (badge Shell)                        |
| Settings       | profile, financial plan, theme, push, danger zone        |

## 5. Penanganan Waktu & Uang (aturan keras)

- **Tanggal WIB**: `lib/calendar.ts` (api) & `lib/format.ts` (web) memakai
  `Intl.DateTimeFormat` timeZone `Asia/Jakarta`. Jangan pernah
  `toISOString().split('T')[0]` — itu tanggal UTC, transaksi 00:00–07:00 WIB
  salah. Batas hari/bulan dihitung server via `startOfDayUtc`/`startOfMonthUtc`
  dengan offset dari zona waktu pengguna.
- **Uang**: integer rupiah (`amount: Int`) — IDR tanpa subunit, eksak.
  Matematika (jatah harian, savings efektif, totalFixed) hidup di server
  (`domain/finance.ts`, controller); client tidak pernah menurunkan
  `dailyLimit`. Format tampilan lewat `formatCurrency` saja.

## 6. Tagihan & Cron

- **RecurringRule** (tagihan) adalah template; **RecurringOccurrence** adalah
  instans per periode. Kunci idempoten `@@unique([ruleId, periodKey])`.
- Engine `services/recurring.ts` murni + `EngineStore` abstrak; implementasi
  Prisma (`recurringStore.ts`) memakai `prismaSystem`. Diuji penuh tanpa DB
  (`recurring.test.ts`).
- Alur `processRule` per periode: belum jatuh tempo → occurrence PENDING
  (daftar tagihan mendatang); jatuh tempo + autoPost → transaksi + PAID;
  jatuh tempo tanpa autoPost → notifikasi sekali (`notifiedAt`).
- Vercel Cron `0 1 * * * UTC` → `GET /api/cron/daily` + Bearer CRON_SECRET →
  `runDailyReminders` (batch 200 rule, idempoten; Hobby sekali sehari ±59 mnt,
  jadi WIB 08:00).
- Notifikasi in-app (`recordNotification`) path tidak memblokir response
  (`void`); push `sendPushNotification` fire-and-forget, auto-hapus
  subscription dead (404/410).

## 7. Keamanan

- CSP ketat di produksi (`lib/csp.ts`, `helmet`); dimatikan saat dev untuk HMR.
- Rate limit umum `/api` 120 req/min; body cap 100kb; trust proxy 1.
- Nol `dangerouslySetInnerHTML`; sesi localStorage (mitigasi = CSP, catatan
  risiko di AGENTS.md).
- Hapus akun: email konfirmasi wajib cocok; urutan data app → auth (anti
  orphan); butuh `SUPABASE_SERVICE_ROLE_KEY` (optional; tanpa itu 503).
- Turnstile di daftar/masuk produksi (`apps/web/src/components/auth`).
- Cron dilindungi `CRON_SECRET`. Docker/script internal pakai `prismaSystem`.

## 8. Deployment & Lingkungan

| Variabel                 | Dipakai |
| ------------------------ | ------- |
| `DATABASE_URL`           | api runtime (pooler 6543) |
| `DIRECT_URL`             | Prisma CLI (5432), optional |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | api + web |
| `SUPABASE_SERVICE_ROLE_KEY` | api (hapus akun), optional |
| `APP_URL`                | api (redirect reset password) |
| `CORS_ORIGINS`           | api (dev saja) |
| `VAPID_*`                | api, web push (ketiganya wajib agar aktif) |
| `CRON_SECRET`            | api cron, optional |
| `PORT`                   | api lokal (default 5001; 5000 bertabrakan AirPlay) |
| `VITE_SUPABASE_URL`/`ANON` | web |

Ekspos: variabel `VITE_*` saja yang di-inline Vite; tidak ada kredensial di
bundle.

Deploy: `vercel-build` = `prisma generate` + `build:api` + `build web`.
Vercel Function `maxDuration 60`, include `packages/api/dist/**`.

## 9. Pengujian

Vitest per workspace + jest-dom/jsdom (web). `npm test` menjalankan semua.

| File                          | Cakupan                                        |
| ----------------------------- | ---------------------------------------------- |
| `domain/finance.test.ts`      | jatah harian, savings %, due date clamp        |
| `lib/calendar.test.ts`        | WIB day/month boundary, kabisat                |
| `lib/tenancy.test.ts`         | isScopedQuery whitelist (OR, NOT, create)      |
| `services/recurring.test.ts`  | idempotensi, reminded/posted/waiting, notify sekali |
| `schemas/schemas.test.ts`     | money/amount, transfer, export rentang         |
| `middleware/claims.test.ts`   | resolusi nama dari klaim Supabase              |
| `lib/csp.test.ts`             | direktif CSP produksi                          |
| `app.test.ts`                 | smoke handler (health, error JSON)             |
| `apps/web/src/lib/format.test.ts` | formatCurrency/date WIB                    |

CI menjalankan enam perintah verifikasi (lint, typecheck, test, format:check,
build, prisma:generate) pada setiap push/PR — lihat AGENTS.md.

## 10. Peta file penting

```
prisma/schema.prisma          Model: User, Account, Category, Transaction,
                              Budget, RecurringRule/Occurrence, SavingsGoal,
                              FinancialPlan, Notification.
packages/api/src/lib/prisma.ts        prisma (guard) + prismaSystem.
packages/api/src/lib/tenancy.ts       SCOPED_MODELS + isScopedQuery.
packages/api/src/app.ts               buildApp(), limiter, CORS, CSP.
packages/api/src/services/recurring.ts+kStore   engine + store Prisma.
apps/web/src/styles/tokens.css        design token (target Fase D: palet Fundex).
```
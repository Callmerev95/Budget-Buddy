# ADR-0006: Recurring idempoten + cron Vercel

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Vercel Function tidak punya daemon; tidak ada `node-cron`. Vercel Hobby
hanya mengizinkan cron sekali sehari dengan presisi ±59 menit. Sementara itu,
tagihan bulanan butuh pengingat dan (opsional) posting otomatis yang tepat
per periode — dan tidak boleh dobel setiap kali cron gagal/diulang.

## Keputusan

- **Pola publish-only**: template `RecurringRule` (nama, amount, dayOfMonth,
  autoPost, isActive) + instans `RecurringOccurrence` per periode dengan
  `@@unique([ruleId, periodKey])`. Kunci idempoten menggantikan deteksi lama
  "sudah dibayar lewat substring deskripsi".
- Satu trigger: `GET /api/cron/daily` (Vercel Cron `0 1 * * * UTC` → ±08:00
  WIB), diproteksi `CRON_SECRET`.
- Engine `services/recurring.ts` **murni & testable**: mendefinisikan
  `EngineStore` (interface), `processRule` sekali per rule aktif, batch 200
  per invocation. Implementasi Prisma terpisah (`recurringStore.ts`).
  `recurring.test.ts` memakai store fake in-memory.
- Idempotensi per barengan: occurrence dibuat sekali; kalau sudah
  `PAID`/`SKIPPED`/`notifiedAt` di periode itu → skip.

## Konsekuensi

- Kronk matang di Vercel: run ulang aman (tidak ada duplikasi) — cron yang
  kehabisan waktu 300 detik cukup dijalankan ulang.
- Frekuensi terbatas (sekali sehari) artinya pengingat hanya *hari* jatuh
  tempo, tidak intraday. Ini kondisi lintas-pengguna satu zona WIB; untuk
  granularitas lebih halus butuh plan Pro (cron lebih sering) atau in-app
  timer di client saat app dibuka.
- UI tagihan bekerja pada level `RecurringOccurrence` (`/api/recurring`),
  bukan rule — kata "bayar periode ini" punya makna yang jelas.
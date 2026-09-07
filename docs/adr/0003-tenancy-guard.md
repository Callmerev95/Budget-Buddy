# ADR-0003: Guard tenancy struktural di atas Prisma

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Aplikasi multi-user dengan semua pengguna pada satu database. Prisma connect
sebagai owner DB, sehingga RLS Postgres tidak melindungi antar pengguna.
Selamanya mengandalkan disiplin manual ("ingat tambahkan `userId`") menjamin
satu kelupaan = bocor data antar pengguna.

## Keputusan

- Semua request handler memakai satu Prisma client (*extension*):
  `prisma = prismaSystem.$extends(tenancyGuard)`.
- `lib/tenancy.ts` mendefinisikan `SCOPED_MODELS` (semua model yang user
  punya: Transaction, Account, Category, Budget, RecurringRule, SavingsGoal,
  FinancialPlan, Notification) dan aturan:
  - `create` — `userId` wajib di `data`.
  - `read`/`update`/`delete` — `userId` wajib di `where` (top-level, atau di
    **setiap** cabang `OR`). `NOT` sengaja ditolak.
  - Pelanggaran → throw `500 unscoped_query` (terlihat di dev, bukan bocor
    di prod).
- `User` dan `RecurringOccurrence` dikecualikan dengan alasan: `User`
  disentuh hanya dengan id turunan server; `RecurringOccurrence` dijangkau
  lewat `rule: { userId }` (relasi yang sudah ter-scope).
- Cron/system memakai `prismaSystem` (tanpa guard) — scoping dipindah ke
  pemilih rule aktif milik satu pengguna.

## Konsekuensi

- Guard menolak query yang *lebih mungkin* bug (mis. `where: { id }` tanpa
  user) sebelum mencapai DB.
- Ada beberapa query legal yang wajib trik (mis. report butuh `OR: [{userId},
  {userId: null}]` untuk kategori sistem-seeded); komentar kode menjelaskan
  interaksi ini.
- Guard bukan pengganti review: ia *menaikkan* biaya kesalahan, tidak
  menghapusnya.
- Saat pemakaian `updateMany({ where: { id, userId }})` (goals B2),
  guard menyetujui karena `userId` ada di `where` — dan kode itu benar.
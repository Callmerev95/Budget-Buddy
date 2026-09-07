# ADR-0001: Monorepo npm workspaces + paket shared Zod

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Aplikasi terdiri dari web (Vite/React), API (Express/Prisma), dan database.
Kontrak antara web dan API (skema input, tipe domain, kategori, definisi uang)
adalah titik yang paling sering menyebabkan bug siluman — bentuk yang sama
didefinisikan dua kali dan akhirnya tidak sinkron.

## Keputusan

- Satu repo npm workspaces (`apps/web`, `packages/api`, `packages/shared`).
- Seluruh skema Zod dan tipe domain hidup di `packages/shared`
  (`@budget-buddy/shared`), diimpor web dan api via nama paket — bukan path
  relatif antar workspace.
- Prisma menyimpan `api` dan `shared` sebagai dependensi eksplisit sehingga
  saat di-deploy sebagai satu Vercel Function, tidak ada masalah resolusi.

## Konsekuensi

- Skema diubah di satu tempat: `createTransactionSchema` dipakai validasi api
  *dan* tipe form web. Benefit terukur saat migrasi dari `category: string`
  ke `categoryId: uuid` di ADR-0002/Fase 4.
- Semua workspace memakai ESM; import diberi suffix `.js` agar berjalan di
  Node dan Vite.
- Aturan (AGENTS.md): jangan pernah impor `packages/shared/src/...` lintas
  paket; selalu lewat nama paket.
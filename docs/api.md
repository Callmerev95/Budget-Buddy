# Referensi API — Budget Buddy v2

Kontrak HTTP antar web dan API. Semua endpoint dipasang pada satu origin
`/api/*` (Vercel rewrite). Skema Zod satu-satunya sumber kebenaran di
`packages/shared`; dokumen ini mengikuti apa yang sebenarnya ditegakkan di
batas — bukan tiruan.

## 0. Konvensi Umum

### Auth

Semua endpoint kecuali `/api/health`, `/api/push/config`, dan
`/api/cron/daily` mewajibkan:

```
Authorization: Bearer <supabase-access-token>
```

Token diverifikasi `requireAuth` via JWKS project (`audience: authenticated`,
`issuer: {SUPABASE_URL}/auth/v1`). `ensureProfile` memetakan `sub` → lokal
`user.id` (membuat baris saat belum ada — lihat race di audit B1).

Header tanpa token → `401 unauthorized`. Body/signature tak valid → `401
invalid_token`. Hanya `/api/cron/daily` memakai `CRON_SECRET` (bukan JWT).

### Response format

Sukses: `200/201` JSON mentah atau `{ message?, data }` (dokumenkan per
endpoint). Error selalu:

```json
{ "error": "validation_error" | "not_found" | "conflict" | "...", "message": "..." }
```

`400 validation_error` menyertakan `issues: [{ path: [], message }]`.

| HTTP | Kode error         | Arti                                         |
| ---- | ------------------ | -------------------------------------------- |
| 400  | `validation_error` | gagal skema Zod                              |
| 400  | `confirmation_mismatch` | email konfirmasi hapus akun tidak cocok |
| 401  | `unauthorized` / `invalid_token` | tidak/buruk auth             |
| 404  | `not_found`        | sumber daya ada scoping atau tidak ada       |
| 409  | `occurrence_not_pending`, `account_in_use`, dst. | konflik state  |
| 500  | —                  | kesalahan server (detail hanya non-prod)     |
| 503  | `admin_disabled` / `cron_disabled` | fitur belum dikonfigurasi      |
| 429  | —                  | rate limit umum (120/min/IP)                |

Semua payload body wajib JSON `Content-Type: application/json` (limit 100kb).

### Money & Tanggal

- `amount` selalu **integer rupiah** (≤ `1e12`); `AmountSchema` minimum 1,
  `NonNegativeAmountSchema` minimum 0.
- Tanggal input skema zod: ISO datetime (`periodStart`) atau sudah
  di-`coerce` ke `Date` internal. Tanggal *ranah aplikasi* (hari/bulan WIB)
  dihitung server via `lib/calendar.ts` — client tidak boleh meniru.
- `occurredAt: Date` (`new Date("...")`) di response serialisasi JSON express
  menjadi ISO 8601 UTC.

---

## 1. Health

### `GET /api/health`
Publik. Cek proses hidup.
```json
{ "status": "ok", "timestamp": "2026-09-07T01:00:00.000Z" }
```

---

## 2. User

### `GET /api/user/me`
Profil + jatah harian.
```json
{ "id": "…", "name": "…", "email": "…", "dailyLimit": 50000,
  "monthlyIncome": 5000000, "savingsTarget": 10, "isPercentTarget": true }
```

### `PATCH /api/user/financial-plan`
Body: `financialPlanSchema` → `{ monthlyIncome: int≥0, savingsTarget: int≥0,
isPercentTarget: boolean }`; jika persen, `savingsTarget ≤ 100`.

Server menjumlahkan `RecurringRule` aktif sebagai `totalFixed` lalu menghitung
`dailyLimit` (`domain/finance.ts`) — nilai tidak bisa ditempa client. Response
200 = profil terbaru (bentuk `GET /me`).

### `DELETE /api/user/account`
Hapus akun permanen (data app *lalu* auth; anti-orphan). Body:
`{ email: string }` — harus sama (case-insensitive, trim) dengan email profil.
Membutuhkan `SUPABASE_SERVICE_ROLE_KEY`, tanpa itu `503 admin_disabled`.

---

## 3. Transaksi

### `GET /api/transactions`
Cursor pagination, urut `occurredAt desc, id desc`.

Query: `?limit=1..100` (default 50), `?cursor=<id>`.

```json
{ "data": [
    { "id": "…", "description": "…", "amount": 22000,
      "category": "Makan & Minum", "date": "2026-09-07T00:00:00.000Z",
      "userId": "…", "accountId": "…", "type": "EXPENSE" }
  ],
  "nextCursor": "<id>|null" }
```

`type`: `INCOME|EXPENSE|TRANSFER`. Bentuk lama (category sebagai nama)
dipertahankan; `accountId`/`type` aditif.

### `GET /api/transactions/summary`
Ringkasan bulan berjalan (batas dihitung WIB server).
```json
{ "dailyLimit": 50000, "monthlyIncome": 5000000, "spentThisMonth": 320000,
  "transactionCount": 14, "totalFixed": 500000, "monthlyBudgetFree": 4180000 }
```

### `GET /api/transactions/export`
`?from=YYYY-MM-DD&to=YYYY-MM-DD` (rentang ≤ 366 hari). CSV UTF-8 (BOM):
`tanggal,jenis,deskripsi,kategori,akun,nominal`; >5000 baris dipotong dengan
catatan `# TERPOTONG` di baris akhir.

### `POST /api/transactions`
`createTransactionSchema`: `{ description (1..120, trim), amount (int 1..1e12),
category: ExpenseCategory|IncomeCategory, type?: "INCOME"|"EXPENSE" (default
EXPENSE), accountId? (uuid), categoryId? (uuid) }`.

Kompatibilitas dua arah: client lama kirim nama `category` (→ `resolveCategoryId`,
fallback "Lainnya"); client baru kirim `categoryId` langsung. `accountId`
kosong → akun default "Cash" auto-created. Akun asing → `404`. 201:

```json
{ "message": "Catatan berhasil disimpan.", "data": { "…bentuk list…" } }
```

Memicu notifikasi `TRANSACTION_RECORDED` (in-app + push) tanpa menahan response.

### `POST /api/transactions/transfer`
`createTransferSchema`: `{ fromAccountId, toAccountId (uuid, harus beda),
amount (int >0), description? (≤120, default "Transfer") }`. Validasi kedua
akun milik pengguna (_foreign_ → 404). Transaksi atomik dua baris dengan
`transferGroupId` sama; keluar negatif, masuk positif. 201:
```json
{ "message": "Transfer berhasil dicatat.", "data": { "groupId": "…", "outgoingId": "…", "incomingId": "…" } }
```

### `DELETE /api/transactions/:id`
`deleteMany({ id, userId })`; tak ada → 404. 200 `{ message }`.

---

## 4. Katalog (akun, kategori, budget, target)

### `GET /api/catalog/accounts`
```json
{ "data": [
    { "id": "…", "name": "Cash", "type": "CASH", "initialBalance": 100000,
      "balance": 150000, "sortOrder": 0, "createdAt": "…", "isArchived": false }
  ] }
```
`balance = initialBalance + Σ mutasi bertanda` (transfer keluar negatif,
masuk positif — satu penjumlahan cukup).

### `POST /api/catalog/accounts`
`{ name (1..60), type: "CASH"|"BANK"|"EWALLET", initialBalance? int≥0 }`.
201 `{ message, data: account }`.

### `DELETE /api/catalog/accounts/:id`
Terhapus kecuali sudah dipakai transaksi (Restrict) → `409 account_in_use`
(dengan saran arsipkan). 200 `{ message }`.

### `GET /api/catalog/categories`
Kategori sistem (`userId: null`) + milik pengguna. 200 `{ data: [{ id, name,
kind, icon, color, userId }] }`.

### `POST /api/catalog/categories`
`{ name (1..60), kind: "INCOME"|"EXPENSE", icon? ≤40, color? #rrggbb }`. 201.

### `GET /api/catalog/budgets`
`?month=YYYY-MM` (default bulan berjalan WIB). Tiap budget menyertakan spend
aktual bulan tsb dari transaksi EXPENSE per `categoryId`:
```json
{ "data": [
    { "id": "…", "categoryId": "…", "periodStart": "…", "periodEnd": "…",
      "amount": 1000000, "spent": 850000,
      "category": { "id": "…", "name": "Makan & Minum", "icon": "…", "color": "…" } }
  ] }
```

### `POST /api/catalog/budgets`
`{ categoryId (uuid), periodStart: datetime, periodEnd: datetime, amount: int>0 }`.
Kategori harus sistem/punya → 404. 201.

### `DELETE /api/catalog/budgets/:id`
`deleteMany({ id, userId })`; tak ada → 404.

### `GET /api/catalog/goals`
`{ data: [ { id, name, target, saved, targetDate|null, accountId|null,
createdAt } ] }` (terbaru dulu).

### `POST /api/catalog/goals`
`{ name (1..80), target: int>0, targetDate? datetime, accountId? uuid }`.
Kalau `accountId` discord → 404. 201.

### `PATCH /api/catalog/goals/:id/progress`
`{ amount: int>0 }` → `saved += amount`. Guard tenancy: `updateMany({ where:
{ id, userId } })` (lihat B2). 200 `{ message: "Tabungan tercatat.", data }`;
goal bukan milik → 404.

### `DELETE /api/catalog/goals/:id`
`deleteMany({ id, userId })`; tak ada → 404.

---

## 5. Tagihan (legacy `fixed-expenses`)

`/api/fixed-expenses` adalah jembatan client lama di atas `RecurringRule`
(rule dengan `dayOfMonth`). Client baru memakai `/api/recurring` (level
occurrence).

### `GET /api/fixed-expenses`
`{ data: [ { id, name, amount, dueDate: number (day of month), userId } ] }`.

### `POST /api/fixed-expenses`
`{ name (1..80), amount: int>0, dueDate: 1..31 }`. Dibuat sebagai rule
`frequency: MONTHLY`, kategori "Tagihan", akun default. 201.

### `POST /api/fixed-expenses/:id/pay`
Mencatat transaksi EXPENSE sebesar rule (kategori rule). 201 `{ message, data:
transaction }`. Tidak idempoten (tidak mengubah occurrence) — pakai
`/api/recurring/:id/pay` untuk semantik modern.

### `DELETE /api/fixed-expenses/:id`
`deleteMany({ id, userId })`; tak ada → 404.

---

## 6. Tagihan modern (occurrence)

### `GET /api/recurring`
`?month=YYYY-MM` (default bulan berjalan). Occurrence bersangkutan per rentang
`dueDate` di zona waktu pengguna:
```json
{ "data": [
    { "id": "…", "ruleId": "…", "periodKey": "2026-09", "dueDate": "…",
      "status": "PENDING|PAID|SKIPPED", "transactionId": "…|null",
      "notifiedAt": "…|null",
      "rule": { "id": "…", "name": "…", "amount": 200000 } }
  ] }
```

### `POST /api/recurring/:id/pay`
Hanya milik pengguna (scope `rule.userId`) → bukan milik = 404. Status:
- `PAID` → 200 `{ message: "…sudah dibayar.", data }`
- `SKIPPED` → `409 occurrence_not_pending`
- `PENDING` → transaksi EXPENSE `Pembayaran <name>` + status `PAID` +
  notifikasi `PAYMENT_RECEIVED`. 200.

### `POST /api/recurring/:id/skip`
`PENDING` → `SKIPPED`. `PAID`/`SKIPPED` → `409 occurrence_not_pending`.

---

## 7. Notifikasi

### `GET /api/notifications`
Query: `?limit=1..50` (default 20), `?cursor=<id>`, `?unreadOnly=true`.
Urut `createdAt desc, id desc`. Response:
```json
{ "data": [
    { "id": "…", "type": "BILL_DUE|PAYMENT_RECEIVED|TRANSACTION_RECORDED",
      "title": "…", "body": "…", "readAt": null, "createdAt": "…" }
  ],
  "unreadCount": 3, "nextCursor": "<id>|null" }
```

### `PATCH /api/notifications/read-all`
Tandai semua belum-dibaca → 200 `{ message, count }`.

### `PATCH /api/notifications/:id/read`
`updateMany({ id, userId, readAt: null })`; bukan milik = no-op 200.

---

## 8. Laporan

### `GET /api/reports/monthly`
`?months=1..24` (default 6). Tren N bulan termasuk berjalan, batas WIB:
```json
{ "data": [ { "periodKey": "2026-03", "income": 0, "expense": 0 }, … ] }
```

### `GET /api/reports/compare`
`?month=YYYY-MM`. Bandingkan dgn bulan sebelumnya:
```json
{ "data": {
    "month": "2026-09", "previousMonth": "2026-08",
    "current":  { "income": 5000000, "expense": 1200000 },
    "previous": { "income": 3000000, "expense": 1500000 },
    "deltas":   [ { "name": "Makan & Minum", "current": 500000, "previous": 400000 } ]
  } }
```
Client menghitung persenan delta.

---

## 9. Push (Web Push)

### `GET /api/push/config`
Publik. `VAPID_PUBLIC_KEY` atau `""` / `null` bila belum dikonfigurasi.
```json
{ "vapidPublicKey": "…", "enabled": true }
```

### `POST /api/push/subscription`
Body: subscription Web Push mentah (JSON apa adanya, disimpan di
`User.pushSubscription`). 201/200 `{ message }`. Atur ulang bila `404/410` pada
pengiriman → subscription lama dihapus, perlu daftar ulang.

### `DELETE /api/push/subscription`
Hapus subscription. 200 `{ message }`.

---

## 10. Cron

### `GET /api/cron/daily`
Hanya `Authorization: Bearer ${CRON_SECRET}` (bukan JWT) → selain itu
`401/503`. Memproses hingga 200 rule aktif (`prismaSystem`, idempoten by
`(ruleId, periodKey)`): PENDING jatuh tempo + autoPost → transaksi + PAID +
notifikasi `PAYMENT_RECEIVED`; tanpa autoPost → notifikasi `BILL_DUE` sekali.
```json
{ "ok": true, "date": "2026-09-07", "scanned": 3,
  "waiting": 1, "reminded": 0, "posted": 1, "skipped": 1, "unsupported": 0 }
```

---

## 11. Catatan implementasi

- `asyncHandler` membungkus setiap handler async; `errorHandler` memetakan
  `ZodError`/`AppError`/unknown ke JSON error di atas.
- Semua model user-owned di-scope `userId` dua lapis: `where` eksplisit di
  controller + tenancy guard (`lib/tenancy.ts`) yang menolak query tak-scope
  (500 `unscoped_query`).
- Response `data` pada operasi tanpa pelanggaran biasanya bentuk simpanan
  langsung (`$transaction` return). Kecil dan stabil; skema grafis ada di
  `packages/shared/src/schemas/*`.
- Endpoint legacy (`/fixed-expenses`, `category: nama` pada transaksi)
  dipertahankan sebagai kontrak; *jangan* menambahkan dependensi baru padanya
  dari client baru.
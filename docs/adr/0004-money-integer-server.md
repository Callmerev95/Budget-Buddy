# ADR-0004: Uang integer rupiah, matematika di server

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Rupiah tidak punya subunit (sen) yang lazim; `0.1` rupiah tidak bermakna.
Float untuk uang membuka celah `0.1 + 0.2 != 0.3`, pembulatan tak terduga,
dan klaim "client mengirim dailyLimit" — nilai turunan yang seharusnya
dihitung server.

## Keputusan

- `amount` disimpan dan dikirim sebagai **integer rupiah** (kolom `Int`,
  batas schema `1e12` — jauh di atas kebutuhan realistis).
- Matematika uang (daily allowance, savings efektif, totalFixed, summary,
  saldo akun, tren) hanya hidup di server (`domain/finance.ts`, controller).
  Client **tidak pernah mengirim** nilai turunan seperti `dailyLimit`.
- Satu-satunya perhitungan display di web adalah format (
  `formatCurrency`, Intl `id-ID`) — tanpa perhitungan bisnis.

## Konsekuensi

- Tidak ada error pembulatan di transaksi; perbandingan amount presisi.
- Server adalah satu tempat untuk mengubah aturan finansial (mis. baru
  memperhitungkan `RecurringRule` dalam daily allowance) — tidak perlu sinkron
  dengan klien.
- Migrasi kolom money aman karena skema prisma sudah `Int`.
- UI menampilkan `Rp 12.000` via `formatCurrency`; input amount memakai
  parse dari string rupiah di web.
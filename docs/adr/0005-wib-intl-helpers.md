# ADR-0005: Waktu WIB lewat helper Intl

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Pengguna utama Indonesia (WIB, UTC+7). `new Date().toISOString()` bekerja di
UTC — sebuah transaksi dibayar 00:30 WIB tanggal 1, `toISOString()` menunjuk
*pukul 17:30 UTC 31 bulan sebelumnya*, sehingga "hari ini" jadi salah hari dan
"bulan berjalan" bergeser. Bug kelas ini terkenal di aplikasi keuangan.

## Keputusan

- Semua pembulatan "hari" dan "bulan" memakai helper:
  - API: `lib/calendar.ts` — `toCalendarDay`, `startOfDayUtc`,
    `startOfMonthUtc`, `monthStartUtc`, `shiftMonth`, `toPeriodKey`,
    `daysInMonth`/`remainingDaysInMonth`. Default zona `Asia/Jakarta`;
    `User.timezone` dipakai bila ada (recurring/reports/laporan).
  - Web: `lib/format.ts` — formatting tanggal display.
- Larangan: `toISOString().split('T')[0]` untuk tanggal *ranah aplikasi*
  (dijaga lewat review; hanya dipakai untuk export CSV kolom tanggal yang
  memang ingin UTC-slice).

## Konsekuensi

- Batas hari budget/summary/laporan konsisten antar server dan UI.
- Keep working untuk pengguna lintas zona waktu berbeda (timezone per user).
- Export CSV memakai `occurredAt` UTC-nya (keputusan sengaja; apakah sebaiknya
  WIB jadi follow-up).
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Tanggal kalender (YYYY-MM-DD) menurut zona waktu pengguna.
 *
 * Bug sebelumnya: client membandingkan `new Date().toISOString()` dengan
 * timestamp UTC dari database. Untuk pengguna WIB (UTC+7), transaksi antara
 * 00:00 dan 07:00 masuk ke hitungan hari sebelumnya.
 */
export function toCalendarDay(date: Date, timeZone = JAKARTA_TIME_ZONE): string {
  if (timeZone === JAKARTA_TIME_ZONE) {
    return dayFormatter.format(date);
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

interface CalendarParts {
  year: number;
  month: number;
  day: number;
}

function toCalendarParts(date: Date, timeZone: string): CalendarParts {
  const [year, month, day] = toCalendarDay(date, timeZone).split("-").map(Number);

  return {
    year: year as number,
    month: month as number,
    day: day as number,
  };
}

/** Jumlah hari dalam bulan tersebut. Februari dihitung benar, termasuk tahun kabisat. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Sisa hari pada bulan berjalan, termasuk hari ini.
 *
 * Menggantikan pembagi `30` yang di-hardcode di FinancialPlanModal lama.
 */
export function remainingDaysInMonth(now: Date, timeZone = JAKARTA_TIME_ZONE): number {
  const { year, month, day } = toCalendarParts(now, timeZone);
  return daysInMonth(year, month) - day + 1;
}

/** Awal bulan berjalan sebagai instant UTC, dihitung dari zona waktu pengguna. */
export function startOfMonthUtc(now: Date, timeZone = JAKARTA_TIME_ZONE): Date {
  const { year, month } = toCalendarParts(now, timeZone);
  const offsetMinutes = timeZoneOffsetMinutes(now, timeZone);

  return new Date(Date.UTC(year, month - 1, 1, 0, -offsetMinutes, 0, 0));
}

/** Awal hari berjalan sebagai instant UTC, dihitung dari zona waktu pengguna. */
export function startOfDayUtc(now: Date, timeZone = JAKARTA_TIME_ZONE): Date {
  const { year, month, day } = toCalendarParts(now, timeZone);
  const offsetMinutes = timeZoneOffsetMinutes(now, timeZone);

  return new Date(Date.UTC(year, month - 1, day, 0, -offsetMinutes, 0, 0));
}

/** Selisih menit antara zona waktu tersebut dan UTC pada instant yang diberikan. */
function timeZoneOffsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const lookup = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    lookup("year"),
    lookup("month") - 1,
    lookup("day"),
    lookup("hour") % 24,
    lookup("minute"),
    lookup("second"),
  );

  return Math.round((asUtc - at.getTime()) / 60_000);
}

export { JAKARTA_TIME_ZONE };

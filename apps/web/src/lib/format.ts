/**
 * Satu-satunya formatter mata uang.
 *
 * Sebelumnya `toLocaleString('id-ID')` dipanggil di 14 tempat berbeda dengan
 * prefiks "Rp" yang ditulis manual sebagai JSX terpisah di setiap komponen.
 */
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Contoh: "Rp 1.500.000". */
export function formatCurrency(amount: number): string {
  return rupiahFormatter.format(amount);
}

/** Angka saja tanpa simbol, untuk dipasangkan dengan label "Rp" terpisah. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount);
}

/** Contoh: "1,5 jt". Untuk ruang sempit seperti label grafik. */
export function formatCompactCurrency(amount: number): string {
  return `Rp ${compactFormatter.format(amount)}`;
}

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDayFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatFullDate(value: Date | string): string {
  return dayFormatter.format(new Date(value));
}

export function formatShortDate(value: Date | string): string {
  return shortDayFormatter.format(new Date(value));
}

export function formatTime(value: Date | string): string {
  return timeFormatter.format(new Date(value));
}

/**
 * Tanggal kalender (YYYY-MM-DD) menurut WIB.
 *
 * `toISOString().split('T')[0]` yang dipakai sebelumnya menghasilkan tanggal
 * UTC, sehingga transaksi dini hari WIB dihitung ke hari sebelumnya.
 */
const isoDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toCalendarDay(value: Date | string = new Date()): string {
  return isoDayFormatter.format(new Date(value));
}

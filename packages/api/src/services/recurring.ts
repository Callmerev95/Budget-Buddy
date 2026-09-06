import { effectiveDueDate } from "../domain/finance.js";
import { toCalendarDay } from "../lib/calendar.js";

export type EngineFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface EngineRule {
  id: string;
  userId: string;
  name: string;
  amount: number;
  accountId: string;
  categoryId: string;
  frequency: EngineFrequency;
  dayOfMonth: number;
  endOfMonthClamp: boolean;
  autoPost: boolean;
  isActive: boolean;
}

export interface EngineOccurrence {
  id: string;
  status: "PENDING" | "PAID" | "SKIPPED";
  transactionId: string | null;
  notifiedAt: Date | null;
}

/**
 * Penyimpanan abstrak agar engine bisa diuji tanpa database.
 * Implementasi Prisma ada di bawah; test memakai fake in-memory.
 */
export interface EngineStore {
  findOccurrence(ruleId: string, periodKey: string): Promise<EngineOccurrence | null>;
  createOccurrence(input: {
    ruleId: string;
    periodKey: string;
    dueDate: Date;
  }): Promise<EngineOccurrence>;
  createTransaction(input: {
    description: string;
    amount: number;
    categoryId: string;
    accountId: string;
    userId: string;
    recurringRuleId: string;
  }): Promise<{ id: string }>;
  markPaid(occurrenceId: string, transactionId: string): Promise<void>;
  markNotified(occurrenceId: string, at: Date): Promise<void>;
  notify(userId: string, title: string, body: string): Promise<void>;
}

export type EngineOutcome = "waiting" | "reminded" | "posted" | "skipped" | "unsupported";

/**
 * Kunci idempoten per periode. Menjalankan engine dua kali untuk periode
 * yang sama tidak pernah membuat occurrence ganda — inilah yang menggantikan
 * deteksi "sudah dibayar" via substring deskripsi.
 */
export function computePeriodKey(
  frequency: EngineFrequency,
  year: number,
  month: number,
): string {
  if (frequency === "YEARLY") return `${year}`;
  return `${year}-${String(month).padStart(2, "0")}`;
}

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function toParts(day: string): CalendarDate {
  const [year, month, dayNum] = day.split("-").map(Number);
  return { year: year as number, month: month as number, day: dayNum as number };
}

/**
 * Memproses satu rule untuk periode berjalan.
 *
 * - Rule nonaktif atau frekuensi non-bulanan: dilewati eksplisit.
 * - Belum jatuh tempo: occurrence PENDING dibuat (untuk daftar tagihan
 *   mendatang) tanpa notifikasi.
 * - Jatuh tempo: autoPost mencatat transaksi + menandai PAID, atau kirim
 *   pengingat sekali (notifiedAt) bila autoPost mati.
 * - Sudah PAID / sudah dinotifikasi: dilewati (idempoten).
 */
export async function processRule(
  store: EngineStore,
  rule: EngineRule,
  now: Date,
  timeZone: string,
): Promise<EngineOutcome> {
  if (!rule.isActive) return "skipped";
  if (rule.frequency !== "MONTHLY") return "unsupported";

  const { year, month, day: today } = toParts(toCalendarDay(now, timeZone));
  const periodKey = computePeriodKey(rule.frequency, year, month);
  const dueDay = rule.endOfMonthClamp
    ? effectiveDueDate(rule.dayOfMonth, year, month)
    : rule.dayOfMonth;

  const existing = await store.findOccurrence(rule.id, periodKey);

  if (existing) {
    if (existing.status === "PAID" || existing.status === "SKIPPED") return "skipped";
    if (existing.notifiedAt) return "skipped";
    if (today < dueDay) return "waiting";

    await store.notify(
      rule.userId,
      `Tagihan ${rule.name}`,
      `Waktunya membayar ${rule.name} sebesar Rp ${rule.amount.toLocaleString("id-ID")}.`,
    );
    await store.markNotified(existing.id, now);
    return "reminded";
  }

  const dueDate = new Date(Date.UTC(year, month - 1, dueDay));
  const occurrence = await store.createOccurrence({
    ruleId: rule.id,
    periodKey,
    dueDate,
  });

  if (today < dueDay) return "waiting";

  if (rule.autoPost) {
    const transaction = await store.createTransaction({
      description: `Pembayaran ${rule.name}`,
      amount: rule.amount,
      categoryId: rule.categoryId,
      accountId: rule.accountId,
      userId: rule.userId,
      recurringRuleId: rule.id,
    });
    await store.markPaid(occurrence.id, transaction.id);
    return "posted";
  }

  await store.notify(
    rule.userId,
    `Tagihan ${rule.name}`,
    `Waktunya membayar ${rule.name} sebesar Rp ${rule.amount.toLocaleString("id-ID")}.`,
  );
  await store.markNotified(occurrence.id, now);
  return "reminded";
}

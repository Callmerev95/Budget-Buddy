import { daysInMonth, remainingDaysInMonth } from "../lib/calendar.js";

/**
 * Logika keuangan murni: tanpa akses database maupun environment.
 *
 * Dipisahkan dari controller agar bisa diuji langsung, dan agar test tidak
 * memerlukan koneksi database atau konfigurasi environment lengkap.
 */

export interface DailyAllowanceInput {
  monthlyIncome: number;
  savingsTarget: number;
  isPercentTarget: boolean;
  totalFixed: number;
  now?: Date;
}

/**
 * Jatah harian dihitung di server.
 *
 * Sebelumnya kalkulasi ini ada di FinancialPlanModal pada client dan server
 * menyimpan angka kiriman client tanpa verifikasi, sehingga client bisa
 * mengirim jatah berapa pun. Pembaginya juga di-hardcode 30, membuat Februari
 * dan bulan 31 hari selalu salah.
 */
export function calculateDailyAllowance(input: DailyAllowanceInput): number {
  const savings = input.isPercentTarget
    ? (input.monthlyIncome * input.savingsTarget) / 100
    : input.savingsTarget;

  const spendable = input.monthlyIncome - savings - input.totalFixed;
  const days = remainingDaysInMonth(input.now ?? new Date());

  return Math.max(0, Math.floor(spendable / days));
}

/** Nominal tabungan efektif, baik target berupa persen maupun nominal. */
export function resolveSavingsAmount(
  monthlyIncome: number,
  savingsTarget: number,
  isPercentTarget: boolean,
): number {
  return isPercentTarget
    ? Math.round((monthlyIncome * savingsTarget) / 100)
    : savingsTarget;
}

/**
 * Tanggal jatuh tempo efektif untuk bulan tertentu.
 *
 * Tagihan bertanggal 31 tidak pernah jatuh tempo di Februari pada versi lama
 * karena `dueDate` dibandingkan langsung dengan tanggal hari ini.
 */
export function effectiveDueDate(dueDate: number, year: number, month: number): number {
  return Math.min(dueDate, daysInMonth(year, month));
}

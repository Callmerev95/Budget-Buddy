import type { Request, Response } from "express";
import { compareQuerySchema, monthsQuerySchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import {
  JAKARTA_TIME_ZONE,
  monthStartUtc,
  shiftMonth,
  toCalendarDay,
  toPeriodKey,
} from "../lib/calendar.js";

/**
 * Tren bulanan untuk layar laporan: total pemasukan vs pengeluaran
 * per bulan, N bulan terakhir termasuk bulan berjalan. Batas bulan
 * dihitung di zona waktu pengguna, bukan UTC.
 */
export async function getMonthlyTrend(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { months } = monthsQuerySchema.parse(req.query);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timeZone = user?.timezone || JAKARTA_TIME_ZONE;

  const today = toCalendarDay(new Date(), timeZone);
  const [currentYearText, currentMonthText] = today.split("-");
  const currentYear = Number(currentYearText);
  const currentMonth = Number(currentMonthText);

  const points: Array<{ periodKey: string; income: number; expense: number }> = [];

  for (let back = months - 1; back >= 0; back -= 1) {
    const { year, month } = shiftMonth(currentYear, currentMonth, back);
    const start = monthStartUtc(year, month, timeZone);
    const next = shiftMonth(currentYear, currentMonth, back - 1);
    const end = monthStartUtc(next.year, next.month, timeZone);

    const rows = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, occurredAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    const byType = new Map(rows.map((row) => [row.type, row._sum.amount ?? 0]));
    points.push({
      periodKey: toPeriodKey(year, month),
      income: byType.get("INCOME") ?? 0,
      expense: byType.get("EXPENSE") ?? 0,
    });
  }

  res.status(200).json({ data: points });
}

interface CategoryDelta {
  name: string;
  current: number;
  previous: number;
}

interface MonthSummary {
  income: number;
  expense: number;
  byCategory: Array<{ id: string; name: string; total: number }>;
}

async function summarizeMonth(
  userId: string,
  year: number,
  month: number,
  timeZone: string,
): Promise<MonthSummary> {
  const start = monthStartUtc(year, month, timeZone);
  const next = shiftMonth(year, month, -1);
  const end = monthStartUtc(next.year, next.month, timeZone);

  const [totals, byCategory] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, occurredAt: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", occurredAt: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  const totalByType = new Map(totals.map((row) => [row.type, row._sum.amount ?? 0]));
  const names = await prisma.category.findMany({
    where: { id: { in: byCategory.map((row) => row.categoryId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(names.map((c) => [c.id, c.name]));

  return {
    income: totalByType.get("INCOME") ?? 0,
    expense: totalByType.get("EXPENSE") ?? 0,
    byCategory: byCategory.map((row) => ({
      id: row.categoryId,
      name: nameById.get(row.categoryId) ?? "Lainnya",
      total: row._sum.amount ?? 0,
    })),
  };
}

/**
 * Banding bulan tertentu dengan bulan sebelumnya: total + per kategori.
 * Client menghitung delta dan menampilkannya.
 */
export async function getMonthComparison(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { month } = compareQuerySchema.parse(req.query);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timeZone = user?.timezone || JAKARTA_TIME_ZONE;

  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const m = Number(monthText);
  const prev = shiftMonth(year, m, 1);

  const [current, previous] = await Promise.all([
    summarizeMonth(userId, year, m, timeZone),
    summarizeMonth(userId, prev.year, prev.month, timeZone),
  ]);

  const previousById = new Map(previous.byCategory.map((c) => [c.id, c.total]));
  const deltas: CategoryDelta[] = current.byCategory.map((c) => ({
    name: c.name,
    current: c.total,
    previous: previousById.get(c.id) ?? 0,
  }));

  res.status(200).json({
    data: {
      month,
      previousMonth: toPeriodKey(prev.year, prev.month),
      current: { income: current.income, expense: current.expense },
      previous: { income: previous.income, expense: previous.expense },
      deltas,
    },
  });
}

import type { Request, Response } from "express";
import { monthsQuerySchema } from "@budget-buddy/shared";
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

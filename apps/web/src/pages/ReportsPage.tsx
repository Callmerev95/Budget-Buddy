import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTrend } from "../hooks/useCatalog";
import { useTransactions } from "../hooks/useFinance";
import { useCategories } from "../hooks/useCatalog";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { formatCompactCurrency, toCalendarDay } from "../lib/format";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function monthLabel(periodKey: string): string {
  const [, m] = periodKey.split("-").map(Number);
  return MONTH_LABELS[(m ?? 1) - 1] ?? periodKey;
}

export function ReportsPage() {
  const [months, setMonths] = useState(6);
  const trend = useTrend(months);
  const month = toCalendarDay().slice(0, 7);
  const transactions = useTransactions();
  const categories = useCategories();

  const breakdown = useMemo(() => {
    const all = (transactions.data?.pages ?? []).flatMap((p) => p.data);
    const totals = new Map<string, number>();
    for (const txn of all) {
      if (txn.type !== "EXPENSE") continue;
      if (toCalendarDay(txn.date).slice(0, 7) !== month) continue;
      totals.set(txn.category, (totals.get(txn.category) ?? 0) + txn.amount);
    }
    return [...totals.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions.data, month]);

  const categoryByName = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    for (const c of categories.data ?? [])
      map.set(c.name, { icon: c.icon, color: c.color });
    return map;
  }, [categories.data]);

  const totalMonth = breakdown.reduce((t, b) => t + b.value, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan</h1>
          <p className="text-sm text-muted">Tren dan rincian pengeluaran.</p>
        </div>
        <div role="group" aria-label="Rentang tren" className="flex gap-2">
          {[3, 6, 12].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={months === n}
              onClick={() => setMonths(n)}
              className={`rounded-control px-3 py-1.5 text-sm font-medium transition-colors ${
                months === n
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-2"
              }`}
            >
              {n} bln
            </button>
          ))}
        </div>
      </header>

      <section>
        <SectionHeader title="Arus kas per bulan" />
        <Card className="p-4">
          {trend.isLoading ? (
            <Skeleton className="h-56" />
          ) : !trend.data || trend.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Belum ada data.</p>
          ) : (
            <div
              className="h-56"
              role="img"
              aria-label={`Grafik batang pemasukan vs pengeluaran ${months} bulan terakhir`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trend.data.map((p) => ({ ...p, label: monthLabel(p.periodKey) }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgb(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "rgb(var(--muted))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "rgb(var(--muted))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatCompactCurrency(v)}
                    width={64}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(var(--surface))",
                      border: "1px solid rgb(var(--border))",
                      borderRadius: "14px",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [formatCompactCurrency(Number(value)), ""]}
                  />
                  <Bar
                    dataKey="income"
                    name="Masuk"
                    fill="rgb(var(--income))"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Keluar"
                    fill="rgb(var(--expense))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 flex gap-4 px-1 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-income" aria-hidden="true" />{" "}
              Masuk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-expense" aria-hidden="true" />{" "}
              Keluar
            </span>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Rincian bulan ini" />
        {breakdown.length === 0 ? (
          <EmptyState title="Belum ada pengeluaran bulan ini" />
        ) : (
          <Card className="p-4">
            <div
              className="h-52"
              role="img"
              aria-label="Grafik lingkaran pengeluaran per kategori bulan ini"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {breakdown.map((b) => (
                      <Cell
                        key={b.name}
                        fill={categoryByName.get(b.name)?.color ?? "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(var(--surface))",
                      border: "1px solid rgb(var(--border))",
                      borderRadius: "14px",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 divide-y divide-border">
              {breakdown.map((b) => {
                const meta = categoryByName.get(b.name);
                const pct = totalMonth > 0 ? (b.value / totalMonth) * 100 : 0;
                return (
                  <li key={b.name} className="flex items-center gap-3 py-2.5">
                    <CategoryIcon
                      icon={meta?.icon ?? "shapes"}
                      color={meta?.color ?? "#6b7280"}
                    />
                    <span className="flex-1 text-[15px] font-medium">{b.name}</span>
                    <span className="text-[13px] text-muted">{Math.round(pct)}%</span>
                    <Money amount={b.value} className="text-[15px] font-semibold" />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}

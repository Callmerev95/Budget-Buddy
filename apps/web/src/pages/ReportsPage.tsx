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
import { useTrend, useCompare } from "../hooks/useCatalog";
import { useTransactions } from "../hooks/useFinance";
import { useCategories } from "../hooks/useCatalog";
import { api, toErrorMessage } from "../lib/api";
import { toast } from "sonner";
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
  const [exporting, setExporting] = useState(false);
  const trend = useTrend(months);
  const month = toCalendarDay().slice(0, 7);
  const transactions = useTransactions();
  const categories = useCategories();
  const compare = useCompare(month);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const [y, m] = month.split("-").map(Number) as [number, number];
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const from = `${month}-01`;
      const to = `${month}-${String(lastDay).padStart(2, "0")}`;
      const res = await api.get(`/transactions/export`, {
        params: { from, to },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `budget-buddy-${month}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV diunduh.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal mengekspor CSV."));
    } finally {
      setExporting(false);
    }
  };

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
        <div className="flex gap-2">
          <div role="group" aria-label="Rentang tren" className="flex gap-1">
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
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={exporting}
            className="rounded-control bg-surface-2 px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-border/60 disabled:opacity-50"
          >
            {exporting ? "Mengunduh…" : "CSV"}
          </button>
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
        <SectionHeader
          title={`Banding ${compare.data?.previousMonth ?? ""} → ${month}`}
        />
        <Card className="grid grid-cols-2 gap-4 p-4">
          {[
            {
              label: "Pemasukan",
              now: compare.data?.current.income ?? 0,
              then: compare.data?.previous.income ?? 0,
              invert: false,
            },
            {
              label: "Pengeluaran",
              now: compare.data?.current.expense ?? 0,
              then: compare.data?.previous.expense ?? 0,
              invert: true,
            },
          ].map((row) => {
            const diff = row.now - row.then;
            const good = diff === 0 ? null : row.invert ? diff < 0 : diff > 0;
            return (
              <div key={row.label}>
                <p className="text-[13px] text-muted">{row.label}</p>
                <p className="tnum text-xl font-semibold">
                  <Money amount={row.now} />
                </p>
                <p
                  className={`text-[13px] font-medium ${
                    good === null ? "text-muted" : good ? "text-income" : "text-expense"
                  }`}
                >
                  {diff === 0
                    ? "Sama seperti bulan lalu"
                    : `${diff > 0 ? "+" : "−"}${formatCompactCurrency(Math.abs(diff)).replace("Rp ", "")} vs bulan lalu`}
                </p>
              </div>
            );
          })}
        </Card>
        {(compare.data?.deltas.length ?? 0) > 0 && (
          <Card className="mt-3 divide-y divide-border">
            {compare.data?.deltas.slice(0, 5).map((d) => {
              const diff = d.current - d.previous;
              return (
                <div key={d.name} className="flex items-center gap-3 p-3">
                  <span className="flex-1 truncate text-[15px] font-medium">
                    {d.name}
                  </span>
                  <Money amount={d.current} className="text-[15px] font-semibold" />
                  <span
                    className={`tnum w-20 text-right text-[13px] font-medium ${
                      diff === 0
                        ? "text-muted"
                        : diff > 0
                          ? "text-expense"
                          : "text-income"
                    }`}
                  >
                    {diff === 0
                      ? "±0"
                      : `${diff > 0 ? "+" : "−"}${formatCompactCurrency(Math.abs(diff)).replace("Rp ", "")}`}
                  </span>
                </div>
              );
            })}
          </Card>
        )}
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

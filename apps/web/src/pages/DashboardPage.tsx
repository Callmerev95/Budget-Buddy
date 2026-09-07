import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProfile, useSummary, useTransactions } from "../hooks/useFinance";
import { useOccurrences } from "../hooks/useRecurring";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { Money } from "../components/ui/Money";
import { Progress } from "../components/ui/Progress";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { toCalendarDay, formatCompactCurrency } from "../lib/format";
import { useBudgets, useCategories, useTrend } from "../hooks/useCatalog";

function toneFor(percentage: number): "default" | "warning" | "danger" | "success" {
  if (percentage >= 100) return "danger";
  if (percentage >= 85) return "warning";
  return "default";
}

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

export function DashboardPage() {
  const profile = useProfile();
  const summary = useSummary();
  const transactions = useTransactions();
  const month = toCalendarDay().slice(0, 7);
  const occurrences = useOccurrences(month);
  const budgets = useBudgets(month);
  const categories = useCategories();
  const trend = useTrend(6);

  const recent = useMemo(() => {
    const pages = transactions.data?.pages ?? [];
    return pages.flatMap((p) => p.data).slice(0, 5);
  }, [transactions.data]);
  const categoryByName = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    for (const c of categories.data ?? [])
      map.set(c.name, { icon: c.icon, color: c.color });
    return map;
  }, [categories.data]);

  const upcoming = useMemo(
    () => (occurrences.data ?? []).filter((o) => o.status === "PENDING").slice(0, 3),
    [occurrences.data],
  );

  const strained = useMemo(
    () =>
      (budgets.data ?? [])
        .map((b) => ({ ...b, pct: b.amount > 0 ? (b.spent / b.amount) * 100 : 0 }))
        .filter((b) => b.pct >= 85)
        .slice(0, 3),
    [budgets.data],
  );

  const today = toCalendarDay();
  const spentToday = useMemo(() => {
    const pages = transactions.data?.pages ?? [];
    return pages
      .flatMap((p) => p.data)
      .filter((txn) => toCalendarDay(txn.date) === today && txn.type === "EXPENSE")
      .reduce((total, txn) => total + txn.amount, 0);
  }, [transactions.data, today]);

  if (profile.isError || summary.isError) {
    return (
      <EmptyState
        title="Gagal memuat data"
        description="Periksa koneksi lalu coba lagi."
        action={
          <Button
            onClick={() => {
              void profile.refetch();
              void summary.refetch();
            }}
          >
            Coba lagi
          </Button>
        }
      />
    );
  }

  if (profile.isLoading || summary.isLoading || !summary.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const s = summary.data;
  const remaining = s.dailyLimit - spentToday;
  const percentage = s.dailyLimit > 0 ? (spentToday / s.dailyLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted">Halo, {profile.data?.name ?? "di sana"}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Ringkasan hari ini</h1>
      </header>

      {/* Statistik bulan ini */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Pemasukan bulan ini"
          value={<Money amount={s.monthlyIncome} />}
          tone="success"
          icon={<TrendingUp size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Terpakai bulan ini"
          value={<Money amount={s.spentThisMonth} />}
          tone="danger"
          icon={<TrendingDown size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Sisa budget"
          value={<Money amount={s.monthlyBudgetFree} />}
          tone={s.monthlyBudgetFree >= 0 ? "neutral" : "danger"}
          icon={<Wallet size={16} aria-hidden="true" />}
          meta={s.monthlyBudgetFree < 0 ? "Sudah melewati batas" : "untuk sisa bulan ini"}
        />
      </div>

      {/* Hero jatah harian */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-muted">Jatah harian</p>
            <p className="tnum mt-1 text-4xl font-semibold tracking-tight">
              <Money amount={s.dailyLimit} />
            </p>
            <p className="mt-2 text-sm text-muted">
              Sisa budget bulan ini{" "}
              <Money amount={s.monthlyBudgetFree} className="font-semibold text-text" />
            </p>
          </div>
          <span
            className="flex h-11 w-11 items-center justify-center rounded-card bg-accent/10 text-accent"
            aria-hidden="true"
          >
            <Wallet size={20} />
          </span>
        </div>
        <div className="mt-4">
          <Progress
            value={percentage}
            label={`Terpakai ${Math.round(Math.min(100, Math.max(0, percentage)))} persen dari jatah harian`}
            tone={toneFor(percentage)}
          />
          <p className="mt-2 text-sm text-muted">
            Terpakai hari ini{" "}
            <Money amount={spentToday} className="font-semibold text-text" />
            {" · "}Sisa <Money amount={remaining} className="font-semibold text-text" />
          </p>
        </div>
        <Link
          to="/settings"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent"
        >
          Atur rencana keuangan <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </Card>

      {/* Arus kas */}
      <section>
        <SectionHeader
          title="Arus kas"
          action={
            <Link to="/reports" className="text-sm font-medium text-accent">
              Laporan
            </Link>
          }
        />
        <Card className="p-4">
          {trend.isLoading ? (
            <Skeleton className="h-40" />
          ) : !trend.data || trend.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Belum ada data.</p>
          ) : (
            <div
              className="h-40"
              role="img"
              aria-label="Grafik batang pemasukan vs pengeluaran enam bulan terakhir"
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
                    width={56}
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
        </Card>
      </section>

      {strained.length > 0 && (
        <Card className="flex items-start gap-3 border-warning/40 p-4" role="status">
          <TriangleAlert
            size={18}
            className="mt-0.5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div className="text-sm">
            <p className="font-semibold">{strained.length} budget hampir habis</p>
            <p className="text-muted">
              {strained
                .map((b) => `${b.category.name} (${Math.round(Math.min(100, b.pct))}%)`)
                .join(" · ")}
            </p>
            <Link to="/budgets" className="mt-1 inline-block font-medium text-accent">
              Lihat budget
            </Link>
          </div>
        </Card>
      )}

      {/* Tagihan mendatang */}
      <section>
        <SectionHeader
          title="Tagihan mendatang"
          action={
            <Link to="/accounts" className="text-sm font-medium text-accent">
              Semua
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <Card className="flex items-center gap-3 p-4">
            <BellRing size={18} className="text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">Tidak ada tagihan menunggu bulan ini.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((o) => (
              <Card key={o.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[15px] font-semibold">{o.rule.name}</p>
                  <p className="text-[13px] text-muted">
                    Jatuh tempo {new Date(o.dueDate).getDate()} ·{" "}
                    <Money amount={o.rule.amount} />
                  </p>
                </div>
                <Link
                  to="/accounts"
                  className="rounded-control bg-accent/10 px-3 py-1.5 text-[13px] font-semibold text-accent"
                >
                  Bayar
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Aktivitas terbaru */}
      <section>
        <SectionHeader
          title="Aktivitas terbaru"
          action={
            <Link to="/transactions" className="text-sm font-medium text-accent">
              Semua
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            description="Catat pengeluaran pertamamu dengan tombol +."
          />
        ) : (
          <Card className="divide-y divide-border">
            {recent.map((txn) => {
              const meta = categoryByName.get(txn.category);
              return (
                <div key={txn.id} className="flex items-center gap-3 p-4">
                  <CategoryIcon
                    icon={meta?.icon ?? "shapes"}
                    color={meta?.color ?? "#6b7280"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{txn.description}</p>
                    <p className="text-[13px] text-muted">{txn.category}</p>
                  </div>
                  <Money
                    amount={txn.amount}
                    className="text-[15px] font-semibold text-expense"
                  />
                </div>
              );
            })}
          </Card>
        )}
      </section>
    </div>
  );
}

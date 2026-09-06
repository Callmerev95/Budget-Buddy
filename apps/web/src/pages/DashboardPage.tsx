import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BellRing, Wallet } from "lucide-react";
import { useProfile, useSummary, useTransactions } from "../hooks/useFinance";
import { useOccurrences } from "../hooks/useRecurring";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { Progress } from "../components/ui/Progress";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { toCalendarDay } from "../lib/format";
import { useCategories } from "../hooks/useCatalog";

function toneFor(percentage: number): "default" | "warning" | "danger" | "success" {
  if (percentage >= 100) return "danger";
  if (percentage >= 85) return "warning";
  return "default";
}

export function DashboardPage() {
  const profile = useProfile();
  const summary = useSummary();
  const transactions = useTransactions();
  const month = toCalendarDay().slice(0, 7);
  const occurrences = useOccurrences(month);
  const categories = useCategories();

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

  const today = toCalendarDay();
  const spentToday = useMemo(() => {
    const pages = transactions.data?.pages ?? [];
    return pages
      .flatMap((p) => p.data)
      .filter((txn) => toCalendarDay(txn.date) === today)
      .reduce((total, txn) => total + txn.amount, 0);
  }, [transactions.data, today]);

  if (profile.isError || summary.isError) {
    return (
      <EmptyState
        title="Gagal memuat data"
        description="Periksa koneksi lalu coba lagi."
        action={
          <button
            type="button"
            onClick={() => {
              void profile.refetch();
              void summary.refetch();
            }}
            className="rounded-control bg-accent px-4 py-2 text-sm font-semibold text-on-accent"
          >
            Coba lagi
          </button>
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

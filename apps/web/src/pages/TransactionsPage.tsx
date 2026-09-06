import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteTransaction, useTransactions } from "../hooks/useFinance";
import { useCategories } from "../hooks/useCatalog";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { Button } from "../components/ui/Button";
import { toErrorMessage } from "../lib/api";
import { formatShortDate } from "../lib/format";

export function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const transactions = useTransactions();
  const { data: categories } = useCategories();
  const remove = useDeleteTransaction();

  const categoryByName = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    for (const c of categories ?? []) map.set(c.name, { icon: c.icon, color: c.color });
    return map;
  }, [categories]);

  const items = useMemo(() => {
    const all = (transactions.data?.pages ?? []).flatMap((p) => p.data);
    const q = query.trim().toLowerCase();
    return all.filter((txn) => {
      if (kind !== "ALL" && txn.type !== kind) return false;
      if (
        q &&
        !txn.description.toLowerCase().includes(q) &&
        !txn.category.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [transactions.data, query, kind]);

  const onDelete = async (id: string, description: string) => {
    if (!window.confirm(`Hapus "${description}"?`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Transaksi dihapus.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menghapus transaksi."));
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Transaksi</h1>
        <p className="text-sm text-muted">Semua pemasukan dan pengeluaran.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="txn-search" className="sr-only">
            Cari transaksi
          </label>
          <input
            id="txn-search"
            type="search"
            placeholder="Cari deskripsi atau kategori"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-control border border-border bg-surface py-2.5 pl-11 pr-4 text-[15px] text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>
        <div role="group" aria-label="Filter jenis" className="flex gap-2">
          {(["ALL", "EXPENSE", "INCOME"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                kind === k ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2"
              }`}
            >
              {k === "ALL" ? "Semua" : k === "EXPENSE" ? "Keluar" : "Masuk"}
            </button>
          ))}
        </div>
      </div>

      <section>
        <SectionHeader title={`${items.length} transaksi`} />
        {transactions.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi"
            description={
              query
                ? "Coba kata kunci lain."
                : "Catat transaksi pertamamu dengan tombol +."
            }
          />
        ) : (
          <Card className="divide-y divide-border">
            {items.map((txn) => {
              const meta = categoryByName.get(txn.category);
              const income = txn.type === "INCOME";
              return (
                <div key={txn.id} className="flex items-center gap-3 p-4">
                  <CategoryIcon
                    icon={meta?.icon ?? "shapes"}
                    color={meta?.color ?? "#6b7280"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{txn.description}</p>
                    <p className="text-[13px] text-muted">
                      {txn.category} · {formatShortDate(txn.date)}
                    </p>
                  </div>
                  <Money
                    amount={txn.amount}
                    className={`text-[15px] font-semibold ${income ? "text-income" : "text-expense"}`}
                  />
                  <button
                    type="button"
                    onClick={() => void onDelete(txn.id, txn.description)}
                    aria-label={`Hapus ${txn.description}`}
                    className="rounded-control p-2 text-muted transition-colors hover:bg-expense/10 hover:text-expense"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </Card>
        )}
        {transactions.hasNextPage && (
          <Button
            variant="secondary"
            className="mt-4 w-full"
            loading={transactions.isFetchingNextPage}
            onClick={() => void transactions.fetchNextPage()}
          >
            Muat lebih banyak
          </Button>
        )}
      </section>
    </div>
  );
}

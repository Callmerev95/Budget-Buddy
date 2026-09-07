import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteTransaction, useTransactions } from "../hooks/useFinance";
import { useCategories } from "../hooks/useCatalog";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { Tabs } from "../components/ui/Tabs";
import { DataTable } from "../components/ui/DataTable";
import { Dialog } from "../components/ui/Dialog";
import { EmptyState, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { Button } from "../components/ui/Button";
import { toErrorMessage } from "../lib/api";
import { formatShortDate } from "../lib/format";
import type { Transaction } from "@budget-buddy/shared";

type TxnKind = "ALL" | "EXPENSE" | "INCOME";

export function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [kind, setKind] = useState<TxnKind>("ALL");
  const transactions = useTransactions();
  const { data: categories } = useCategories();
  const remove = useDeleteTransaction();

  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      toast.success("Transaksi dihapus.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menghapus transaksi."));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Transaksi" subtitle="Semua pemasukan dan pengeluaran." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="sm:w-80"
          label="Cari transaksi"
          value={query}
          onChange={setQuery}
          placeholder="Cari deskripsi atau kategori…"
        />
        <Tabs
          className="sm:ml-auto"
          label="Filter jenis transaksi"
          value={kind}
          onChange={setKind}
          options={[
            { value: "ALL", label: "Semua" },
            { value: "EXPENSE", label: "Keluar" },
            { value: "INCOME", label: "Masuk" },
          ]}
        />
      </div>

      <section>
        <h2 className="sr-only">Daftar transaksi</h2>
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
          <>
            <DataTable<Transaction>
              caption="Daftar transaksi"
              className="hidden lg:block"
              columns={[
                {
                  key: "description",
                  header: "Keterangan",
                  render: (txn) => (
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        icon={categoryByName.get(txn.category)?.icon ?? "shapes"}
                        color={categoryByName.get(txn.category)?.color ?? "#6b7280"}
                      />
                      <span className="min-w-0">
                        <p className="truncate font-medium">{txn.description}</p>
                        <p className="text-xs text-muted">{txn.id.slice(0, 8)}</p>
                      </span>
                    </div>
                  ),
                },
                {
                  key: "category",
                  header: "Kategori",
                  render: (txn) => <span className="text-muted">{txn.category}</span>,
                },
                {
                  key: "date",
                  header: "Tanggal",
                  render: (txn) => (
                    <span className="tnum text-muted">{formatShortDate(txn.date)}</span>
                  ),
                },
                {
                  key: "amount",
                  header: "Jumlah",
                  align: "right",
                  render: (txn) => (
                    <Money
                      amount={txn.amount}
                      className={`tnum font-semibold ${txn.type === "INCOME" ? "text-income" : "text-expense"}`}
                    />
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (txn) => (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(txn)}
                      aria-label={`Hapus ${txn.description}`}
                      className="rounded-control p-2 text-muted transition-colors hover:bg-expense/10 hover:text-expense"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  ),
                },
              ]}
              rows={items}
              keyOf={(txn) => txn.id}
              footer={
                transactions.hasNextPage ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    loading={transactions.isFetchingNextPage}
                    onClick={() => void transactions.fetchNextPage()}
                  >
                    Muat lebih banyak
                  </Button>
                ) : undefined
              }
            />

            <ul className="divide-y divide-border rounded-card border border-border bg-surface shadow-card lg:hidden">
              {items.map((txn) => {
                const meta = categoryByName.get(txn.category);
                const income = txn.type === "INCOME";
                return (
                  <li key={txn.id} className="flex items-center gap-3 p-4">
                    <CategoryIcon
                      icon={meta?.icon ?? "shapes"}
                      color={meta?.color ?? "#6b7280"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">
                        {txn.description}
                      </p>
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
                      onClick={() => setDeleteTarget(txn)}
                      aria-label={`Hapus ${txn.description}`}
                      className="rounded-control p-2 text-muted transition-colors hover:bg-expense/10 hover:text-expense"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {transactions.hasNextPage && (
              <Button
                variant="secondary"
                className="mt-4 w-full lg:hidden"
                loading={transactions.isFetchingNextPage}
                onClick={() => void transactions.fetchNextPage()}
              >
                Muat lebih banyak
              </Button>
            )}
          </>
        )}
      </section>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={`Hapus "${deleteTarget?.description ?? ""}"?`}
        description="Transaksi ini akan dihapus permanen dan dihitung ulang di budget, akun, dan laporan."
        destructive
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() => void confirmDelete()}
          >
            Hapus
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

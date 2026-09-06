import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAddBudget,
  useBudgets,
  useCategories,
  useDeleteBudget,
} from "../hooks/useCatalog";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { Progress } from "../components/ui/Progress";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { AmountInput } from "../components/ui/AmountInput";
import { toErrorMessage } from "../lib/api";
import { toCalendarDay } from "../lib/format";

function currentMonth(): string {
  return toCalendarDay().slice(0, 7);
}

export function BudgetsPage() {
  const month = currentMonth();
  const { data, isLoading, isError, refetch } = useBudgets(month);
  const categories = useCategories();
  const add = useAddBudget();
  const remove = useDeleteBudget();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState(0);

  const expenseCategories = (categories.data ?? []).filter((c) => c.kind === "EXPENSE");
  const usedIds = new Set((data ?? []).map((b) => b.categoryId));
  const available = expenseCategories.filter((c) => !usedIds.has(c.id));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Pilih kategori dulu.");
      return;
    }
    if (amount <= 0) {
      toast.error("Nominal harus lebih dari 0.");
      return;
    }
    const [y, m] = month.split("-").map(Number) as [number, number];
    try {
      await add.mutateAsync({
        categoryId,
        periodStart: new Date(Date.UTC(y, m - 1, 1)).toISOString(),
        periodEnd: new Date(Date.UTC(y, m, 1)).toISOString(),
        amount,
      });
      toast.success("Budget dibuat.");
      setCategoryId("");
      setAmount(0);
      setSheetOpen(false);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal membuat budget."));
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
          <p className="text-sm text-muted">Amplop bulanan per kategori.</p>
        </div>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          + Budget
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Gagal memuat budget"
          action={
            <Button size="sm" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          }
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Belum ada budget bulan ini"
          description="Tentukan batas belanja per kategori agar pengeluaran terkendali."
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              Buat budget pertama
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((b) => {
            const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
            return (
              <Card key={b.id} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={b.category.icon} color={b.category.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                      {b.category.name}
                    </p>
                    <p className="text-[13px] text-muted">
                      <Money amount={b.spent} /> dari <Money amount={b.amount} />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`Hapus budget ${b.category.name}?`)) return;
                      void remove.mutateAsync(b.id).catch((err: unknown) => {
                        toast.error(toErrorMessage(err, "Gagal menghapus."));
                      });
                    }}
                    aria-label={`Hapus budget ${b.category.name}`}
                    className="rounded-control p-2 text-muted hover:bg-expense/10 hover:text-expense"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                <Progress
                  value={pct}
                  label={`${b.category.name}: ${Math.round(Math.min(100, Math.max(0, pct)))} persen terpakai`}
                  tone={pct >= 100 ? "danger" : pct >= 85 ? "warning" : "success"}
                />
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Budget baru">
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="budget-category"
              className="ml-1 block text-[13px] font-semibold text-muted"
            >
              Kategori
            </label>
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
            >
              <option value="">Pilih kategori</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <AmountInput label="Batas bulanan" value={amount} onChange={setAmount} />
          <Button type="submit" loading={add.isPending} className="w-full" size="lg">
            Simpan
          </Button>
        </form>
      </Sheet>

      <section>
        <SectionHeader title="Bulan ini" />
        <p className="px-1 text-sm text-muted">
          Periode {month}. Budget dibuat per bulan dan tidak bergulir otomatis.
        </p>
      </section>
    </div>
  );
}

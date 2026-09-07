import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAddGoal,
  useAddGoalProgress,
  useDeleteGoal,
  useGoals,
} from "../hooks/useCatalog";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { Progress } from "../components/ui/Progress";
import { Sheet } from "../components/ui/Sheet";
import { Dialog } from "../components/ui/Dialog";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AmountInput } from "../components/ui/AmountInput";
import { staggerContainer, staggerItem } from "../lib/motion";
import { toErrorMessage } from "../lib/api";
import { formatShortDate } from "../lib/format";

export function GoalsPage() {
  const goals = useGoals();
  const add = useAddGoal();
  const progress = useAddGoalProgress();
  const removeGoal = useDeleteGoal();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [topupId, setTopupId] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama target wajib diisi.");
      return;
    }
    if (target <= 0) {
      toast.error("Target harus lebih dari 0.");
      return;
    }
    try {
      await add.mutateAsync({ name: name.trim(), target });
      toast.success("Target dibuat.");
      setName("");
      setTarget(0);
      setSheetOpen(false);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal membuat target."));
    }
  };

  const topup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupId || topupAmount <= 0) {
      toast.error("Nominal harus lebih dari 0.");
      return;
    }
    try {
      await progress.mutateAsync({ id: topupId, amount: topupAmount });
      toast.success("Tabungan tercatat.");
      setTopupId(null);
      setTopupAmount(0);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal mencatat."));
    }
  };

  const confirmRemove = async () => {
    if (!deleteId) return;
    try {
      await removeGoal.mutateAsync(deleteId);
      toast.success("Target dihapus.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menghapus."));
    } finally {
      setDeleteId(null);
      setDeleteName("");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Target</h1>
          <p className="text-sm text-muted">Tabungan berjangka untuk tujuanmu.</p>
        </div>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          + Target
        </Button>
      </header>

      <section>
        <SectionHeader title="Semua target" />
        {goals.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : !goals.data || goals.data.length === 0 ? (
          <EmptyState
            title="Belum ada target"
            description="Dana darurat, liburan, gadget baru — mulai dari satu."
            action={
              <Button size="sm" onClick={() => setSheetOpen(true)}>
                Buat target pertama
              </Button>
            }
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2"
          >
            {goals.data.map((goal) => {
              const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
              const done = goal.saved >= goal.target;
              const daysSince = Math.max(
                1,
                (Date.now() - new Date(goal.createdAt).getTime()) / 86_400_000,
              );
              const rate = goal.saved / daysSince;
              const remaining = goal.target - goal.saved;
              const eta =
                !done && rate > 0
                  ? new Date(Date.now() + (remaining / rate) * 86_400_000)
                  : null;
              return (
                <motion.div key={goal.id} variants={staggerItem}>
                  <Card className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-control bg-accent/10 text-accent"
                        aria-hidden="true"
                      >
                        <Target size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold">{goal.name}</p>
                        <p className="text-[13px] text-muted">
                          <Money amount={goal.saved} /> dari{" "}
                          <Money amount={goal.target} />
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(goal.id);
                          setDeleteName(goal.name);
                        }}
                        aria-label={`Hapus target ${goal.name}`}
                        className="rounded-control p-2 text-muted hover:bg-expense/10 hover:text-expense"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <Progress
                      value={pct}
                      label={`${goal.name}: ${Math.round(Math.min(100, Math.max(0, pct)))} persen terkumpul`}
                      tone={done ? "success" : "default"}
                    />
                    {!done && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setTopupId(goal.id)}
                      >
                        + Nabung
                      </Button>
                    )}
                    {done ? (
                      <p className="text-sm font-medium text-income">Tercapai.</p>
                    ) : (
                      <p className="text-[13px] text-muted">
                        Kurang <Money amount={remaining} />
                        {goal.targetDate
                          ? ` · target ${formatShortDate(goal.targetDate)}`
                          : eta
                            ? ` · perkiraan tercapai ${formatShortDate(eta)} bila konsisten`
                            : null}
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Target baru">
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <Field
            label="Nama target"
            placeholder="Mis. Dana darurat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
          <AmountInput label="Target nominal" value={target} onChange={setTarget} />
          <Button type="submit" loading={add.isPending} className="w-full" size="lg">
            Simpan
          </Button>
        </form>
      </Sheet>

      <Dialog
        open={deleteId !== null}
        onClose={() => {
          setDeleteId(null);
          setDeleteName("");
        }}
        title={`Hapus target "${deleteName}"?`}
        description="Data kemajuan target ini akan hilang permanen."
        destructive
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteId(null);
              setDeleteName("");
            }}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            loading={removeGoal.isPending}
            onClick={() => void confirmRemove()}
          >
            Hapus
          </Button>
        </div>
      </Dialog>

      <Sheet open={topupId !== null} onClose={() => setTopupId(null)} title="Nabung">
        <form onSubmit={(e) => void topup(e)} className="space-y-4">
          <AmountInput label="Nominal" value={topupAmount} onChange={setTopupAmount} />
          <Button type="submit" loading={progress.isPending} className="w-full" size="lg">
            Catat
          </Button>
        </form>
      </Sheet>
    </div>
  );
}

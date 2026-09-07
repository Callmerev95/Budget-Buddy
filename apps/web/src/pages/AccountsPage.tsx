import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAccounts, useAddAccount, useDeleteAccount } from "../hooks/useCatalog";
import { usePayOccurrence, useOccurrences } from "../hooks/useRecurring";
import { useAddRule, useDeleteRule, useRules, useTransfer } from "../hooks/useFinance";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Money } from "../components/ui/Money";
import { Sheet } from "../components/ui/Sheet";
import { Dialog } from "../components/ui/Dialog";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AmountInput } from "../components/ui/AmountInput";
import { staggerContainer, staggerItem } from "../lib/motion";
import { toErrorMessage } from "../lib/api";
import { toCalendarDay } from "../lib/format";

const ACCOUNT_TYPES = [
  { value: "CASH", label: "Tunai" },
  { value: "BANK", label: "Bank" },
  { value: "EWALLET", label: "E-wallet" },
] as const;

export function AccountsPage() {
  const accounts = useAccounts();
  const rules = useRules();
  const month = toCalendarDay().slice(0, 7);
  const occurrences = useOccurrences(month);
  const addAccount = useAddAccount();
  const deleteAccount = useDeleteAccount();
  const payOccurrence = usePayOccurrence();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"CASH" | "BANK" | "EWALLET">("CASH");
  const [balance, setBalance] = useState(0);
  const addRule = useAddRule();
  const deleteRule = useDeleteRule();
  const [ruleSheetOpen, setRuleSheetOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleAmount, setRuleAmount] = useState(0);
  const [ruleDay, setRuleDay] = useState("1");
  const transfer = useTransfer();
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [deleteAccountTarget, setDeleteAccountTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteRuleTarget, setDeleteRuleTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const pending = (occurrences.data ?? []).filter((o) => o.status === "PENDING");

  const submitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) {
      toast.error("Pilih akun asal dan tujuan.");
      return;
    }
    if (transferAmount <= 0) {
      toast.error("Nominal harus lebih dari 0.");
      return;
    }
    try {
      await transfer.mutateAsync({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: transferAmount,
      });
      toast.success("Transfer tercatat.");
      setTransferAmount(0);
      setTransferOpen(false);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal mencatat transfer."));
    }
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama akun wajib diisi.");
      return;
    }
    try {
      await addAccount.mutateAsync({ name: name.trim(), type, initialBalance: balance });
      toast.success("Akun dibuat.");
      setName("");
      setBalance(0);
      setSheetOpen(false);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal membuat akun."));
    }
  };

  const pay = async (occurrenceId: string, ruleName: string) => {
    try {
      await payOccurrence.mutateAsync(occurrenceId);
      toast.success(`${ruleName} dibayar.`);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal membayar."));
    }
  };

  const confirmRemoveAccount = async () => {
    if (!deleteAccountTarget) return;
    try {
      await deleteAccount.mutateAsync(deleteAccountTarget.id);
      toast.success("Akun dihapus.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menghapus akun."));
    } finally {
      setDeleteAccountTarget(null);
    }
  };

  const submitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      toast.error("Nama tagihan wajib diisi.");
      return;
    }
    if (ruleAmount <= 0) {
      toast.error("Nominal harus lebih dari 0.");
      return;
    }
    const day = Number(ruleDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      toast.error("Tanggal jatuh tempo harus 1–31.");
      return;
    }
    try {
      await addRule.mutateAsync({
        name: ruleName.trim(),
        amount: ruleAmount,
        dueDate: day,
      });
      toast.success("Tagihan rutin dibuat.");
      setRuleName("");
      setRuleAmount(0);
      setRuleDay("1");
      setRuleSheetOpen(false);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal membuat tagihan."));
    }
  };

  const confirmRemoveRule = async () => {
    if (!deleteRuleTarget) return;
    try {
      await deleteRule.mutateAsync(deleteRuleTarget.id);
      toast.success("Tagihan dihapus.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menghapus tagihan."));
    } finally {
      setDeleteRuleTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Akun & Tagihan</h1>
          <p className="text-sm text-muted">Dompetmu dan tagihan yang menunggu.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setTransferOpen(true)}>
            Transfer
          </Button>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            + Akun
          </Button>
        </div>
      </header>

      <section>
        <SectionHeader title="Akun" />
        {accounts.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : !accounts.data || accounts.data.length === 0 ? (
          <EmptyState
            title="Belum ada akun"
            description="Buat akun pertamamu untuk mulai mencatat."
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2"
          >
            {accounts.data.map((acc) => (
              <motion.div key={acc.id} variants={staggerItem}>
                <Card className="flex items-center gap-3 p-4">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-control bg-accent/10 text-accent"
                    aria-hidden="true"
                  >
                    {acc.type === "CASH" ? <Wallet size={18} /> : <Landmark size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{acc.name}</p>
                    <p className="text-[13px] text-muted">
                      {acc.type === "CASH"
                        ? "Tunai"
                        : acc.type === "BANK"
                          ? "Bank"
                          : "E-wallet"}{" "}
                      · <span aria-hidden="true">saldo</span>{" "}
                      <Money amount={acc.balance} className="tnum" />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteAccountTarget({ id: acc.id, name: acc.name })}
                    aria-label={`Hapus akun ${acc.name}`}
                    className="rounded-control p-2 text-muted hover:bg-expense/10 hover:text-expense"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section>
        <SectionHeader title={`Tagihan menunggu (${pending.length})`} />
        {occurrences.isLoading || rules.isLoading ? (
          <Skeleton className="h-24" />
        ) : pending.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted">Tidak ada tagihan menunggu bulan ini.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((o) => (
              <Card key={o.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[15px] font-semibold">{o.rule.name}</p>
                  <p className="text-[13px] text-muted">
                    Jatuh tempo {new Date(o.dueDate).getDate()} ·{" "}
                    <Money amount={o.rule.amount} />
                  </p>
                </div>
                <Button
                  size="sm"
                  loading={payOccurrence.isPending}
                  onClick={() => void pay(o.id, o.rule.name)}
                >
                  Bayar
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Tagihan rutin"
          action={
            <button
              type="button"
              onClick={() => setRuleSheetOpen(true)}
              className="text-sm font-medium text-accent"
            >
              + Tagihan
            </button>
          }
        />
        {rules.isLoading ? (
          <Skeleton className="h-20" />
        ) : !rules.data || rules.data.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted">
              Belum ada tagihan rutin. Tambahkan kos, wifi, atau langganan agar tidak
              terlewat.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rules.data.map((rule) => (
              <Card key={rule.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[15px] font-semibold">{rule.name}</p>
                  <p className="text-[13px] text-muted">
                    Tiap tanggal {rule.dueDate} · <Money amount={rule.amount} />
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteRuleTarget({ id: rule.id, name: rule.name })}
                  aria-label={`Hapus tagihan ${rule.name}`}
                  className="rounded-control p-2 text-muted hover:bg-expense/10 hover:text-expense"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Akun baru">
        <form onSubmit={(e) => void submitAccount(e)} className="space-y-4">
          <Field
            label="Nama akun"
            placeholder="Mis. BCA, GoPay, Dompet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="account-type"
              className="ml-1 block text-[13px] font-semibold text-muted"
            >
              Jenis
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <AmountInput label="Saldo awal" value={balance} onChange={setBalance} />
          <Button
            type="submit"
            loading={addAccount.isPending}
            className="w-full"
            size="lg"
          >
            Simpan
          </Button>
        </form>
      </Sheet>

      <Sheet
        open={ruleSheetOpen}
        onClose={() => setRuleSheetOpen(false)}
        title="Tagihan rutin baru"
      >
        <form onSubmit={(e) => void submitRule(e)} className="space-y-4">
          <Field
            label="Nama tagihan"
            placeholder="Mis. Kos, WiFi, Netflix"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            maxLength={80}
          />
          <AmountInput label="Nominal" value={ruleAmount} onChange={setRuleAmount} />
          <Field
            label="Jatuh tempo tiap tanggal"
            inputMode="numeric"
            placeholder="1–31"
            value={ruleDay}
            onChange={(e) => setRuleDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
            maxLength={2}
          />
          <Button type="submit" loading={addRule.isPending} className="w-full" size="lg">
            Simpan
          </Button>
        </form>
      </Sheet>

      <Sheet
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transfer antar akun"
        description="Dicatat sebagai dua sisi sekaligus."
      >
        <form onSubmit={(e) => void submitTransfer(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="transfer-from"
              className="ml-1 block text-[13px] font-semibold text-muted"
            >
              Dari
            </label>
            <select
              id="transfer-from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
            >
              <option value="">Pilih akun asal</option>
              {(accounts.data ?? []).map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="transfer-to"
              className="ml-1 block text-[13px] font-semibold text-muted"
            >
              Ke
            </label>
            <select
              id="transfer-to"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
            >
              <option value="">Pilih akun tujuan</option>
              {(accounts.data ?? []).map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
          <AmountInput
            label="Nominal"
            value={transferAmount}
            onChange={setTransferAmount}
          />
          <Button type="submit" loading={transfer.isPending} className="w-full" size="lg">
            Catat transfer
          </Button>
        </form>
      </Sheet>

      <Dialog
        open={deleteAccountTarget !== null}
        onClose={() => setDeleteAccountTarget(null)}
        title={`Hapus akun "${deleteAccountTarget?.name ?? ""}"?`}
        description="Saldo dan riwayat akun ini akan dihapus. Transaksi di akun lain tetap utuh."
        destructive
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleteAccountTarget(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            loading={deleteAccount.isPending}
            onClick={() => void confirmRemoveAccount()}
          >
            Hapus
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={deleteRuleTarget !== null}
        onClose={() => setDeleteRuleTarget(null)}
        title={`Hapus tagihan "${deleteRuleTarget?.name ?? ""}"?`}
        description="Aturan tagihan rutin ini akan dihapus. Tagihan bulan ini ikut hilang."
        destructive
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleteRuleTarget(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            loading={deleteRule.isPending}
            onClick={() => void confirmRemoveRule()}
          >
            Hapus
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

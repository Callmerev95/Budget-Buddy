import { useState } from "react";
import { toast } from "sonner";
import { Sheet } from "./Sheet";
import { Field } from "./Field";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { toErrorMessage } from "../../lib/api";
import {
  DEFAULT_EXPENSE_CATEGORY,
  DEFAULT_INCOME_CATEGORY,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@budget-buddy/shared";
import { useAddTransaction } from "../../hooks/useFinance";
import { useAccounts, useCategories } from "../../hooks/useCatalog";

export function AddTransactionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const add = useAddTransaction();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const [isIncome, setIsIncome] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string>(DEFAULT_EXPENSE_CATEGORY);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>();

  const kind = isIncome ? "INCOME" : "EXPENSE";
  const available = categories?.filter((c) => c.kind === kind).map((c) => c.name) ?? [
    ...(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
  ];

  const switchKind = (income: boolean) => {
    setIsIncome(income);
    setCategory(income ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY);
    setError(undefined);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Deskripsi wajib diisi.");
      return;
    }
    if (amount <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }
    setError(undefined);
    try {
      await add.mutateAsync({
        description: description.trim(),
        amount,
        category,
        type: kind,
        ...(accountId ? { accountId } : {}),
      });
      toast.success(isIncome ? "Pemasukan tersimpan." : "Pengeluaran tersimpan.");
      setDescription("");
      setAmount(0);
      setAccountId(undefined);
      onClose();
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menyimpan transaksi."));
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isIncome ? "Catat pemasukan" : "Catat pengeluaran"}
      description={
        accountId ? undefined : "Tersimpan ke akun pertama bila akun tidak dipilih."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2" role="group" aria-label="Jenis transaksi">
          <button
            type="button"
            aria-pressed={!isIncome}
            onClick={() => switchKind(false)}
            className={`flex-1 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
              !isIncome ? "bg-expense/10 text-expense" : "text-muted hover:bg-surface-2"
            }`}
          >
            Keluar
          </button>
          <button
            type="button"
            aria-pressed={isIncome}
            onClick={() => switchKind(true)}
            className={`flex-1 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
              isIncome ? "bg-income/10 text-income" : "text-muted hover:bg-surface-2"
            }`}
          >
            Masuk
          </button>
        </div>
        <AmountInput label="Nominal" value={amount} onChange={setAmount} />
        <Field
          label="Deskripsi"
          placeholder={isIncome ? "Mis. gaji bulanan" : "Mis. makan siang"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={120}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="txn-category"
            className="ml-1 block text-[13px] font-semibold text-muted"
          >
            Kategori
          </label>
          <select
            id="txn-category"
            value={available.includes(category) ? category : (available[0] ?? "")}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
          >
            {available.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="txn-account"
            className="ml-1 block text-[13px] font-semibold text-muted"
          >
            Akun
          </label>
          <select
            id="txn-account"
            value={accountId ?? ""}
            onChange={(e) =>
              setAccountId(e.target.value === "" ? undefined : e.target.value)
            }
            className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
          >
            <option value="">
              {accounts && accounts.length > 1 ? "Otomatis (akun pertama)" : "Otomatis"}
            </option>
            {(accounts ?? []).map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p role="alert" className="ml-1 text-[13px] font-medium text-expense">
            {error}
          </p>
        )}
        <Button type="submit" loading={add.isPending} className="w-full" size="lg">
          Simpan
        </Button>
      </form>
    </Sheet>
  );
}

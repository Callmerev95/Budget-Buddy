import { useState } from "react";
import { toast } from "sonner";
import { Sheet } from "./Sheet";
import { Field } from "./Field";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { toErrorMessage } from "../../lib/api";
import { DEFAULT_EXPENSE_CATEGORY, EXPENSE_CATEGORIES } from "@budget-buddy/shared";
import { useAddTransaction } from "../../hooks/useFinance";
import { useCategories } from "../../hooks/useCatalog";

export function AddTransactionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const add = useAddTransaction();
  const { data: categories } = useCategories();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string>(DEFAULT_EXPENSE_CATEGORY);
  const [error, setError] = useState<string | undefined>();

  const expenseCategories = categories
    ?.filter((c) => c.kind === "EXPENSE")
    .map((c) => c.name) ?? [...EXPENSE_CATEGORIES];

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
      await add.mutateAsync({ description: description.trim(), amount, category });
      toast.success("Transaksi tersimpan.");
      setDescription("");
      setAmount(0);
      onClose();
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menyimpan transaksi."));
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Catat pengeluaran"
      description="Tersimpan ke akun Cash bila akun tidak dipilih."
    >
      <form onSubmit={submit} className="space-y-4">
        <AmountInput label="Nominal" value={amount} onChange={setAmount} />
        <Field
          label="Deskripsi"
          placeholder="Mis. makan siang"
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
          >
            {expenseCategories.map((name) => (
              <option key={name} value={name}>
                {name}
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

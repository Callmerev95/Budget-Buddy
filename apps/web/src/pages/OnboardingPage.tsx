import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAddAccount } from "../hooks/useCatalog";
import { useSavePlan } from "../hooks/useFinance";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AmountInput } from "../components/ui/AmountInput";
import { toErrorMessage } from "../lib/api";

/**
 * Alur pertama kali: akun pertama + rencana keuangan.
 * Ditampilkan bila pengguna belum punya akun.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const addAccount = useAddAccount();
  const savePlan = useSavePlan();
  const [step, setStep] = useState(0);

  const [accountName, setAccountName] = useState("Dompet");
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);

  const busy = addAccount.isPending || savePlan.isPending;

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      toast.error("Nama akun wajib diisi.");
      return;
    }
    try {
      await addAccount.mutateAsync({
        name: accountName.trim(),
        type: "CASH",
        initialBalance: 0,
      });
      setStep(1);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal membuat akun."));
    }
  };

  const saveAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePlan.mutateAsync({
        monthlyIncome: income,
        savingsTarget: savings,
        isPercentTarget: false,
      });
      toast.success("Siap. Selamat datang di Budget Buddy.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menyimpan rencana."));
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-hero bg-accent text-on-accent"
          aria-hidden="true"
        >
          <Wallet size={28} />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {step === 0 ? "Mulai dengan satu akun" : "Atur rencana bulanan"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {step === 0
            ? "Langkah 1 dari 2 — bisa tambah lagi nanti."
            : "Langkah 2 dari 2 — bisa diubah kapan saja."}
        </p>
      </div>

      {step === 0 ? (
        <form onSubmit={(e) => void createAccount(e)} className="space-y-4">
          <Field
            label="Nama akun pertama"
            placeholder="Mis. Dompet, BCA, GoPay"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            maxLength={60}
          />
          <Button type="submit" loading={busy} size="lg" className="w-full">
            Lanjut <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void saveAndFinish(e)} className="space-y-4">
          <AmountInput label="Pemasukan bulanan" value={income} onChange={setIncome} />
          <AmountInput label="Target tabungan" value={savings} onChange={setSavings} />
          <Button type="submit" loading={busy} size="lg" className="w-full">
            Selesai
          </Button>
        </form>
      )}
    </div>
  );
}

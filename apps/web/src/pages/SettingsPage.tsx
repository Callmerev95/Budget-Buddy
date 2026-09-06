import { useEffect, useState } from "react";
import { Bell, BellOff, LogOut, Moon, Sun, SunMoon } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useSavePlan } from "../hooks/useFinance";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AmountInput } from "../components/ui/AmountInput";
import { toErrorMessage, api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { useTheme, type Theme } from "../theme/theme-context";
import { useNavigate } from "react-router-dom";

const THEMES: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: SunMoon },
];

function urlSafeBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new Uint8Array(bytes.buffer as ArrayBuffer, bytes.byteOffset, bytes.length);
}

export function SettingsPage() {
  const profile = useProfile();
  const savePlan = useSavePlan();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [isPercent, setIsPercent] = useState(false);
  const [pushState, setPushState] = useState<"unknown" | "on" | "off" | "unsupported">(
    "unknown",
  );
  const [pushBusy, setPushBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setIncome(profile.data.monthlyIncome);
      setSavings(profile.data.savingsTarget);
      setIsPercent(profile.data.isPercentTarget);
    }
  }, [profile.data]);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPushState("unsupported");
      return;
    }
    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushState(sub ? "on" : "off"))
      .catch(() => setPushState("off"));
  }, []);

  const saveFinancialPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePlan.mutateAsync({
        monthlyIncome: income,
        savingsTarget: savings,
        isPercentTarget: isPercent,
      });
      toast.success("Rencana keuangan disimpan.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menyimpan."));
    }
  };

  const togglePush = async () => {
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await api.delete("/push/subscription");
        setPushState("off");
        toast.success("Notifikasi dimatikan.");
        return;
      }
      if (Notification.permission === "denied") {
        toast.error("Izin notifikasi diblokir browser. Ubah di pengaturan situs.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Izin notifikasi tidak diberikan.");
        return;
      }
      const { data } = await api.get<{ enabled: boolean; publicKey: string | null }>(
        "/push/config",
      );
      if (!data.enabled || !data.publicKey) {
        toast.error("Push belum dikonfigurasi di server.");
        return;
      }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlSafeBase64ToUint8Array(data.publicKey),
      });
      await api.post("/push/subscription", subscription.toJSON());
      setPushState("on");
      toast.success("Notifikasi diaktifkan.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal mengubah notifikasi."));
    } finally {
      setPushBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const submitDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await api.delete("/user/account", { data: { email: deleteEmail } });
      await supabase.auth.signOut();
      toast.success("Akun dihapus. Sampai jumpa.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menghapus akun."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted">{profile.data?.email ?? ""}</p>
      </header>

      <section>
        <SectionHeader title="Tampilan" />
        <Card className="grid grid-cols-3 gap-2 p-2" role="group" aria-label="Pilih tema">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-1.5 rounded-control px-3 py-3 text-[13px] font-medium transition-colors ${
                theme === value
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-2"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </Card>
      </section>

      <section>
        <SectionHeader title="Rencana keuangan" />
        {profile.isLoading ? (
          <Skeleton className="h-64" />
        ) : profile.isError ? (
          <EmptyState title="Gagal memuat profil" />
        ) : (
          <Card className="p-4">
            <form onSubmit={(e) => void saveFinancialPlan(e)} className="space-y-4">
              <AmountInput
                label="Pemasukan bulanan"
                value={income}
                onChange={setIncome}
              />
              <div className="flex gap-2" role="group" aria-label="Jenis target tabungan">
                <button
                  type="button"
                  aria-pressed={!isPercent}
                  onClick={() => setIsPercent(false)}
                  className={`flex-1 rounded-control px-3 py-2 text-sm font-medium ${
                    !isPercent
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface-2"
                  }`}
                >
                  Nominal
                </button>
                <button
                  type="button"
                  aria-pressed={isPercent}
                  onClick={() => setIsPercent(true)}
                  className={`flex-1 rounded-control px-3 py-2 text-sm font-medium ${
                    isPercent
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface-2"
                  }`}
                >
                  Persen
                </button>
              </div>
              <AmountInput
                label={isPercent ? "Target tabungan (persen)" : "Target tabungan"}
                value={savings}
                onChange={setSavings}
                hint={isPercent ? "0–100, dihitung dari pemasukan." : undefined}
              />
              <Button type="submit" loading={savePlan.isPending} className="w-full">
                Simpan rencana
              </Button>
            </form>
          </Card>
        )}
      </section>

      <section>
        <SectionHeader title="Notifikasi" />
        <Card className="flex items-center gap-3 p-4">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-control bg-accent/10 text-accent"
            aria-hidden="true"
          >
            {pushState === "on" ? <Bell size={18} /> : <BellOff size={18} />}
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">Pengingat tagihan</p>
            <p className="text-[13px] text-muted">
              {pushState === "unsupported"
                ? "Browser ini tidak mendukung push."
                : pushState === "on"
                  ? "Aktif di perangkat ini."
                  : "Mati. Nyalakan untuk pengingat jatuh tempo."}
            </p>
          </div>
          {pushState !== "unsupported" && (
            <Button
              variant="secondary"
              size="sm"
              loading={pushBusy}
              onClick={() => void togglePush()}
            >
              {pushState === "on" ? "Matikan" : "Nyalakan"}
            </Button>
          )}
        </Card>
      </section>

      <section>
        <SectionHeader title="Akun" />
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[15px] font-semibold">
                {profile.data?.name ?? "Pengguna"}
              </p>
              <p className="text-[13px] text-muted">{profile.data?.email ?? ""}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void logout()}>
              <LogOut size={15} aria-hidden="true" /> Keluar
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Zona berbahaya" />
        <Card className="space-y-3 border-expense/40 p-4">
          <p className="text-sm text-muted">
            Menghapus akun bersifat permanen: seluruh transaksi, budget, target, dan akun
            login ikut terhapus dan tidak bisa dikembalikan.
          </p>
          {!confirmingDelete ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
              Hapus akunku…
            </Button>
          ) : (
            <form
              onSubmit={(e) => void submitDelete(e)}
              className="space-y-3 rounded-control bg-expense/5 p-3"
            >
              <p className="text-sm font-medium">
                Ketik alamat emailmu untuk konfirmasi:{" "}
                <strong>{profile.data?.email}</strong>
              </p>
              <Field
                label="Email konfirmasi"
                type="email"
                autoComplete="off"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setDeleteEmail("");
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  loading={deleting}
                  className="flex-1"
                >
                  Ya, hapus permanen
                </Button>
              </div>
            </form>
          )}
        </Card>
      </section>
    </div>
  );
}

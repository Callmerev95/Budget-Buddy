import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Kata sandi diperbarui. Silakan masuk kembali.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Terjadi gangguan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Buat kata sandi baru" subtitle="Minimal 8 karakter.">
      <form onSubmit={(e) => void handleUpdatePassword(e)} className="space-y-4">
        <Field
          label="Kata sandi baru"
          type="password"
          placeholder="Kata sandi baru"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          icon={<Lock size={18} aria-hidden="true" />}
          required
          minLength={8}
        />
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Perbarui kata sandi
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { registerSchema } from "@budget-buddy/shared";
import type { RegisterInput } from "@budget-buddy/shared";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Data tidak valid");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: { data: { full_name: validation.data.name } },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Akun dibuat. Periksa email Anda untuk verifikasi.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Terjadi gangguan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Gratis, tanpa kartu kredit."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-accent">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
        <Field
          label="Nama"
          type="text"
          placeholder="Nama lengkap"
          autoComplete="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          icon={<User size={18} aria-hidden="true" />}
          required
        />
        <Field
          label="Email"
          type="email"
          placeholder="nama@domain.com"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={<Mail size={18} aria-hidden="true" />}
          required
        />
        <Field
          label="Kata sandi"
          type={showPassword ? "text" : "password"}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          icon={<Lock size={18} aria-hidden="true" />}
          hint="Minimal 8 karakter."
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text"
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff size={15} aria-hidden="true" />
          ) : (
            <Eye size={15} aria-hidden="true" />
          )}
          {showPassword ? "Sembunyikan" : "Tampilkan"}
        </button>
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Daftar
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;

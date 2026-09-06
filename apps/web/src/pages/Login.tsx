import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { loginSchema } from "@budget-buddy/shared";
import type { LoginInput } from "@budget-buddy/shared";
import { AuthLayout } from "../components/auth/AuthLayout";
import { CaptchaField } from "../components/auth/CaptchaField";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        ...validation.data,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (error) {
        toast.error(
          error.message.includes("Email not confirmed")
            ? "Akun belum terverifikasi. Periksa email Anda untuk mengaktifkannya."
            : "Email atau kata sandi salah.",
        );
        return;
      }

      toast.success("Selamat datang kembali.");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Terjadi gangguan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk mengelola keuanganmu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className="font-medium text-accent">
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
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
        <div>
          <Field
            label="Kata sandi"
            type={showPassword ? "text" : "password"}
            placeholder="Kata sandimu"
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={<Lock size={18} aria-hidden="true" />}
            required
          />
          <div className="mt-2 flex items-center justify-between">
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
            <Link to="/forgot-password" className="text-[13px] font-medium text-accent">
              Lupa kata sandi?
            </Link>
          </div>
        </div>
        <CaptchaField onToken={setCaptchaToken} />
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;

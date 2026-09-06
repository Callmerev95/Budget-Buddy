import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@budget-buddy/shared";
import { AuthLayout } from "../components/auth/AuthLayout";
import { CaptchaField } from "../components/auth/CaptchaField";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Email tidak valid");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
        ...(captchaToken ? { captchaToken } : {}),
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSubmitted(true);
      toast.success("Instruksi pemulihan telah dikirim.");
    } catch {
      toast.error("Terjadi gangguan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Lupa kata sandi"
      subtitle="Kami kirimkan tautan pemulihan ke emailmu."
      footer={
        <Link to="/login" className="font-medium text-accent">
          Kembali masuk
        </Link>
      }
    >
      {isSubmitted ? (
        <div className="space-y-3 py-2 text-center">
          <CheckCircle2
            size={48}
            strokeWidth={1.5}
            className="mx-auto text-income"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">Periksa email</h2>
          <p className="text-sm leading-relaxed text-muted">
            Instruksi pemulihan telah dikirim ke{" "}
            <strong className="text-text">{email}</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Field
            label="Email terdaftar"
            type="email"
            placeholder="nama@domain.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} aria-hidden="true" />}
            required
          />
          <CaptchaField onToken={setCaptchaToken} />
          <Button type="submit" loading={loading} size="lg" className="w-full">
            Kirim tautan reset
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;

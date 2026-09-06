import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

/**
 * Widget CAPTCHA Cloudflare Turnstile.
 *
 * Tidak dirender bila site key belum dikonfigurasi — halaman auth tetap
 * berfungsi dan enforcement Supabase harus tetap OFF sampai key ada.
 * Token diteruskan ke Supabase melalui opsi `captchaToken`.
 */
export function CaptchaField({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<TurnstileInstance>(null);

  if (!SITE_KEY) return null;

  return (
    <Turnstile
      ref={ref}
      siteKey={SITE_KEY}
      onSuccess={onToken}
      onExpire={() => onToken("")}
      onError={() => onToken("")}
      options={{ theme: "auto", size: "flexible" }}
    />
  );
}

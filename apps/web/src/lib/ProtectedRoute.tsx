import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "./supabase";

/**
 * Penjaga route berbasis session Supabase.
 *
 * Versi lama hanya mengecek keberadaan `localStorage.token`, yang berarti token
 * kedaluwarsa tetap dianggap valid sampai request pertama gagal. `getSession`
 * memvalidasi dan menyegarkan token lebih dulu, jadi butuh state loading.
 */
export default function ProtectedRoute() {
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(data.session ? "authed" : "guest");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setStatus(session ? "authed" : "guest");
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-bg"
        role="status"
        aria-label="Memuat sesi"
      >
        <Loader2 className="animate-spin text-accent" size={28} aria-hidden="true" />
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

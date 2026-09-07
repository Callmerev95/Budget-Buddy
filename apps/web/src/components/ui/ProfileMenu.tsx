import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "../../hooks/useFinance";
import { supabase } from "../../lib/supabase";
import { Avatar } from "./Avatar";

function MenuItem({
  icon,
  onClick,
  className = "",
  children,
}: {
  icon: ReactNode;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** Menu profil responsif: Laporan, Pengaturan, Keluar. */
export function ProfileMenu() {
  const navigate = useNavigate();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const logout = async () => {
    setOpen(false);
    try {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu profil${profile.data?.name ? ` ${profile.data.name}` : ""}`}
        className="rounded-full p-0.5 transition-colors hover:bg-surface-2"
      >
        <Avatar name={profile.data?.name ?? ""} label="Menu profil" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu profil"
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-card border border-border bg-surface py-1.5 shadow-pop"
        >
          <MenuItem
            icon={<BarChart3 size={16} aria-hidden="true" />}
            onClick={() => go("/reports")}
          >
            Laporan
          </MenuItem>
          <MenuItem
            icon={<Settings size={16} aria-hidden="true" />}
            onClick={() => go("/settings")}
          >
            Pengaturan
          </MenuItem>
          <div className="my-1.5 border-t border-border" />
          <MenuItem
            icon={<LogOut size={16} aria-hidden="true" />}
            onClick={() => void logout()}
            className="text-expense hover:bg-expense/10"
          >
            Keluar
          </MenuItem>
        </div>
      )}
    </div>
  );
}

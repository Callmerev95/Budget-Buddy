import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Bell,
  Home,
  LogOut,
  Menu,
  PieChart,
  Plus,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "../../hooks/useFinance";
import { useUnreadCount } from "../../hooks/useNotifications";
import { supabase } from "../../lib/supabase";
import { Avatar } from "../ui/Avatar";
import { Topbar } from "../ui/Topbar";

const NAV = [
  { to: "/dashboard", label: "Beranda", icon: Home },
  { to: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budget", icon: PieChart },
  { to: "/accounts", label: "Akun", icon: Wallet },
  { to: "/goals", label: "Target", icon: Target },
] as const;

const SECONDARY_NAV = [
  { to: "/reports", label: "Laporan" },
  { to: "/settings", label: "Pengaturan" },
  { to: "/notifications", label: "Notifikasi" },
] as const;

function navClass({ isActive }: { isActive: boolean }): string {
  return `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent/10 text-accent"
      : "text-muted hover:bg-surface-2 hover:text-text"
  }`;
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/15 px-1 text-[11px] font-bold text-accent"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate} className={navClass}>
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
    }
  };
  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-expense transition-colors hover:bg-expense/10"
    >
      <LogOut size={18} aria-hidden="true" />
      Keluar
    </button>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const profile = useProfile();

  return (
    <div className="flex h-full min-h-0 flex-col gap-1">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-3 flex items-center gap-2.5 rounded-control px-2 py-2 text-left"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-fill text-on-accent-fill">
          <Wallet size={18} aria-hidden="true" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Budget Buddy</span>
      </button>

      <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
        <NavItems onNavigate={onNavigate} />
      </nav>

      <div className="mt-2 border-t border-border pt-2">
        <nav aria-label="Navigasi tambahan" className="flex flex-col gap-1">
          {SECONDARY_NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={onNavigate} className={navClass}>
              {label}
            </NavLink>
          ))}
          <NotificationNavItem onNavigate={onNavigate} />
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <LogoutButton />
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 rounded-control px-2 py-2 text-left transition-colors hover:bg-surface-2"
        >
          <Avatar
            name={profile.data?.name ?? ""}
            label={`Profil ${profile.data?.name ?? ""}`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {profile.data?.name ?? ""}
            </span>
            <span className="block truncate text-xs text-muted">
              {profile.data?.email ?? ""}
            </span>
          </span>
          <Settings size={16} aria-hidden="true" className="shrink-0 text-muted" />
        </button>
      </div>
    </div>
  );
}

function NotificationNavItem({ onNavigate }: { onNavigate?: () => void }) {
  const { unreadCount } = useUnreadCount();
  return (
    <NavLink
      to="/notifications"
      onClick={onNavigate}
      aria-label={
        unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"
      }
      className={navClass}
    >
      <Bell size={18} aria-hidden="true" />
      Notifikasi
      <UnreadBadge count={unreadCount} />
    </NavLink>
  );
}

function MobileBellButton() {
  const navigate = useNavigate();
  const { unreadCount } = useUnreadCount();
  return (
    <button
      type="button"
      onClick={() => navigate("/notifications")}
      aria-label={
        unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"
      }
      className="relative rounded-control p-2 text-muted hover:bg-surface-2 hover:text-text"
    >
      <Bell size={20} aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent/15 px-0.5 text-[10px] font-bold text-accent"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

/**
 * Shell responsif gaya Fundex: sidebar kiri tetap + topbar di ≥1024px,
 * off-canvas drawer + bottom nav di bawahnya. FAB tetap melayang.
 */
export function Shell({ onAdd }: { onAdd: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface p-4 lg:flex">
        <SidebarBody />
      </aside>

      <div className="lg:pl-64">
        {/* Topbar desktop */}
        <div className="sticky top-0 z-20 hidden lg:block">
          <Topbar />
        </div>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-lg lg:hidden">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent-fill text-on-accent-fill">
              <Wallet size={16} aria-hidden="true" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Budget Buddy</span>
          </span>
          <div className="flex items-center gap-1">
            <MobileBellButton />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className="rounded-control p-2 text-muted hover:bg-surface-2 hover:text-text"
            >
              {menuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* Drawer mobile off-canvas */}
        {menuOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="fixed inset-0 z-40 lg:hidden"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
              className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface p-4 shadow-pop">
              <div className="flex justify-end pb-2">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup menu"
                  className="rounded-control p-2 text-muted hover:bg-surface-2"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <SidebarBody onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Konten */}
        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 lg:px-8 lg:pb-20">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-accent" : "text-muted"
                }`
              }
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Tombol tambah mengambang */}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Tambah transaksi"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-fill text-on-accent-fill shadow-pop transition-transform active:scale-95 lg:bottom-8 lg:right-8"
      >
        <Plus size={24} aria-hidden="true" />
      </button>
    </div>
  );
}

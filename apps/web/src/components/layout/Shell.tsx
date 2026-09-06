import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Home,
  Menu,
  PieChart,
  Plus,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/dashboard", label: "Beranda", icon: Home },
  { to: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budget", icon: PieChart },
  { to: "/accounts", label: "Akun", icon: Wallet },
  { to: "/goals", label: "Target", icon: Target },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-surface-2 hover:text-text"
            }`
          }
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </>
  );
}

/**
 * Shell responsif: sidebar tetap ≥1024px, bottom nav di bawahnya.
 * Menggantikan floating nav ad-hoc per halaman.
 */
export function Shell({ onAdd }: { onAdd: () => void }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 border-r border-border bg-surface p-4 lg:flex">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-4 flex items-center gap-2 rounded-control px-3 py-2 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent text-on-accent">
            <Wallet size={18} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Budget Buddy</span>
        </button>
        <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
          <NavItems />
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`
            }
          >
            <PieChart size={18} aria-hidden="true" />
            Laporan
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`
            }
          >
            <Settings size={18} aria-hidden="true" />
            Pengaturan
          </NavLink>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-lg lg:hidden">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-on-accent">
            <Wallet size={16} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Budget Buddy</span>
        </span>
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
      </header>
      {menuOpen && (
        <nav
          aria-label="Navigasi utama"
          className="border-b border-border bg-surface p-4 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            <NavItems onNavigate={() => setMenuOpen(false)} />
          </div>
        </nav>
      )}

      {/* Konten */}
      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6 lg:ml-60 lg:max-w-[1280px] lg:px-8 lg:pb-16 xl:mx-auto xl:max-w-[1440px]">
        <Outlet />
      </main>

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
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-pop transition-transform active:scale-95 lg:bottom-8 lg:right-8"
      >
        <Plus size={24} aria-hidden="true" />
      </button>
    </div>
  );
}

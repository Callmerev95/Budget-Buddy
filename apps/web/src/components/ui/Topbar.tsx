import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun } from "lucide-react";
import { useProfile } from "../../hooks/useFinance";
import { useUnreadCount } from "../../hooks/useNotifications";
import { useTheme } from "../../theme/theme-context";
import { SearchInput } from "./SearchInput";
import { Avatar } from "./Avatar";

/** Topbar desktop khas Fundex: pencarian, toggle tema, lonceng, avatar. */
export function Topbar() {
  const navigate = useNavigate();
  const profile = useProfile();
  const { unreadCount } = useUnreadCount();
  const { resolved, setTheme } = useTheme();
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/transactions?q=${encodeURIComponent(q)}` : "/transactions");
    setQuery("");
  };

  return (
    <div className="flex h-16 items-center gap-4 border-b border-border bg-surface/60 px-6 backdrop-blur-lg">
      <form onSubmit={submit} role="search" className="max-w-sm flex-1">
        <SearchInput
          label="Cari transaksi atau budget"
          value={query}
          onChange={setQuery}
          placeholder="Cari transaksi, budget…"
        />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          aria-label={resolved === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap"}
          className="rounded-control p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          {resolved === "dark" ? (
            <Sun size={19} aria-hidden="true" />
          ) : (
            <Moon size={19} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          aria-label={
            unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"
          }
          className="relative rounded-control p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <Bell size={19} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-expense px-0.5 text-[9px] font-bold text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 rounded-control py-1.5 pl-1.5 pr-2 transition-colors hover:bg-surface-2"
        >
          <Avatar name={profile.data?.name ?? ""} label="Buka pengaturan" />
          <span className="hidden text-sm font-medium xl:block">
            {profile.data?.name ?? ""}
          </span>
        </button>
      </div>
    </div>
  );
}

import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme, type ResolvedTheme } from "./theme-context";

const STORAGE_KEY = "budget-buddy-theme";

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function loadTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // localStorage tidak tersedia (mode privat) — pakai sistem.
  }
  return "system";
}

/**
 * Menggantikan prop-drilling `isDarkMode` ke 14 komponen.
 * Kelas `dark` dipasang sebelum paint via useLayoutEffect — tidak ada
 * inline script (dilarang CSP) dan tidak ada flash karena root kosong
 * sampai React render.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadTheme);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    const initial = loadTheme();
    return initial === "system" ? systemTheme() : initial;
  });

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Abaikan — tema tetap berlaku untuk sesi ini.
    }
  }, []);

  useLayoutEffect(() => {
    const next = theme === "system" ? systemTheme() : theme;
    setResolved(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [theme]);

  useLayoutEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      const next = event.matches ? "dark" : "light";
      setResolved(next);
      document.documentElement.classList.toggle("dark", event.matches);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

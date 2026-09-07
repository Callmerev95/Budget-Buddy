import { useId } from "react";
import { Search, X } from "lucide-react";

/** Input pencarian dengan ikon (pola topbar/DataTable Fundex). */
export function SearchInput({
  label,
  value,
  onChange,
  onClear,
  placeholder = "Cari…",
  autoFocus = false,
  id,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  className?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={className}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block h-10 w-full rounded-control border border-border bg-transparent py-2 pl-10 pr-3 text-sm leading-5 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent-fill/40 dark:text-white/90"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Bersihkan pencarian"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-surface-2"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

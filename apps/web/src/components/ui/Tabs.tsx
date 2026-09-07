interface TabOption<V extends string> {
  value: V;
  label: string;
}

/** Kontrol tersegmentasi (pola Tabs Fundex). Nilai lewat `aria-pressed`. */
export function Tabs<V extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: {
  options: readonly TabOption<V>[];
  value: V;
  onChange: (value: V) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-control px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

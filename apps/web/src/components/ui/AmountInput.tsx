import { useId, useState } from "react";
import { formatAmount } from "../../lib/format";

interface AmountInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  hint?: string;
  id?: string;
}

/**
 * Input nominal rupiah: mengetik digit, tampil dengan pemisah ribuan,
 * nilai selalu integer. Mencegah input non-numerik di sumbernya.
 */
export function AmountInput({
  label,
  value,
  onChange,
  error,
  hint,
  id,
}: AmountInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [focused, setFocused] = useState(false);

  // Fokus: digit mentah agar mudah diedit. Blur: format ribuan.
  // Nol selalu tampil sebagai placeholder kosong.
  const display = value === 0 ? "" : focused ? String(value) : formatAmount(value);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    onChange(digits === "" ? 0 : Number(digits));
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="ml-1 block text-[13px] font-semibold text-muted"
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-control border bg-surface px-4 transition-colors focus-within:border-accent ${
          error ? "border-expense" : "border-border"
        }`}
      >
        <span className="text-[15px] font-semibold text-muted" aria-hidden="true">
          Rp
        </span>
        <input
          id={inputId}
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-errormessage={error ? errorId : undefined}
          className="tnum w-full bg-transparent py-3 text-[17px] font-semibold text-text placeholder:text-muted/60 focus:outline-none"
          placeholder="0"
          value={display}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="ml-1 text-[13px] font-medium text-expense"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="ml-1 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

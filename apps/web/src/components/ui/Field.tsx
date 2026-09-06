import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

/**
 * Input teks dengan label yang selalu terasosiasi (bukan placeholder-only),
 * error di dekat field, dan teks bantuan opsional.
 */
export function Field({
  label,
  error,
  hint,
  icon,
  id,
  className = "",
  ...rest
}: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="ml-1 block text-[13px] font-semibold text-muted"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            `${error ? errorId : ""} ${hint ? hintId : ""}`.trim() || undefined
          }
          aria-errormessage={error ? errorId : undefined}
          className={`w-full rounded-control border bg-surface px-4 py-3 text-[15px] text-text placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none ${
            icon ? "pl-11" : ""
          } ${error ? "border-expense" : "border-border"} ${className}`}
          {...rest}
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
        <p id={hintId} className="ml-1 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

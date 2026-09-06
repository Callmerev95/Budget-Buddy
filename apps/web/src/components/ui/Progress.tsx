interface ProgressProps {
  value: number;
  label: string;
  tone?: "default" | "warning" | "danger" | "success";
}

const TONES: Record<NonNullable<ProgressProps["tone"]>, string> = {
  default: "bg-accent",
  warning: "bg-warning",
  danger: "bg-expense",
  success: "bg-income",
};

/** Progress bar yang terbaca screen reader (bukan div biasa). */
export function Progress({ value, label, tone = "default" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-border/60"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${TONES[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

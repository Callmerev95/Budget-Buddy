import type { ReactNode } from "react";

type StatTone = "neutral" | "success" | "danger" | "warning";

const TONES: Record<StatTone, string> = {
  neutral: "bg-accent/10 text-accent",
  success: "bg-income/10 text-income",
  danger: "bg-expense/10 text-expense",
  warning: "bg-warning/10 text-warning",
};

/** Kartu metrik ringkas (pola StatCard Fundex). */
export function StatCard({
  label,
  value,
  meta,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  tone?: StatTone;
  icon?: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-control ${TONES[tone]}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <p className="tnum mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {meta && <div className="mt-1 text-[13px] text-muted">{meta}</div>}
    </section>
  );
}

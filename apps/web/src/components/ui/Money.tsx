import { formatCompactCurrency, formatCurrency } from "../../lib/format";

interface MoneyProps {
  amount: number;
  compact?: boolean;
  className?: string;
}

/** Satu-satunya cara menampilkan uang. Selalu tabular, selalu lewat helper. */
export function Money({ amount, compact = false, className = "" }: MoneyProps) {
  return (
    <span className={`tnum ${className}`}>
      {compact ? formatCompactCurrency(amount) : formatCurrency(amount)}
    </span>
  );
}

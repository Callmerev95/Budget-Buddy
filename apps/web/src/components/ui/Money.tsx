import { formatCompactCurrency, formatCurrency } from "../../lib/format";
import { CountUp } from "./CountUp";

interface MoneyProps {
  amount: number;
  compact?: boolean;
  className?: string;
  /** Animasikan perubahan angka (count-up saat nilai berubah). */
  animate?: boolean;
}

/** Satu-satunya cara menampilkan uang. Selalu tabular, selalu lewat helper. */
export function Money({
  amount,
  compact = false,
  className = "",
  animate = false,
}: MoneyProps) {
  const format = (n: number) => (compact ? formatCompactCurrency(n) : formatCurrency(n));
  return (
    <span className={`tnum ${className}`}>
      {animate ? <CountUp value={amount} format={format} /> : format(amount)}
    </span>
  );
}

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const DURATION_MS = 500;

function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

/**
 * Angka yang menganimasikan perubahan nilainya (count-up/count-down).
 * Memakai rAF manual + ending di nilai tepat; nonaktif saat prefers-reduced-motion.
 */
export function CountUp({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const reduce = useReducedMotion();
  const previousRef = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      previousRef.current = value;
      return;
    }

    const from = previousRef.current;
    const to = value;
    previousRef.current = value;
    if (from === to) return;

    const start = performance.now();
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(to);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [value, reduce]);

  return <>{format(display)}</>;
}

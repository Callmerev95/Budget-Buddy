import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { spring } from "../../lib/motion";

/** Badge kecil yang "pop" (spring) setiap nilainya berubah. */
export function PopBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      key={typeof children === "string" ? children : ""}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={spring}
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full ${className}`}
    >
      {children}
    </motion.span>
  );
}

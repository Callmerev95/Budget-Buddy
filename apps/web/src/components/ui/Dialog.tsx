import { useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useModalA11y } from "./useModalA11y";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  destructive?: boolean;
}

/**
 * Modal tengah untuk konfirmasi/aksi destruktif (pengganti `window.confirm`).
 * `destructive` mengubah judul/teks tetap netral — tombol aksi tetap di
 * tangan pemanggil.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  destructive = false,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useModalA11y(open, onClose, panelRef);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={reduceMotion ? {} : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.18 }}
            className={`relative w-full max-w-sm overflow-hidden rounded-card border bg-surface p-6 text-left shadow-pop outline-none ${
              destructive ? "border-expense/40" : "border-border"
            }`}
          >
            <h2
              id={titleId}
              className={`text-lg font-semibold tracking-tight ${destructive ? "text-expense" : "text-text"}`}
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1.5 text-sm text-muted">
                {description}
              </p>
            )}
            <div className="mt-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

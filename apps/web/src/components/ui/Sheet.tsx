import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useModalA11y } from "./useModalA11y";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Satu-satunya primitif modal bawah. Menggantikan 4 salinan shell modal
 * (backdrop + drawer + handle + close) dengan z-index acak 100–999.
 *
 * Aksesibilitas: role dialog + aria-modal, fokus masuk saat dibuka,
 * fokus kembali ke pemicu saat ditutup, Tab terjebak di dalam,
 * Escape menutup, scroll latar dikunci.
 */
export function Sheet({ open, onClose, title, description, children }: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useModalA11y(open, onClose, panelRef);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "tween" as const, ease: "easeOut" as const, duration: 0.25 },
      };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
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
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            {...motionProps}
            className="relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-sheet border border-border bg-surface p-6 shadow-pop outline-none sm:rounded-sheet"
          >
            <div
              className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden"
              aria-hidden="true"
            />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id={titleId}
                  className="text-xl font-semibold tracking-tight text-text"
                >
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="rounded-control p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

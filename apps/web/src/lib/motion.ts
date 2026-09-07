import type { Transition, Variants } from "framer-motion";

export const EASE = [0.4, 0, 0.2, 1] as const;

export const spring: Transition = { type: "spring", stiffness: 450, damping: 32 };

/** Fade + slide-up halus untuk elemen yang baru muncul. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE },
  },
};

/** Transisi antar rute: fade singkat, slide tipis supaya cepat & tidak mual. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12, ease: "easeIn" } },
};

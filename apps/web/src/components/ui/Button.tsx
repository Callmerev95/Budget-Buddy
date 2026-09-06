import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-110 active:brightness-95",
  secondary: "bg-surface-2 text-text border border-border hover:bg-border/40",
  ghost: "text-accent hover:bg-accent/10",
  danger: "bg-expense text-white hover:brightness-110 active:brightness-95",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-control font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

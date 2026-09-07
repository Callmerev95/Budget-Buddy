import type { ReactNode } from "react";
import { Wallet } from "lucide-react";

/** Bingkai halaman auth: netral, ikut tema, tanpa neon. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-bg px-6 py-12 text-text">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-hero bg-accent-fill text-on-accent-fill"
            aria-hidden="true"
          >
            <Wallet size={28} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}

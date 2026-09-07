import type { ReactNode } from "react";

type Align = "left" | "center" | "right";

function alignClass(align: Align | undefined): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export interface Column<T> {
  key: string;
  header: string;
  align?: Align;
  cellClassName?: string;
  render: (row: T) => ReactNode;
}

/**
 * Tabel data desktop (pola DataTable Fundex): header huruf kecil spasi lebar,
 * baris dibelah garis, hover lembut, footer slotted untuk muat-banyak.
 */
export function DataTable<T>({
  columns,
  rows,
  keyOf,
  caption,
  footer,
  rowClassName = "",
  className = "",
}: {
  columns: readonly Column<T>[];
  rows: readonly T[];
  keyOf: (row: T) => string;
  caption?: string;
  footer?: ReactNode;
  rowClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-card border border-border bg-surface shadow-card ${className}`}
    >
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted ${alignClass(col.align)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr
              key={keyOf(row)}
              className={`transition-colors hover:bg-surface-2/60 ${rowClassName}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3.5 align-middle ${alignClass(col.align)} ${col.cellClassName ?? ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div className="border-t border-border">{footer}</div>}
    </div>
  );
}

import { z } from "zod";

/**
 * Batas atas nominal per transaksi: Rp 1 triliun.
 * Menahan input keliru dan menjaga nilai tetap aman sebagai integer JS.
 */
export const MAX_AMOUNT = 1_000_000_000_000;

/**
 * Menerima nominal dari body JSON atau input form (string maupun number),
 * lalu menghasilkan integer rupiah.
 *
 * Menggantikan `parseFloat(req.body.amount)` di controller lama yang
 * menghasilkan `NaN` untuk input non-numerik, lolos ke Prisma, dan berakhir 500.
 */
function parseAmount(options: { min: number; minMessage: string }) {
  return z.union([z.number(), z.string()]).transform((value, ctx) => {
    const parsed = typeof value === "number" ? value : Number(value.trim());

    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominal harus berupa angka",
      });
      return z.NEVER;
    }

    if (parsed < options.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: options.minMessage,
      });
      return z.NEVER;
    }

    if (parsed > MAX_AMOUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominal melebihi batas yang wajar",
      });
      return z.NEVER;
    }

    return Math.round(parsed);
  });
}

/** Nominal transaksi: wajib lebih dari 0. */
export const AmountSchema = parseAmount({
  min: 1,
  minMessage: "Nominal harus lebih dari 0",
});

/** Nominal rencana keuangan: 0 diperbolehkan (mis. target tabungan belum diisi). */
export const NonNegativeAmountSchema = parseAmount({
  min: 0,
  minMessage: "Nominal tidak boleh negatif",
});

/** Tanggal jatuh tempo dalam bulan, 1-31. */
export const DueDateSchema = z.union([z.number(), z.string()]).transform((value, ctx) => {
  const parsed = typeof value === "number" ? value : Number(value.trim());

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal jatuh tempo harus antara 1 sampai 31",
    });
    return z.NEVER;
  }

  return parsed;
});

import { z } from "zod";

const uuidSchema = z.string().uuid("ID tidak valid");

/** Transfer antar akun milik pengguna yang sama. */
export const createTransferSchema = z
  .object({
    fromAccountId: uuidSchema,
    toAccountId: uuidSchema,
    amount: z.number().int().positive("Nominal harus lebih dari 0"),
    description: z
      .string()
      .trim()
      .max(120, "Deskripsi terlalu panjang")
      .default("Transfer"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Akun asal dan tujuan harus berbeda.",
    path: ["toAccountId"],
  });

/** Rentang tanggal untuk export CSV. Maksimal 366 hari. */
export const exportQuerySchema = z
  .object({
    from: z.string().date("Format tanggal harus YYYY-MM-DD"),
    to: z.string().date("Format tanggal harus YYYY-MM-DD"),
  })
  .refine(
    (data) => {
      const days =
        (new Date(data.to).getTime() - new Date(data.from).getTime()) / 86_400_000;
      return days >= 0 && days <= 366;
    },
    { message: "Rentang maksimal 366 hari dan tanggal awal tidak boleh setelah akhir." },
  );

export const compareQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan harus YYYY-MM"),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

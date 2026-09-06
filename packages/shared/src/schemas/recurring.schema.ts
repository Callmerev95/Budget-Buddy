import { z } from "zod";

/** Parameter bulan dalam format YYYY-MM untuk daftar occurrence. */
export const occurrenceMonthSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan harus YYYY-MM")
    .optional(),
});

export const occurrenceIdSchema = z.object({
  id: z.string().uuid("ID occurrence tidak valid"),
});

export type OccurrenceMonthQuery = z.infer<typeof occurrenceMonthSchema>;

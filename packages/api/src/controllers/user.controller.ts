import type { Request, Response } from "express";
import { deleteAccountSchema, financialPlanSchema } from "@budget-buddy/shared";
import { getProfileId } from "../middleware/ensureProfile.js";
import { prisma } from "../lib/prisma.js";
import { getSupabaseAdmin } from "../lib/supabaseAdmin.js";
import { calculateDailyAllowance } from "../domain/finance.js";
import { AppError, NotFoundError } from "../lib/errors.js";

export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      dailyLimit: true,
      monthlyIncome: true,
      savingsTarget: true,
      isPercentTarget: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Profil pengguna tidak ditemukan.");
  }

  res.status(200).json(user);
}

export async function updateFinancialPlan(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const plan = financialPlanSchema.parse(req.body);

  const recurringRules = await prisma.recurringRule.findMany({
    where: { userId, isActive: true },
    select: { amount: true },
  });

  const totalFixed = recurringRules.reduce((sum, rule) => sum + rule.amount, 0);

  const dailyLimit = calculateDailyAllowance({
    monthlyIncome: plan.monthlyIncome,
    savingsTarget: plan.savingsTarget,
    isPercentTarget: plan.isPercentTarget,
    totalFixed,
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyIncome: plan.monthlyIncome,
      savingsTarget: plan.savingsTarget,
      isPercentTarget: plan.isPercentTarget,
      dailyLimit,
    },
    select: {
      id: true,
      name: true,
      email: true,
      dailyLimit: true,
      monthlyIncome: true,
      savingsTarget: true,
      isPercentTarget: true,
    },
  });

  res.status(200).json({ message: "Rencana keuangan diperbarui.", user });
}

/**
 * Hapus akun penuh (danger zone): seluruh data aplikasi + auth user.
 *
 * Urutan penting: data aplikasi dulu (cascade lewat delete User), lalu
 * auth user. Bila penghapusan auth gagal, pengguna masih ada dengan data
 * kosong dan bisa mengulangi — kebalikannya (auth hilang, data yatim)
 * justru menciptakan orphan permanen.
 *
 * Mewajibkan email konfirmasi yang cocok dengan profil — satu-satunya
 * perlindungan selain sesi login itu sendiri.
 */
export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = getProfileId(req);
  const { email } = deleteAccountSchema.parse(req.body);

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, supabase_id: true },
  });

  if (!profile) {
    throw new NotFoundError("Profil pengguna tidak ditemukan.");
  }

  if (profile.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new AppError(400, "Email konfirmasi tidak cocok.", "confirmation_mismatch");
  }

  const admin = getSupabaseAdmin();

  if (!admin) {
    throw new AppError(503, "Penghapusan akun belum dikonfigurasi.", "admin_disabled");
  }

  await prisma.user.delete({ where: { id: userId } });

  if (profile.supabase_id) {
    const { error } = await admin.auth.admin.deleteUser(profile.supabase_id);

    if (error) {
      console.error("Gagal menghapus auth user setelah data dihapus:", error.message);
    }
  }

  res.status(200).json({ message: "Akun dan seluruh data berhasil dihapus." });
}

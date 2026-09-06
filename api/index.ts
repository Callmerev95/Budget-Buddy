import { buildApp } from "@budget-buddy/api";

/**
 * Vercel Function yang menangani seluruh /api/*.
 *
 * Vercel memanggil app Express ini per request; tidak ada `listen` dan tidak
 * ada proses yang hidup terus. Karena itu `node-cron` dari versi lama sudah
 * dihapus dan penjadwalan pindah ke Vercel Cron.
 */
export default buildApp();

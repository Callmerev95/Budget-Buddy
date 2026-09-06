/**
 * Predikat guard tenancy dalam bentuk murni agar bisa diuji tanpa database.
 * Dipakai oleh extension Prisma di lib/prisma.ts.
 */

const SCOPED_MODELS: ReadonlySet<string> = new Set([
  "Transaction",
  "Account",
  "Category",
  "Budget",
  "RecurringRule",
  "SavingsGoal",
  "FinancialPlan",
]);

function hasOwnKey(value: unknown, key: string): boolean {
  if (typeof value !== "object" || value === null) return false;
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * True bila query ke model user-owned menyebut userId — di `where` untuk
 * operasi baca/tulis-seleksi, di `data` untuk create. Model di luar daftar
 * (User, RecurringOccurrence, _prisma_migrations) selalu lolos:
 * User hanya disentuh dengan id turunan server, occurrence dijangkau
 * lewat rule yang sudah ter-scope.
 */
export function isScopedQuery(model: string, operation: string, args: unknown): boolean {
  if (!SCOPED_MODELS.has(model)) return true;

  if (operation === "create" || operation === "createMany") {
    if (typeof args !== "object" || args === null) return false;
    return hasOwnKey((args as Record<string, unknown>).data, "userId");
  }

  if (typeof args !== "object" || args === null) return false;
  return hasOwnKey((args as Record<string, unknown>).where, "userId");
}

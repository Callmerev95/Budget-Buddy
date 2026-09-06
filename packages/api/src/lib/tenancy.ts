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
  "Notification",
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
 *
 * Bentuk `where` yang diakui (whitelist):
 * 1. Key `userId` di top level — `{ userId, ... }`, nilai apa pun
 *    termasuk null (baris sistem seperti kategori bawaan).
 * 2. `OR` yang setiap cabangnya menyebut key `userId` — mis.
 *    `{ id, OR: [{ userId }, { userId: null }] }` (milik-pengguna-ATAU-
 *    sistem). Disjungsi klausa ter-scope tetap ter-scope.
 * Selain itu — tanpa where, tanpa key, atau `NOT` — ditolak. `NOT`
 * secara sengaja tidak pernah lolos karena inversi membalik maknanya.
 */
export function isScopedQuery(model: string, operation: string, args: unknown): boolean {
  if (!SCOPED_MODELS.has(model)) return true;

  if (operation === "create" || operation === "createMany") {
    if (typeof args !== "object" || args === null) return false;
    return hasOwnKey((args as Record<string, unknown>).data, "userId");
  }

  if (typeof args !== "object" || args === null) return false;
  const where = (args as Record<string, unknown>).where;
  if (typeof where !== "object" || where === null) return false;

  if (hasOwnKey(where, "userId")) return true;

  const or = (where as Record<string, unknown>).OR;
  return (
    Array.isArray(or) &&
    or.length > 0 &&
    or.every((branch) => hasOwnKey(branch, "userId"))
  );
}

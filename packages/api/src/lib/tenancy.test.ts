import { describe, expect, it } from "vitest";
import { isScopedQuery } from "./tenancy.js";

describe("isScopedQuery", () => {
  it.each([
    "findMany",
    "findFirst",
    "findUnique",
    "count",
    "aggregate",
    "updateMany",
    "deleteMany",
    "update",
    "delete",
  ])("meloloskan %s dengan userId di where", (operation) => {
    expect(isScopedQuery("Transaction", operation, { where: { userId: "u1" } })).toBe(
      true,
    );
  });

  it("menolak baca tanpa where sama sekali", () => {
    expect(isScopedQuery("Transaction", "findMany", undefined)).toBe(false);
    expect(isScopedQuery("Transaction", "findMany", {})).toBe(false);
  });

  it("menolak where tanpa userId walau ada filter lain", () => {
    expect(isScopedQuery("Transaction", "findMany", { where: { id: "t1" } })).toBe(false);
  });

  it("meloloskan OR yang setiap cabangnya menyebut userId", () => {
    expect(
      isScopedQuery("Category", "findFirst", {
        where: { id: "c1", OR: [{ userId: "u1" }, { userId: null }] },
      }),
    ).toBe(true);
  });

  it("menolak OR bila satu cabang tidak menyebut userId", () => {
    expect(
      isScopedQuery("Category", "findFirst", {
        where: { id: "c1", OR: [{ userId: "u1" }, { name: "Gaji" }] },
      }),
    ).toBe(false);
  });

  it("menolak OR kosong", () => {
    expect(isScopedQuery("Category", "findMany", { where: { OR: [] } })).toBe(false);
  });

  it("tidak pernah meloloskan NOT, walau memuat userId", () => {
    expect(
      isScopedQuery("Transaction", "findMany", { where: { NOT: { userId: "u1" } } }),
    ).toBe(false);
  });

  it("meloloskan pola produksi: cek kepemilikan kategori by id", () => {
    expect(
      isScopedQuery("Category", "findFirst", {
        where: { id: "c1", OR: [{ userId: null }, { userId: "u1" }] },
      }),
    ).toBe(true);
  });

  it("meloloskan pola produksi: daftar kategori milik + sistem", () => {
    expect(
      isScopedQuery("Category", "findMany", {
        where: { OR: [{ userId: null }, { userId: "u1" }] },
        orderBy: [{ kind: "asc" }],
      }),
    ).toBe(true);
  });

  it("meloloskan userId null (kategori sistem) karena key-nya ada", () => {
    expect(
      isScopedQuery("Category", "findFirst", { where: { userId: null, name: "Gaji" } }),
    ).toBe(true);
  });

  it("memeriksa data.userId untuk create", () => {
    expect(
      isScopedQuery("Transaction", "create", { data: { userId: "u1", amount: 1 } }),
    ).toBe(true);
    expect(isScopedQuery("Transaction", "create", { data: { amount: 1 } })).toBe(false);
  });

  it.each(["User", "RecurringOccurrence"])("selalu meloloskan model %s", (model) => {
    expect(isScopedQuery(model, "findMany", {})).toBe(true);
  });

  it("berlaku untuk semua 8 model user-owned", () => {
    for (const model of [
      "Transaction",
      "Account",
      "Category",
      "Budget",
      "RecurringRule",
      "SavingsGoal",
      "FinancialPlan",
      "Notification",
    ]) {
      expect(isScopedQuery(model, "findMany", { where: {} })).toBe(false);
    }
  });

  it("meloloskan tulis notifikasi yang menyebut userId", () => {
    expect(isScopedQuery("Notification", "create", { data: { userId: "u1" } })).toBe(
      true,
    );
  });
});

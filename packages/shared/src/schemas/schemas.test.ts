import { describe, expect, it } from "vitest";
import {
  AmountSchema,
  DueDateSchema,
  NonNegativeAmountSchema,
  createFixedExpenseSchema,
  createTransactionSchema,
  financialPlanSchema,
  registerSchema,
} from "../index.js";

describe("AmountSchema", () => {
  it("menerima number dan mengembalikan integer", () => {
    expect(AmountSchema.parse(15_000)).toBe(15_000);
  });

  it("menerima string dari input form", () => {
    expect(AmountSchema.parse("25000")).toBe(25_000);
  });

  it("membulatkan nilai desimal ke rupiah utuh", () => {
    expect(AmountSchema.parse(1500.6)).toBe(1501);
  });

  it("menolak input non-numerik alih-alih menghasilkan NaN", () => {
    // Bug lama: parseFloat("abc") menghasilkan NaN, lolos ke Prisma, berakhir 500.
    const result = AmountSchema.safeParse("abc");

    expect(result.success).toBe(false);
  });

  it("menolak nol dan nilai negatif", () => {
    expect(AmountSchema.safeParse(0).success).toBe(false);
    expect(AmountSchema.safeParse(-5000).success).toBe(false);
  });

  it("menolak nominal di luar batas wajar", () => {
    expect(AmountSchema.safeParse(2_000_000_000_000).success).toBe(false);
  });
});

describe("NonNegativeAmountSchema", () => {
  it("menerima nol", () => {
    expect(NonNegativeAmountSchema.parse(0)).toBe(0);
  });

  it("menolak nilai negatif", () => {
    expect(NonNegativeAmountSchema.safeParse(-1).success).toBe(false);
  });
});

describe("DueDateSchema", () => {
  it("menerima tanggal 1 sampai 31", () => {
    expect(DueDateSchema.parse("1")).toBe(1);
    expect(DueDateSchema.parse(31)).toBe(31);
  });

  it("menolak tanggal di luar rentang", () => {
    expect(DueDateSchema.safeParse(0).success).toBe(false);
    expect(DueDateSchema.safeParse(32).success).toBe(false);
  });

  it("menolak tanggal desimal", () => {
    expect(DueDateSchema.safeParse(15.5).success).toBe(false);
  });
});

describe("createTransactionSchema", () => {
  it("menerima transaksi yang valid", () => {
    const result = createTransactionSchema.parse({
      description: "  Makan siang  ",
      amount: "35000",
      category: "Makan & Minum",
    });

    expect(result).toEqual({
      description: "Makan siang",
      amount: 35_000,
      category: "Makan & Minum",
    });
  });

  it("menerima ID akun dan kategori langsung dari client baru", () => {
    const accountId = "123e4567-e89b-42d3-a456-426614174000";
    const categoryId = "123e4567-e89b-42d3-a456-426614174001";
    const result = createTransactionSchema.parse({
      description: "Makan siang",
      amount: 35000,
      category: "Makan & Minum",
      accountId,
      categoryId,
    });

    expect(result.accountId).toBe(accountId);
    expect(result.categoryId).toBe(categoryId);
  });

  it("menolak ID yang bukan UUID", () => {
    const result = createTransactionSchema.safeParse({
      description: "Makan siang",
      amount: 35000,
      category: "Makan & Minum",
      accountId: "bukan-uuid",
    });

    expect(result.success).toBe(false);
  });

  it("menolak kategori di luar daftar", () => {
    const result = createTransactionSchema.safeParse({
      description: "Test",
      amount: 1000,
      category: "Kategori Ngawur",
    });

    expect(result.success).toBe(false);
  });

  it("menolak deskripsi kosong", () => {
    const result = createTransactionSchema.safeParse({
      description: "   ",
      amount: 1000,
      category: "Lainnya",
    });

    expect(result.success).toBe(false);
  });
});

describe("createFixedExpenseSchema", () => {
  it("menerima tagihan yang valid", () => {
    const result = createFixedExpenseSchema.parse({
      name: "WiFi",
      amount: "350000",
      dueDate: "5",
    });

    expect(result).toEqual({ name: "WiFi", amount: 350_000, dueDate: 5 });
  });
});

describe("financialPlanSchema", () => {
  it("menerima target nominal", () => {
    const result = financialPlanSchema.parse({
      monthlyIncome: 10_000_000,
      savingsTarget: 2_000_000,
      isPercentTarget: false,
    });

    expect(result.savingsTarget).toBe(2_000_000);
  });

  it("menerima target persen sampai 100", () => {
    expect(
      financialPlanSchema.safeParse({
        monthlyIncome: 10_000_000,
        savingsTarget: 100,
        isPercentTarget: true,
      }).success,
    ).toBe(true);
  });

  it("menolak target persen di atas 100", () => {
    expect(
      financialPlanSchema.safeParse({
        monthlyIncome: 10_000_000,
        savingsTarget: 150,
        isPercentTarget: true,
      }).success,
    ).toBe(false);
  });

  it("menerima rencana kosong untuk pengguna baru", () => {
    expect(
      financialPlanSchema.safeParse({
        monthlyIncome: 0,
        savingsTarget: 0,
        isPercentTarget: false,
      }).success,
    ).toBe(true);
  });
});

describe("registerSchema", () => {
  it("menormalkan email menjadi huruf kecil", () => {
    const result = registerSchema.parse({
      email: "  REV@Example.COM ",
      password: "rahasia123",
      name: "  Rev  ",
    });

    expect(result.email).toBe("rev@example.com");
    expect(result.name).toBe("Rev");
  });

  it("menolak password di bawah 8 karakter", () => {
    const result = registerSchema.safeParse({
      email: "rev@example.com",
      password: "short",
      name: "Rev",
    });

    expect(result.success).toBe(false);
  });
});

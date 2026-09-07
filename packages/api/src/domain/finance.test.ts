import { describe, expect, it } from "vitest";
import {
  calculateDailyAllowance,
  effectiveDueDate,
  resolveSavingsAmount,
  signedFlowAmount,
} from "./finance.js";

const marchTenth = new Date("2026-03-10T05:00:00.000Z");

describe("calculateDailyAllowance", () => {
  it("membagi sisa uang dengan sisa hari bulan, bukan 30", () => {
    // 10 Maret WIB: sisa 22 hari dari 31 hari.
    const allowance = calculateDailyAllowance({
      monthlyIncome: 10_000_000,
      savingsTarget: 2_000_000,
      isPercentTarget: false,
      totalFixed: 3_000_000,
      now: marchTenth,
    });

    expect(allowance).toBe(Math.floor(5_000_000 / 22));
  });

  it("memperlakukan target persen sebagai persentase pemasukan", () => {
    const allowance = calculateDailyAllowance({
      monthlyIncome: 10_000_000,
      savingsTarget: 20,
      isPercentTarget: true,
      totalFixed: 0,
      now: marchTenth,
    });

    expect(allowance).toBe(Math.floor(8_000_000 / 22));
  });

  it("mengembalikan 0 ketika komitmen melebihi pemasukan", () => {
    const allowance = calculateDailyAllowance({
      monthlyIncome: 3_000_000,
      savingsTarget: 1_000_000,
      isPercentTarget: false,
      totalFixed: 5_000_000,
      now: marchTenth,
    });

    expect(allowance).toBe(0);
  });

  it("memakai 28 hari pada Februari tahun biasa", () => {
    const allowance = calculateDailyAllowance({
      monthlyIncome: 2_800_000,
      savingsTarget: 0,
      isPercentTarget: false,
      totalFixed: 0,
      now: new Date("2026-02-01T05:00:00.000Z"),
    });

    expect(allowance).toBe(100_000);
  });

  it("menghasilkan bilangan bulat rupiah", () => {
    const allowance = calculateDailyAllowance({
      monthlyIncome: 1_000_001,
      savingsTarget: 0,
      isPercentTarget: false,
      totalFixed: 0,
      now: marchTenth,
    });

    expect(Number.isInteger(allowance)).toBe(true);
  });
});

describe("resolveSavingsAmount", () => {
  it("mengembalikan nominal apa adanya ketika bukan persen", () => {
    expect(resolveSavingsAmount(10_000_000, 2_000_000, false)).toBe(2_000_000);
  });

  it("menghitung persentase dari pemasukan", () => {
    expect(resolveSavingsAmount(10_000_000, 15, true)).toBe(1_500_000);
  });
});

describe("effectiveDueDate", () => {
  it("meneruskan tanggal yang ada di bulan tersebut", () => {
    expect(effectiveDueDate(15, 2026, 3)).toBe(15);
  });

  it("menjepit tanggal 31 ke hari terakhir Februari", () => {
    // Bug lama: tagihan tanggal 31 tidak pernah jatuh tempo di Februari.
    expect(effectiveDueDate(31, 2026, 2)).toBe(28);
  });

  it("menjepit tanggal 31 ke 29 pada Februari tahun kabisat", () => {
    expect(effectiveDueDate(31, 2028, 2)).toBe(29);
  });

  it("menjepit tanggal 31 ke 30 pada bulan 30 hari", () => {
    expect(effectiveDueDate(31, 2026, 4)).toBe(30);
  });

  it("tidak mengubah tanggal 31 pada bulan 31 hari", () => {
    expect(effectiveDueDate(31, 2026, 12)).toBe(31);
  });
});

describe("signedFlowAmount", () => {
  it("mengubah pengeluaran menjadi negatif", () => {
    expect(signedFlowAmount("EXPENSE", 50_000)).toBe(-50_000);
  });

  it("meneruskan pemasukan apa adanya", () => {
    expect(signedFlowAmount("INCOME", 150_000)).toBe(150_000);
  });

  it("meneruskan baris transfer keluar (sudah negatif)", () => {
    expect(signedFlowAmount("TRANSFER", -50_000)).toBe(-50_000);
  });

  it("meneruskan baris transfer masuk (positif)", () => {
    expect(signedFlowAmount("TRANSFER", 50_000)).toBe(50_000);
  });
});

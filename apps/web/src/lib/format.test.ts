import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatCompactCurrency,
  formatCurrency,
  formatRelative,
  formatShortDate,
  toCalendarDay,
} from "./format.js";

const NBSP = "\u00a0";

describe("formatCurrency", () => {
  it("memformat rupiah tanpa desimal", () => {
    expect(formatCurrency(1_500_000).replace(/\u00a0/g, " ")).toBe("Rp 1.500.000");
  });

  it("memformat nol", () => {
    expect(formatCurrency(0).replace(/\u00a0/g, " ")).toBe("Rp 0");
  });

  it("memformat nilai negatif", () => {
    expect(formatCurrency(-50_000).replace(/\u00a0/g, " ")).toContain("50.000");
  });

  it("memakai non-breaking space sesuai locale id-ID", () => {
    expect(formatCurrency(1000)).toContain(NBSP);
  });
});

describe("formatAmount", () => {
  it("mengembalikan angka tanpa simbol mata uang", () => {
    expect(formatAmount(1_500_000)).toBe("1.500.000");
  });
});

describe("formatCompactCurrency", () => {
  it("memendekkan nilai besar", () => {
    expect(formatCompactCurrency(1_500_000)).toMatch(/^Rp /);
  });
});

describe("toCalendarDay", () => {
  it("memakai tanggal WIB, bukan tanggal UTC", () => {
    // 2026-03-10T19:30Z adalah 2026-03-11 02:30 WIB.
    expect(toCalendarDay("2026-03-10T19:30:00.000Z")).toBe("2026-03-11");
  });

  it("konsisten untuk siang hari", () => {
    expect(toCalendarDay("2026-03-11T05:00:00.000Z")).toBe("2026-03-11");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-09-06T12:00:00+07:00");

  it("di bawah semenit → baru saja", () => {
    expect(formatRelative(new Date("2026-09-06T11:59:40+07:00"), now)).toBe("baru saja");
  });

  it("menit → 'N mnt lalu'", () => {
    expect(formatRelative(new Date("2026-09-06T11:15:00+07:00"), now)).toBe(
      "45 mnt lalu",
    );
  });

  it("jam → 'N jam lalu'", () => {
    expect(formatRelative(new Date("2026-09-06T09:00:00+07:00"), now)).toBe("3 jam lalu");
  });

  it("kemarin untuk 1 hari", () => {
    expect(formatRelative(new Date("2026-09-05T12:00:00+07:00"), now)).toBe("kemarin");
  });

  it("hari untuk 2–6 hari", () => {
    expect(formatRelative(new Date("2026-09-03T12:00:00+07:00"), now)).toBe(
      "3 hari lalu",
    );
  });

  it("tanggal penuh untuk 7 hari ke atas", () => {
    expect(formatRelative(new Date("2026-08-20T12:00:00+07:00"), now)).toBe(
      formatShortDate("2026-08-20T12:00:00+07:00"),
    );
  });
});

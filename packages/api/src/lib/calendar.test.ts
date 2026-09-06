import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  remainingDaysInMonth,
  startOfDayUtc,
  startOfMonthUtc,
  toCalendarDay,
} from "./calendar.js";

describe("toCalendarDay", () => {
  it("memetakan tengah malam WIB ke tanggal WIB, bukan tanggal UTC", () => {
    // 2026-03-10T17:00Z adalah 2026-03-11T00:00 di Jakarta (UTC+7).
    const at = new Date("2026-03-10T17:00:00.000Z");

    expect(toCalendarDay(at)).toBe("2026-03-11");
    expect(toCalendarDay(at, "UTC")).toBe("2026-03-10");
  });

  it("menempatkan transaksi dini hari WIB pada hari yang benar", () => {
    // Inilah bug lama: 02:00 WIB terbaca sebagai hari sebelumnya secara UTC.
    const at = new Date("2026-03-10T19:30:00.000Z");

    expect(toCalendarDay(at)).toBe("2026-03-11");
  });
});

describe("daysInMonth", () => {
  it("menghitung Februari pada tahun biasa", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
  });

  it("menghitung Februari pada tahun kabisat", () => {
    expect(daysInMonth(2028, 2)).toBe(29);
  });

  it("menghitung bulan 30 dan 31 hari", () => {
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe("remainingDaysInMonth", () => {
  it("menghitung hari ini sebagai bagian dari sisa hari", () => {
    const at = new Date("2026-03-31T05:00:00.000Z");

    expect(remainingDaysInMonth(at)).toBe(1);
  });

  it("mengembalikan jumlah hari penuh pada tanggal 1", () => {
    const at = new Date("2026-04-01T05:00:00.000Z");

    expect(remainingDaysInMonth(at)).toBe(30);
  });

  it("memakai jumlah hari bulan sebenarnya, bukan 30 seperti kode lama", () => {
    const at = new Date("2026-02-01T05:00:00.000Z");

    expect(remainingDaysInMonth(at)).toBe(28);
  });
});

describe("startOfDayUtc", () => {
  it("mengembalikan instant tengah malam WIB", () => {
    const at = new Date("2026-03-11T09:15:00.000Z");

    expect(startOfDayUtc(at).toISOString()).toBe("2026-03-10T17:00:00.000Z");
  });
});

describe("startOfMonthUtc", () => {
  it("mengembalikan instant awal bulan menurut WIB", () => {
    const at = new Date("2026-03-11T09:15:00.000Z");

    expect(startOfMonthUtc(at).toISOString()).toBe("2026-02-28T17:00:00.000Z");
  });
});

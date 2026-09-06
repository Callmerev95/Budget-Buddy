import { describe, expect, it } from "vitest";
import {
  computePeriodKey,
  processRule,
  type EngineOccurrence,
  type EngineRule,
  type EngineStore,
} from "./recurring.js";

const WIB = "Asia/Jakarta";

function makeRule(overrides: Partial<EngineRule> = {}): EngineRule {
  return {
    id: "rule-1",
    userId: "user-1",
    name: "WiFi",
    amount: 350_000,
    accountId: "acc-1",
    categoryId: "cat-1",
    frequency: "MONTHLY",
    dayOfMonth: 5,
    endOfMonthClamp: true,
    autoPost: false,
    isActive: true,
    ...overrides,
  };
}

/** Store fake in-memory: mencatat semua pemanggilan untuk asersi. */
function makeStore(existing: EngineOccurrence | null = null) {
  const calls = { notify: 0, transactions: 0, occurrences: existing ? 1 : 0 };
  let current: EngineOccurrence | null = existing;

  const store: EngineStore = {
    findOccurrence: async () => current,
    createOccurrence: async (input) => {
      calls.occurrences += 1;
      current = {
        id: `occ-${calls.occurrences}`,
        status: "PENDING",
        transactionId: null,
        notifiedAt: null,
      };
      void input;
      return current;
    },
    createTransaction: async () => {
      calls.transactions += 1;
      return { id: `txn-${calls.transactions}` };
    },
    markPaid: async (id, txnId) => {
      if (current && current.id === id) {
        current = { ...current, status: "PAID", transactionId: txnId };
      }
    },
    markNotified: async (id, at) => {
      if (current && current.id === id) {
        current = { ...current, notifiedAt: at };
      }
    },
    notify: async () => {
      calls.notify += 1;
    },
  };

  return { store, calls, getCurrent: () => current };
}

// 10 Maret 2026 05:00 UTC = 10 Maret 12:00 WIB.
const MARCH_10 = new Date("2026-03-10T05:00:00.000Z");

describe("computePeriodKey", () => {
  it("bulanan memakai YYYY-MM", () => {
    expect(computePeriodKey("MONTHLY", 2026, 9)).toBe("2026-09");
  });

  it("tahunan memakai YYYY", () => {
    expect(computePeriodKey("YEARLY", 2026, 9)).toBe("2026");
  });
});

describe("processRule", () => {
  it("membuat occurrence PENDING tanpa notifikasi bila belum jatuh tempo", async () => {
    const { store, calls } = makeStore();

    const outcome = await processRule(store, makeRule({ dayOfMonth: 15 }), MARCH_10, WIB);

    expect(outcome).toBe("waiting");
    expect(calls.occurrences).toBe(1);
    expect(calls.notify).toBe(0);
    expect(calls.transactions).toBe(0);
  });

  it("mengirim pengingat sekali saat jatuh tempo tanpa autoPost", async () => {
    const { store, calls } = makeStore();

    const outcome = await processRule(store, makeRule({ dayOfMonth: 10 }), MARCH_10, WIB);

    expect(outcome).toBe("reminded");
    expect(calls.notify).toBe(1);
    expect(calls.transactions).toBe(0);
  });

  it("idempoten: run kedua tidak mengirim ulang", async () => {
    const { store, calls } = makeStore();
    const rule = makeRule({ dayOfMonth: 10 });

    expect(await processRule(store, rule, MARCH_10, WIB)).toBe("reminded");
    expect(await processRule(store, rule, MARCH_10, WIB)).toBe("skipped");
    expect(calls.notify).toBe(1);
  });

  it("autoPost mencatat transaksi dan menandai PAID", async () => {
    const { store, calls, getCurrent } = makeStore();
    const rule = makeRule({ dayOfMonth: 10, autoPost: true });

    const outcome = await processRule(store, rule, MARCH_10, WIB);

    expect(outcome).toBe("posted");
    expect(calls.transactions).toBe(1);
    expect(getCurrent()?.status).toBe("PAID");
    expect(await processRule(store, rule, MARCH_10, WIB)).toBe("skipped");
    expect(calls.transactions).toBe(1);
  });

  it("melewati occurrence yang sudah PAID", async () => {
    const { store, calls } = makeStore({
      id: "occ-9",
      status: "PAID",
      transactionId: "txn-9",
      notifiedAt: null,
    });

    expect(await processRule(store, makeRule(), MARCH_10, WIB)).toBe("skipped");
    expect(calls.notify).toBe(0);
    expect(calls.transactions).toBe(0);
  });

  it("melewati rule nonaktif", async () => {
    const { store, calls } = makeStore();

    expect(await processRule(store, makeRule({ isActive: false }), MARCH_10, WIB)).toBe(
      "skipped",
    );
    expect(calls.occurrences).toBe(0);
  });

  it("menjepit tanggal 31 ke 28 Februari tahun biasa", async () => {
    const { store, calls } = makeStore();
    // 28 Feb 2026 sudah lewat dari due-date terjepit (28) — tepat jatuh tempo.
    const feb28 = new Date("2026-02-28T05:00:00.000Z");

    expect(await processRule(store, makeRule({ dayOfMonth: 31 }), feb28, WIB)).toBe(
      "reminded",
    );
    expect(calls.notify).toBe(1);
  });

  it("menjepit tanggal 31 ke 29 Februari tahun kabisat", async () => {
    const { store, calls } = makeStore();
    // 29 Feb 2028 05:00 UTC = 29 Feb 12:00 WIB.
    const feb29 = new Date("2028-02-29T05:00:00.000Z");

    expect(await processRule(store, makeRule({ dayOfMonth: 31 }), feb29, WIB)).toBe(
      "reminded",
    );
    expect(calls.notify).toBe(1);
  });

  it("belum jatuh tempo bila hari ini sebelum tanggal terjepit", async () => {
    const { store, calls } = makeStore();
    // 27 Feb 2026: due-date terjepit adalah 28.
    const feb27 = new Date("2026-02-27T05:00:00.000Z");

    expect(await processRule(store, makeRule({ dayOfMonth: 31 }), feb27, WIB)).toBe(
      "waiting",
    );
    expect(calls.notify).toBe(0);
  });

  it("menandai frekuensi non-bulanan sebagai unsupported", async () => {
    const { store, calls } = makeStore();

    expect(
      await processRule(store, makeRule({ frequency: "YEARLY" }), MARCH_10, WIB),
    ).toBe("unsupported");
    expect(calls.occurrences).toBe(0);
  });

  it("memakai zona waktu pengguna untuk penentuan hari", async () => {
    const { store } = makeStore();
    // 9 Mar 18:30 UTC = 10 Mar 01:30 WIB (sudah tanggal 10) tetapi
    // 9 Mar di UTC. Rule jatuh tempo tanggal 10.
    const edge = new Date("2026-03-09T18:30:00.000Z");

    expect(await processRule(store, makeRule({ dayOfMonth: 10 }), edge, WIB)).toBe(
      "reminded",
    );
  });

  it("mengirim notifikasi dengan nama dan nominal tagihan", async () => {
    const notified: Array<{ title: string; body: string }> = [];
    const { store } = makeStore();
    const spied: EngineStore = {
      ...store,
      notify: async (_userId, title, body) => {
        notified.push({ title, body });
      },
    };

    await processRule(spied, makeRule({ dayOfMonth: 10 }), MARCH_10, WIB);

    expect(notified).toHaveLength(1);
    expect(notified[0]?.title).toContain("WiFi");
    expect(notified[0]?.body).toContain("350");
  });
});

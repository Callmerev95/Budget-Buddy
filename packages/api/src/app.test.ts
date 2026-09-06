import http from "node:http";
import type { Express } from "express";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Test integrasi ringan untuk lapisan HTTP.
 *
 * Tidak menyentuh database: semua endpoint yang diuji ditolak sebelum query
 * (401/404/503) atau tidak butuh database sama sekali (health, push config).
 * Ini juga memverifikasi bahwa Express berjalan sebagai satu app yang bisa
 * diekspor, bentuk yang dibutuhkan Vercel Function.
 */

let app: Express;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  // Jangan muat .env asli: test ini mengontrol environment sendiri,
  // termasuk CRON_SECRET yang dikosongkan untuk jalur 503.
  process.env.DOTENV_PATH = "none";
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
  process.env.SUPABASE_URL ??= "https://test.supabase.co";
  process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
  process.env.APP_URL ??= "http://localhost:5173";

  // Test cron 503 membutuhkan CRON_SECRET kosong.
  delete process.env.CRON_SECRET;

  const { buildApp } = await import("./app.js");
  app = buildApp();
});

interface Result {
  status: number;
  body: string;
}

async function request(
  path: string,
  options: { headers?: Record<string, string>; method?: string } = {},
): Promise<Result> {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  try {
    return await new Promise<Result>((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port,
          path,
          method: options.method ?? "GET",
          headers: options.headers,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
        },
      );

      req.on("error", reject);
      req.end();
    });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe("health", () => {
  it("melaporkan status ok", async () => {
    const res = await request("/api/health");

    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).status).toBe("ok");
  });
});

describe("proteksi auth", () => {
  it.each([
    "/api/user/me",
    "/api/transactions",
    "/api/transactions/summary",
    "/api/fixed-expenses",
    "/api/recurring",
  ])("menolak %s tanpa token", async (path) => {
    const res = await request(path);

    expect(res.status).toBe(401);
  });

  it("menolak token yang tidak valid", async () => {
    const res = await request("/api/user/me", {
      headers: { Authorization: "Bearer token-palsu" },
    });

    expect(res.status).toBe(401);
  });

  it("menolak skema Authorization selain Bearer", async () => {
    const res = await request("/api/user/me", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });

    expect(res.status).toBe(401);
  });
});

describe("push config", () => {
  it("terbuka untuk publik dan melaporkan status web push", async () => {
    const res = await request("/api/push/config");
    const body = JSON.parse(res.body) as { enabled: boolean; publicKey: string | null };

    expect(res.status).toBe(200);
    expect(body.enabled).toBe(false);
    expect(body.publicKey).toBeNull();
  });
});

describe("cron", () => {
  it("menolak pemanggilan ketika CRON_SECRET belum diatur", async () => {
    const res = await request("/api/cron/daily");

    expect(res.status).toBe(503);
  });
});

describe("route tidak dikenal", () => {
  it("mengembalikan 404 dengan pesan JSON", async () => {
    const res = await request("/api/entah-apa");

    expect(res.status).toBe(404);
    expect(JSON.parse(res.body).message).toBe("Endpoint tidak ditemukan.");
  });
});

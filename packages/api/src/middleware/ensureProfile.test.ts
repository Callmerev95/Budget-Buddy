import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { NextFunction, Request, Response } from "express";

vi.mock("./auth.js", () => ({ getAuth: vi.fn() }));
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

import { getAuth } from "./auth.js";
import { prisma } from "../lib/prisma.js";
import { ensureProfile } from "./ensureProfile.js";

// P2002 = unique constraint violation, persis yang dilempar Prisma.
function uniqueConflict(): Error {
  return Object.assign(
    new Error("Unique constraint failed on the fields: (`supabase_id`)"),
    { code: "P2002" },
  );
}

const AUTH = { userId: "suid-1", email: "rev@example.com", name: null };

type ProfileRow = { id: string; email?: string | null; name?: string | null };
type FindUniqueArgs = {
  where: { supabase_id?: string; email?: string };
  select?: { id?: boolean; email?: boolean; name?: boolean };
};
type FindUniqueFn = Mock<(args: FindUniqueArgs) => Promise<ProfileRow | null>>;
type CreateFn = Mock<
  (args: {
    data: Record<string, unknown>;
    select: { id: boolean };
  }) => Promise<ProfileRow>
>;
type UpdateFn = Mock<
  (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<ProfileRow>
>;

interface RunResult {
  req: Request;
  passedError: unknown;
  calledNext: boolean;
}

async function run(profile: {
  userId?: string;
  email?: string;
  name?: string | null;
}): Promise<RunResult> {
  const req = {} as Request;
  const res = {} as Response;

  let passedError: unknown;
  let calledNext = false;

  const next = ((error?: unknown) => {
    calledNext = true;
    passedError = error;
  }) as NextFunction;

  vi.mocked(getAuth).mockReturnValue({
    userId: profile.userId ?? AUTH.userId,
    email: profile.email ?? AUTH.email,
    name: profile.name ?? AUTH.name,
  });

  await ensureProfile(req, res, next);

  return { req, passedError, calledNext };
}

describe("ensureProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const findUnique = prisma.user.findUnique as unknown as FindUniqueFn;
  const create = prisma.user.create as unknown as CreateFn;
  const update = prisma.user.update as unknown as UpdateFn;

  it("memakai profil yang sudah ada tanpa menulis apa pun", async () => {
    findUnique.mockResolvedValueOnce({
      id: "prof-1",
      email: AUTH.email,
      name: "Rev",
    });

    const { req, passedError, calledNext } = await run({ name: "Rev" });

    expect(passedError).toBeUndefined();
    expect(calledNext).toBe(true);
    expect(req.profileId).toBe("prof-1");
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("menyegarkan email/nama bila profil lama berbeda dari klaim", async () => {
    findUnique.mockResolvedValueOnce({
      id: "prof-1",
      email: "lama@example.com",
      name: "Rev",
    });
    update.mockResolvedValueOnce({ id: "prof-1" });

    const { req } = await run({ name: "Rev", email: AUTH.email });

    expect(req.profileId).toBe("prof-1");
    expect(update).toHaveBeenCalledWith({
      where: { id: "prof-1" },
      data: { email: AUTH.email, name: "Rev" },
    });
  });

  it("membuat profil baru saat belum ada", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ id: "prof-baru" });

    const { req, passedError } = await run({ name: "Revangga" });

    expect(passedError).toBeUndefined();
    expect(req.profileId).toBe("prof-baru");
    expect(create).toHaveBeenCalledWith({
      data: { supabase_id: AUTH.userId, email: AUTH.email, name: "Revangga" },
      select: { id: true },
    });
  });

  it("menggunakan nama dari email saat klaim tanpa nama", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ id: "prof-baru" });

    const { req } = await run({ name: null });

    expect(req.profileId).toBe("prof-baru");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "rev" }) }),
    );
  });

  it("mengadopsi baris yang baru dibuat request paralel (race P2002)", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce(uniqueConflict());
    findUnique.mockResolvedValueOnce({ id: "prof-pemenang" });

    const { req, passedError } = await run({ name: null });

    expect(passedError).toBeUndefined();
    expect(req.profileId).toBe("prof-pemenang");
    // Berhenti di re-lookup by supabase_id — tidak perlu klaim ulang.
    expect(update).not.toHaveBeenCalled();
  });

  it("mengklaim ulang orphan email yang tertinggal (post-hapus akun)", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce(uniqueConflict());
    findUnique.mockResolvedValueOnce(null);
    findUnique.mockResolvedValueOnce({ id: "prof-orphan" });
    update.mockResolvedValueOnce({ id: "prof-orphan" });

    const { req, passedError } = await run({ name: "Rev" });

    expect(passedError).toBeUndefined();
    expect(req.profileId).toBe("prof-orphan");
    expect(update).toHaveBeenCalledWith({
      where: { id: "prof-orphan" },
      data: { supabase_id: AUTH.userId, name: "Rev" },
    });
  });

  it("melempar error non-unique ke error handler", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce(new Error("koneksi putus"));

    const { req, passedError, calledNext } = await run({ name: null });

    expect(calledNext).toBe(true);
    expect(passedError).toBeInstanceOf(Error);
    expect(req.profileId).toBeUndefined();
  });

  it("melempar ulang P2002 bila tidak ada baris yang bisa diadopsi", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce(uniqueConflict());
    findUnique.mockResolvedValueOnce(null);
    findUnique.mockResolvedValueOnce(null);

    const { passedError, calledNext } = await run({ name: null });

    expect(calledNext).toBe(true);
    expect(passedError).toBeInstanceOf(Error);
    expect(update).not.toHaveBeenCalled();
  });
});

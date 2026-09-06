import { describe, expect, it } from "vitest";
import { resolveDisplayName } from "../lib/claims.js";

describe("resolveDisplayName", () => {
  it("mengambil full_name dari user_metadata", () => {
    expect(resolveDisplayName({ user_metadata: { full_name: "Revangga" } })).toBe(
      "Revangga",
    );
  });

  it("memangkas spasi di sekitar nama", () => {
    expect(resolveDisplayName({ user_metadata: { full_name: "  Rev  " } })).toBe("Rev");
  });

  it("mengembalikan null bila metadata tidak ada", () => {
    expect(resolveDisplayName({})).toBeNull();
  });

  it("mengembalikan null bila metadata bukan objek", () => {
    expect(resolveDisplayName({ user_metadata: "Rev" })).toBeNull();
  });

  it("mengembalikan null bila full_name bukan string", () => {
    expect(resolveDisplayName({ user_metadata: { full_name: 42 } })).toBeNull();
  });

  it("mengembalikan null bila full_name hanya spasi", () => {
    expect(resolveDisplayName({ user_metadata: { full_name: "   " } })).toBeNull();
  });
});

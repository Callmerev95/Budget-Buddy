import { describe, expect, it } from "vitest";
import { buildCspDirectives } from "./csp.js";

const directives = buildCspDirectives({ supabaseUrl: "https://abc.supabase.co" });

describe("buildCspDirectives", () => {
  it("tidak mengizinkan inline script atau eval", () => {
    expect(directives["script-src"]).toContain("'self'");
    expect(directives["script-src"]).not.toContain("'unsafe-inline'");
  });

  it("mengizinkan widget Turnstile dan tidak lebih", () => {
    expect(directives["script-src"]).toContain("https://challenges.cloudflare.com");
    expect(directives["frame-src"]).toContain("https://challenges.cloudflare.com");
  });

  it("mengizinkan API Supabase milik sendiri", () => {
    expect(directives["connect-src"]).toContain("https://abc.supabase.co");
  });

  it("tidak membocorkan host Supabase proyek lain", () => {
    const header = JSON.stringify(directives);

    expect(header).not.toContain("xyz.supabase.co");
  });

  it("menutup frame, objek, dan form keluar", () => {
    expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    expect(directives["object-src"]).toEqual(["'none'"]);
    expect(directives["form-action"]).toEqual(["'self'"]);
  });

  it("menolak URL Supabase yang bukan URL valid", () => {
    expect(() => buildCspDirectives({ supabaseUrl: "bukan-url" })).toThrow();
  });
});

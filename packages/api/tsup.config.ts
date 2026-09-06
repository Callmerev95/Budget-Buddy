import { defineConfig } from "tsup";

/**
 * Build API menjadi JavaScript murni untuk Vercel Function.
 *
 * `@budget-buddy/shared` wajib ikut ter-bundle (noExternal): package itu
 * mengekspor source TypeScript, dan Node di serverless tidak bisa
 * mengimpor .ts. Dependency node_modules lain tetap external dan
 * ditelusuri Vercel dari node_modules seperti biasa.
 */
export default defineConfig({
  entry: ["src/app.ts"],
  format: ["esm"],
  target: "es2022",
  outDir: "dist",
  clean: true,
  dts: true,
  sourcemap: true,
  noExternal: ["@budget-buddy/shared"],
});

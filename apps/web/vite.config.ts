import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      includeAssets: ["icons/*.png", "manifest.json"],
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      },
      devOptions: { enabled: false },
    }),
  ],
  // .env tinggal di root monorepo, bukan apps/web. Hanya variabel
  // VITE_* yang di-inline ke bundle, jadi aman.
  envDir: path.resolve(rootDir, "../.."),
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("@supabase")) return "vendor-supabase";
          return "vendor";
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Di produksi web dan API berbagi origin. Proxy ini menyamakan
      // perilaku tersebut saat pengembangan lokal.
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

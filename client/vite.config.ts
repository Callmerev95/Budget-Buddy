import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

/* Fix __dirname untuk tipe modul ESM [cite: 2026-02-03] */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      /* Pastikan path ini benar-benar mengarah ke folder shared [cite: 2026-02-03] */
      "@shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      /* Proxy ini hanya jalan di lokal (npm run dev) [cite: 2026-02-03] */
      "/api": "http://localhost:5000",
    },
  },
});

/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "@prisma/config"; // Pastikan pakai @prisma/config

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Prisma 7 otomatis tahu folder migrations, tapi kita eksplisitkan tidak apa-apa
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

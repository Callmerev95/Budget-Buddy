import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// 1. Buat pool koneksi menggunakan library 'pg'
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// 2. Buat adapter Prisma untuk PostgreSQL
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke constructor (Ini yang diminta Prisma 7!)
const prisma = new PrismaClient({ adapter });

export default prisma;

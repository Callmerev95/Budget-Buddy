import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
// Import schema dari shared folder
import { registerSchema } from '../../shared/src/schemas/auth.schema.js';
import prisma from './lib/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Register
app.post('/api/auth/register', async (req, res) => {
  try {
    // 1. Validasi input pakai Zod (Shared Schema)
    const validatedData = registerSchema.parse(req.body);

    // 2. Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah dipakai, bro!' });
    }

    // 3. Hash password (Keamanan nomor 1)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // 4. Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      }
    });

    return res.status(201).json({ 
      message: 'User berhasil terdaftar! 🚀',
      userId: newUser.id 
    });

  } catch (error: any) {
    // Menangkap error validasi Zod
    if (error.errors) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (_req, res) => {
  res.send('BudgetBuddy API is running... 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is sprinting on port ${PORT}`);
});
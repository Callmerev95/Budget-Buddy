import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Akses ditolak" });
    return; // Tambahkan return agar tidak lanjut ke bawah
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret_budget_buddy_123",
    (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ message: "Token tidak valid" });
        return; // Tambahkan return di sini juga
      }

      req.user = decoded;
      next(); // Lanjut ke fungsi berikutnya
    },
  );
};

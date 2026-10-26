import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Konfigurasi Pooler Khusus Serverless Vercel & Supabase
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: 5, // Batasi maksimal 5 koneksi per worker lambda agar tidak memonopoli pool Supabase
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 10000,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Simpan instance ke globalThis agar worker yang aktif di Vercel tidak membuat pool baru
globalForPrisma.prisma = prisma;

import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BLOCK_MS = 15 * 60 * 1000; // 15 menit

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export type RateLimitOptions = {
  windowMs?: number;
  maxAttempts?: number;
  blockMs?: number;
};

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Membersihkan data rate limit yang telah kedaluwarsa secara berkala (F-23).
 * Mencegah tabel auth_rate_limits membengkak seiring waktu.
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const now = new Date();
  const threshold = new Date(now.getTime() - DEFAULT_WINDOW_MS);

  try {
    const result = await prisma.authRateLimit.deleteMany({
      where: {
        windowStartedAt: {
          lt: threshold,
        },
        OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }],
      },
    });

    return result.count;
  } catch (error) {
    console.error("[RateLimit Cleanup Error]:", error);
    return 0;
  }
}

/**
 * Mengonsumsi kuota rate limit secara langsung tanpa interactive transaction
 * untuk mencegah connection pool timeout pada driver Prisma (F-08 & F-10).
 */
export async function consumeAuthRateLimit(
  rawKey: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const blockMs = options?.blockMs ?? DEFAULT_BLOCK_MS;

  const key = hashKey(rawKey);
  const now = new Date();

  // Pembersihan berkala ringan di latar belakang secara probabilistik (5% request)
  if (Math.random() < 0.05) {
    cleanupExpiredRateLimits().catch(() => {});
  }

  try {
    const record = await prisma.authRateLimit.findUnique({
      where: { key },
    });

    // 1. Jika masih dalam masa blokir aktif
    if (record?.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(
          (record.blockedUntil.getTime() - now.getTime()) / 1000,
        ),
      };
    }

    // 2. Jika record belum ada atau jendela waktu (window) telah kedaluwarsa
    if (
      !record ||
      now.getTime() - record.windowStartedAt.getTime() >= windowMs
    ) {
      await prisma.authRateLimit.upsert({
        where: { key },
        create: {
          key,
          attempts: 1,
          windowStartedAt: now,
          blockedUntil: null,
        },
        update: {
          attempts: 1,
          windowStartedAt: now,
          blockedUntil: null,
        },
      });

      return {
        allowed: true,
        retryAfterSeconds: 0,
      };
    }

    // 3. Jika jumlah percobaan berikutnya melampaui batas maksimal
    const nextAttempts = record.attempts + 1;

    if (nextAttempts > maxAttempts) {
      const blockedUntil = new Date(now.getTime() + blockMs);

      await prisma.authRateLimit.update({
        where: { key },
        data: {
          attempts: nextAttempts,
          blockedUntil,
        },
      });

      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(blockMs / 1000),
      };
    }

    // 4. Tambah percobaan dengan aman secara atomik
    await prisma.authRateLimit.update({
      where: { key },
      data: {
        attempts: { increment: 1 },
      },
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  } catch (error) {
    console.error("[RateLimit Error]:", error);
    // Fail-open: jika terjadi kendala pada tabel rate limit, jangan menggagalkan login pengguna yang sah
    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }
}

/**
 * Mereset kuota rate limit setelah autentikasi berhasil (F-10).
 * Menghapus counter percobaan gagal agar pengguna yang sah tidak terblokir.
 */
export async function resetAuthRateLimit(rawKey: string): Promise<void> {
  const key = hashKey(rawKey);

  try {
    await prisma.authRateLimit.deleteMany({
      where: { key },
    });
  } catch {
    // Abaikan jika record tidak ditemukan
  }
}

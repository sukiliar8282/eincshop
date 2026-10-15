import { createHash } from "node:crypto";

import { prisma } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function consumeAuthRateLimit(
  rawKey: string,
): Promise<RateLimitResult> {
  const key = hashKey(rawKey);
  const now = new Date();

  const record = await prisma.authRateLimit.findUnique({
    where: { key },
  });

  if (record?.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (record.blockedUntil.getTime() - now.getTime()) / 1000,
      ),
    };
  }

  if (
    !record ||
    now.getTime() - record.windowStartedAt.getTime() >= WINDOW_MS
  ) {
    await prisma.authRateLimit.upsert({
      where: { key },
      create: {
        key,
        attempts: 1,
        windowStartedAt: now,
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

  const nextAttempts = record.attempts + 1;

  if (nextAttempts > MAX_ATTEMPTS) {
    const blockedUntil = new Date(now.getTime() + BLOCK_MS);

    await prisma.authRateLimit.update({
      where: { key },
      data: {
        attempts: nextAttempts,
        blockedUntil,
      },
    });

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(BLOCK_MS / 1000),
    };
  }

  await prisma.authRateLimit.update({
    where: { key },
    data: {
      attempts: nextAttempts,
    },
  });

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

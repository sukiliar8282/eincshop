import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/db";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function hashOtp(identifier: string, code: string): string {
  return createHash("sha256")
    .update(`${identifier.trim().toLowerCase()}:${code.trim()}`)
    .digest("hex");
}

/**
 * Generates a random 6-digit cryptographic OTP code and stores its SHA-256 hash.
 */
export async function generateEmailOtp(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const rawOtp = randomInt(100000, 1000000).toString();
  const tokenHash = hashOtp(normalizedEmail, rawOtp);
  const expires = new Date(Date.now() + OTP_EXPIRY_MS);

  // Clean up previous unexpired tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: normalizedEmail,
    },
  });

  // Save new hashed token
  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token: tokenHash,
      expires,
    },
  });

  return rawOtp;
}

/**
 * Verifies the OTP code submitted by the user.
 * Deletes token immediately upon valid use and updates emailVerified timestamp.
 */
export async function verifyEmailOtp(
  email: string,
  inputCode: string,
): Promise<{ valid: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = inputCode.trim();

  if (!/^\d{6}$/.test(trimmedCode)) {
    return {
      valid: false,
      error: "Verification code must be 6 digits.",
    };
  }

  const tokenHash = hashOtp(normalizedEmail, trimmedCode);
  const now = new Date();

  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: normalizedEmail,
      token: tokenHash,
    },
  });

  if (!record) {
    return {
      valid: false,
      error: "Invalid or incorrect verification code.",
    };
  }

  if (record.expires < now) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });
    return {
      valid: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  // Token is valid: delete immediately to ensure single-use protection
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  // Mark email as verified in database
  await prisma.user.updateMany({
    where: { email: normalizedEmail },
    data: { emailVerified: now },
  });

  return { valid: true };
}

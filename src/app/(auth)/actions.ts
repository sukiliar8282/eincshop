"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRequestIp } from "@/lib/security/request";
import {
  consumeAuthRateLimit,
  resetAuthRateLimit,
} from "@/lib/security/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { writeAuditLog } from "@/lib/security/audit";
import { credentialsSchema, registrationSchema } from "@/lib/validation/auth";
import { generateEmailOtp, verifyEmailOtp } from "@/lib/security/otp";
import { sendOtpEmail } from "@/lib/email/sender";
import { getLocale } from "@/lib/i18n/server";
import { sanitizeLocale } from "@/lib/i18n/config";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const formLocale = formData.get("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  const rawInput = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registrationSchema.safeParse(rawInput);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    return {
      error:
        firstIssue ||
        (isEn
          ? "Invalid name, email, or password."
          : "Nama, email, atau password belum sesuai."),
    };
  }

  const normalizedEmail = parsed.data.email;
  const requestIp = await getRequestIp();

  // 1. Verifikasi Cloudflare Turnstile CAPTCHA
  const turnstileToken = formData.get("cf-turnstile-response");
  const isHuman = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : "",
    requestIp,
  );

  if (!isHuman) {
    return {
      error: isEn
        ? "Security verification (CAPTCHA) failed. Please check the box again."
        : "Verifikasi keamanan (CAPTCHA) gagal. Silakan centang kembali.",
    };
  }

  // 2. Proteksi Anti-Spam Rate Limit (Maksimal 5 pendaftaran per IP dalam 15 menit)
  const rateLimit = await consumeAuthRateLimit(`register:${requestIp}`, {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      error: isEn
        ? "Too many registration attempts. Please try again later."
        : "Terlalu banyak percobaan. Silakan coba lagi nanti.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      emailVerified: true,
    },
  });

  // Jika akun sudah terdaftar dan email-nya sudah aktif terverifikasi
  if (existingUser && existingUser.emailVerified) {
    return {
      error: isEn
        ? "Unable to process registration with that data."
        : "Registrasi tidak dapat diproses dengan data tersebut.",
    };
  }

  if (existingUser) {
    // Akun sudah ada namun email belum diverifikasi:
    // Perbarui nama & password terbaru, lalu kirim ulang kode OTP
    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: parsed.data.name,
        passwordHash,
      },
    });
  } else {
    // Buat akun baru dengan emailVerified: null
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
        status: "ACTIVE",
        emailVerified: null,
      },
      select: { id: true },
    });

    // Pencatatan Jejak Audit: Registrasi Akun Baru Berhasil
    await writeAuditLog({
      actorUserId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      ipAddress: requestIp,
      metadata: {
        email: normalizedEmail,
        role: "CUSTOMER",
      },
    });
  }

  // 3. Generate Kode OTP 6 Digit dan Kirimkan ke Email
  const otp = await generateEmailOtp(normalizedEmail);
  await sendOtpEmail({ email: normalizedEmail, otp, isEn });

  // 4. Alihkan browser ke halaman /verify-otp
  redirect(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}`);
}

export async function verifyOtpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const formLocale = formData.get("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  const email = formData.get("email");
  const otp = formData.get("otp");

  if (typeof email !== "string" || !email) {
    return {
      error: isEn ? "Invalid email parameter." : "Parameter email tidak valid.",
    };
  }

  if (typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
    return {
      error: isEn
        ? "Verification code must be 6 digits."
        : "Kode OTP harus berupa 6 digit angka.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const requestIp = await getRequestIp();

  // Proteksi Brute-Force OTP: Maksimal 5 percobaan salah per 10 menit
  const rateLimit = await consumeAuthRateLimit(
    `otp:${normalizedEmail}:${requestIp}`,
    {
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    },
  );

  if (!rateLimit.allowed) {
    return {
      error: isEn
        ? `Too many incorrect attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`
        : `Terlalu banyak percobaan kode OTP yang salah. Harap tunggu ${rateLimit.retryAfterSeconds} detik.`,
    };
  }

  const result = await verifyEmailOtp(normalizedEmail, otp);

  if (!result.valid) {
    return {
      error:
        result.error ||
        (isEn
          ? "Invalid or expired verification code."
          : "Kode OTP tidak valid atau telah kedaluwarsa."),
    };
  }

  // Reset rate limit jika kode OTP valid
  await resetAuthRateLimit(`otp:${normalizedEmail}:${requestIp}`);

  // Catat jejak audit verifikasi email berhasil
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (user) {
    await writeAuditLog({
      actorUserId: user.id,
      action: "USER_EMAIL_VERIFIED",
      entityType: "User",
      entityId: user.id,
      ipAddress: requestIp,
      metadata: { email: normalizedEmail },
    });
  }

  // Jika sudah memiliki sesi login aktif (misalnya login via Google OAuth), langsung ke /account
  const session = await auth();
  if (session?.user) {
    redirect("/account");
  }

  // Alihkan ke halaman masuk dengan banner sukses verifikasi (untuk alur pendaftaran manual)
  redirect("/login?verified=true");
}

export async function resendOtpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const formLocale = formData.get("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  const email = formData.get("email");

  if (typeof email !== "string" || !email) {
    return {
      error: isEn ? "Invalid email parameter." : "Parameter email tidak valid.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const requestIp = await getRequestIp();

  // Rate limiting resend OTP: maksimal 3 kali permintaan per 10 menit
  const rateLimit = await consumeAuthRateLimit(
    `resend-otp:${normalizedEmail}:${requestIp}`,
    {
      maxAttempts: 3,
      windowMs: 10 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    },
  );

  if (!rateLimit.allowed) {
    return {
      error: isEn
        ? `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds before requesting a new code.`
        : `Terlalu sering meminta kode baru. Harap tunggu ${rateLimit.retryAfterSeconds} detik sebelum mencoba lagi.`,
    };
  }

  const otp = await generateEmailOtp(normalizedEmail);
  await sendOtpEmail({ email: normalizedEmail, otp, isEn });

  return {
    success: isEn
      ? "A new verification code has been sent to your email."
      : "Kode keamanan verifikasi baru telah dikirimkan ke email Anda.",
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const formLocale = formData.get("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: isEn
        ? "Invalid email or password format."
        : "Email atau password belum sesuai.",
    };
  }

  const normalizedEmail = parsed.data.email;
  const requestIp = await getRequestIp();

  // 1. Verifikasi Cloudflare Turnstile CAPTCHA
  const turnstileToken = formData.get("cf-turnstile-response");
  const isHuman = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : "",
    requestIp,
  );

  if (!isHuman) {
    return {
      error: isEn
        ? "Security verification (CAPTCHA) failed. Please check the box again."
        : "Verifikasi keamanan (CAPTCHA) gagal. Silakan centang kembali.",
    };
  }

  // 2. Proteksi Anti-Brute Force Rate Limit (5 percobaan per 15 menit)
  const pairKey = `login:${normalizedEmail}:${requestIp}`;
  const rateLimit = await consumeAuthRateLimit(pairKey, {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      error: isEn
        ? `Too many failed login attempts. Account temporarily locked for ${rateLimit.retryAfterSeconds} seconds.`
        : `Terlalu banyak percobaan masuk yang gagal. Akun dikunci sementara selama ${rateLimit.retryAfterSeconds} detik.`,
    };
  }

  // Cek apakah akun ada dan password cocok, namun email belum diverifikasi
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, passwordHash: true, status: true, emailVerified: true },
  });

  if (existingUser && existingUser.passwordHash) {
    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      existingUser.passwordHash,
    );

    if (isPasswordValid && !existingUser.emailVerified) {
      // User belum verifikasi email: Kirim OTP baru dan arahkan langsung ke /verify-otp
      const otp = await generateEmailOtp(normalizedEmail);
      await sendOtpEmail({ email: normalizedEmail, otp, isEn });
      redirect(
        `/verify-otp?email=${encodeURIComponent(normalizedEmail)}&unverified=true`,
      );
    }
  }

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Pencatatan Jejak Audit: Percobaan Login Gagal
      if (existingUser) {
        await writeAuditLog({
          actorUserId: existingUser.id,
          action: "AUTH_LOGIN_FAILED",
          entityType: "User",
          entityId: existingUser.id,
          ipAddress: requestIp,
          metadata: { reason: "INVALID_CREDENTIALS" },
        });
      }

      return {
        error: isEn
          ? "Invalid email or password."
          : "Email atau password salah.",
      };
    }

    // Jika autentikasi berhasil (NextAuth melempar redirect):
    // 1. Reset rate limit counter
    await resetAuthRateLimit(pairKey);

    // 2. Catat jejak audit login sukses
    if (existingUser) {
      await writeAuditLog({
        actorUserId: existingUser.id,
        action: "AUTH_LOGIN_SUCCESS",
        entityType: "User",
        entityId: existingUser.id,
        ipAddress: requestIp,
      });
    }

    throw error;
  }

  await resetAuthRateLimit(pairKey);
  return {};
}

/**
 * Server Action Resmi: Logout Akun Pengguna
 * Mengakhiri sesi pengguna secara aman dan mengarahkan kembali ke halaman beranda.
 */
export async function logoutAction(): Promise<void> {
  await signOut({
    redirectTo: "/",
  });
}

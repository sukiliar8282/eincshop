"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRequestIp } from "@/lib/security/request";
import { consumeAuthRateLimit } from "@/lib/security/rate-limit";
import { hashPassword } from "@/lib/security/password";
import { credentialsSchema, registrationSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  error?: string;
};

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawInput = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registrationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Nama, email, atau password belum sesuai.",
    };
  }

  const requestIp = await getRequestIp();

  const rateLimit = await consumeAuthRateLimit(`register:${requestIp}`);

  if (!rateLimit.allowed) {
    return {
      error: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      error: "Registrasi tidak dapat diproses dengan data tersebut.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Akun berhasil dibuat, tetapi login belum berhasil.",
      };
    }

    throw error;
  }

  if (!user.id) {
    return {
      error: "Registrasi tidak dapat diproses.",
    };
  }

  redirect("/account");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Email atau password belum sesuai.",
    };
  }

  const requestIp = await getRequestIp();

  const rateLimit = await consumeAuthRateLimit(
    `login:${parsed.data.email}:${requestIp}`,
  );

  if (!rateLimit.allowed) {
    return {
      error: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Email atau password salah.",
      };
    }

    throw error;
  }

  return {};
}

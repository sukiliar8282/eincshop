import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { UserRole, UserStatus } from "@/generated/prisma";

export type CurrentUserOrGuest = {
  id: string;
  email?: string | null;
  name?: string | null;
  isGuest: boolean;
};

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  status: UserStatus;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  storeName?: string | null;
};

/**
 * Mendapatkan pengguna yang sedang aktif (login) atau guest user otomatis via cookie.
 * Mengizinkan alur pembelian dan keranjang tanpa memaksa login di awal.
 * Memverifikasi bahwa akun yang terautentikasi berstatus ACTIVE (F-09).
 */
export async function getCurrentUserOrGuest(): Promise<CurrentUserOrGuest> {
  const session = await auth();

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, status: true },
    });

    if (dbUser && dbUser.status === "ACTIVE") {
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        isGuest: false,
      };
    }
  }

  const cookieStore = await cookies();
  const guestCookie = cookieStore.get("einc_guest_id")?.value;

  if (guestCookie) {
    const existingGuest = await prisma.user.findUnique({
      where: { id: guestCookie },
      select: { id: true, email: true, name: true, status: true },
    });

    if (existingGuest && existingGuest.status === "ACTIVE") {
      return {
        id: existingGuest.id,
        email: existingGuest.email,
        name: existingGuest.name,
        isGuest: true,
      };
    }
  }

  // Buat akun guest baru tanpa password untuk menampung keranjang belanja
  const newGuest = await prisma.user.create({
    data: {
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: { id: true, email: true, name: true },
  });

  cookieStore.set("einc_guest_id", newGuest.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: "/",
  });

  return {
    id: newGuest.id,
    email: newGuest.email,
    name: newGuest.name,
    isGuest: true,
  };
}

/**
 * Memastikan pengguna sudah login dan akun berstatus ACTIVE serta terverifikasi OTP (F-09 & Phase 5).
 * Jika sesi tidak ada -> redirect ke /login.
 * Jika akun tidak ditemukan atau berstatus SUSPENDED -> redirect ke /login?error=AccountSuspended.
 * Jika email belum diverifikasi -> redirect ke /verify-otp?email=...&unverified=true.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      status: true,
      emailVerified: true,
      storeName: true,
    },
  });

  if (!dbUser || dbUser.status !== "ACTIVE") {
    redirect("/login?error=AccountSuspended");
  }

  // Guard Keamanan: Pengguna wajib memverifikasi email OTP sebelum mengakses area akun
  if (!dbUser.emailVerified) {
    const emailParam = encodeURIComponent(dbUser.email || "");
    redirect(`/verify-otp?email=${emailParam}&unverified=true`);
  }

  return {
    id: dbUser.id,
    role: dbUser.role,
    status: dbUser.status,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    storeName: dbUser.storeName,
  };
}

/**
 * Guard untuk modul toko/katalog/pesanan:
 * Mengizinkan SELLER dan ADMIN yang berstatus ACTIVE untuk mengelola operasional tokonya.
 * Jika masih CUSTOMER, dialihkan ke halaman onboarding toko (/become-seller).
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const sessionUser = await requireUser();

  if (sessionUser.role !== "ADMIN" && sessionUser.role !== "SELLER") {
    redirect("/become-seller");
  }

  return sessionUser;
}

/**
 * Alias eksplisit untuk requireAdmin bagi modul penjual
 */
export const requireSeller = requireAdmin;

/**
 * Guard khusus Super Admin (hanya role ADMIN yang berstatus ACTIVE yang diizinkan).
 */
export async function requireSuperAdmin(): Promise<AuthenticatedUser> {
  const sessionUser = await requireUser();

  if (sessionUser.role !== "ADMIN") {
    redirect("/admin");
  }

  return sessionUser;
}

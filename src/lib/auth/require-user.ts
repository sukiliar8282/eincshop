import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CurrentUserOrGuest = {
  id: string;
  email?: string | null;
  name?: string | null;
  isGuest: boolean;
};

/**
 * Mendapatkan pengguna yang sedang aktif (login) atau guest user otomatis via cookie.
 * Mengizinkan alur pembelian dan keranjang tanpa memaksa login di awal.
 */
export async function getCurrentUserOrGuest(): Promise<CurrentUserOrGuest> {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      isGuest: false,
    };
  }

  const cookieStore = await cookies();
  const guestCookie = cookieStore.get("einc_guest_id")?.value;

  if (guestCookie) {
    const existingGuest = await prisma.user.findUnique({
      where: { id: guestCookie },
      select: { id: true, email: true, name: true },
    });

    if (existingGuest) {
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
 * Memastikan pengguna sudah login (Customer, Seller, atau Admin).
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

/**
 * Guard untuk modul toko/katalog/pesanan:
 * Mengizinkan SELLER dan ADMIN untuk mengelola operasional tokonya.
 * Jika masih CUSTOMER, dialihkan ke halaman onboarding toko.
 */
export async function requireAdmin() {
  const sessionUser = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: {
      role: true,
      status: true,
      storeName: true,
      name: true,
      email: true,
    },
  });

  if (
    !dbUser ||
    (dbUser.role !== "ADMIN" && dbUser.role !== "SELLER") ||
    dbUser.status !== "ACTIVE"
  ) {
    redirect("/become-seller");
  }

  return {
    ...sessionUser,
    role: dbUser.role,
    storeName: dbUser.storeName,
  };
}

/**
 * Alias eksplisit untuk requireAdmin bagi modul penjual
 */
export const requireSeller = requireAdmin;

/**
 * Guard khusus Super Admin (hanya role ADMIN yang diizinkan, misal untuk Audit Logs).
 */
export async function requireSuperAdmin() {
  const sessionUser = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: {
      role: true,
      status: true,
    },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.status !== "ACTIVE") {
    redirect("/admin");
  }

  return sessionUser;
}

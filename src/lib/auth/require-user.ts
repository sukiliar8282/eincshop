import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

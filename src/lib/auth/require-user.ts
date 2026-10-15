import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function requireAdmin() {
  const sessionUser = await requireUser();

  // Validasi langsung ke database PostgreSQL untuk keamanan level Enterprise
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
    redirect("/");
  }

  return sessionUser;
}

"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";

export async function clearAllAuditLogsAction() {
  const superAdmin = await requireSuperAdmin();

  // Hapus permanen seluruh baris audit log
  await prisma.auditLog.deleteMany({});

  // Catat 1 entri baru yang menandai bahwa seluruh log sebelumnya telah dibersihkan oleh Super Admin
  await prisma.auditLog.create({
    data: {
      actorUserId: superAdmin.id,
      action: "AUDIT_LOGS_PURGED",
      entityType: "AuditLog",
      metadata: {
        purgedBy: superAdmin.email || superAdmin.name,
        purgedAt: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/admin/audit-logs");
  return { success: true };
}

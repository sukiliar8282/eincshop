import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";

type AuditLogInput = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
};

export async function writeAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
      },
    });
  } catch (error) {
    console.error("[AuditLog Error]: Gagal mencatat jejak audit:", error);
  }
}

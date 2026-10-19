import type { Metadata } from "next";

import { requireSuperAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function AuditLogsPage() {
  // Hanya Super Admin (bukan seller biasa) yang dapat mengakses riwayat audit sistem
  await requireSuperAdmin();

  const logs = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Sistem & Kepatuhan
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Audit Logs
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Rekam jejak setiap aksi administratif di sistem platform.
          </p>

          <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Aktor</th>
                    <th className="px-4 py-3">Aksi</th>
                    <th className="px-4 py-3">Tipe Entitas</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--color-canvas)]">
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-muted)]">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                        {log.actor.name || log.actor.email}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--color-accent-strong)]">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        {log.entityType}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-[11px]">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                      >
                        Belum ada riwayat audit log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

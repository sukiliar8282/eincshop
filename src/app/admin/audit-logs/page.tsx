import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function AuditLogsPage() {
  await requireAdmin();

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
        <div className="max-w-7xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Security
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Audit logs
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Catatan aktivitas sensitif yang dilakukan oleh admin.
          </p>

          <div className="mobile-scroll mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Time</th>
                  <th className="px-5 py-4 font-semibold">Actor</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                  <th className="px-5 py-4 font-semibold">Entity</th>
                  <th className="px-5 py-4 font-semibold">Metadata</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-line)]">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-[var(--color-text-muted)]">
                      {log.createdAt.toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-ink)]">
                        {log.actor.name ?? "Unnamed"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {log.actor.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-medium text-[var(--color-ink)]">
                      {log.action}
                    </td>

                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      <p>{log.entityType}</p>
                      {log.entityId && (
                        <p className="mt-1 max-w-[220px] truncate text-xs">
                          {log.entityId}
                        </p>
                      )}
                    </td>

                    <td className="max-w-[320px] px-5 py-4">
                      <code className="block whitespace-pre-wrap break-words text-xs text-[var(--color-text-muted)]">
                        {log.metadata ? JSON.stringify(log.metadata) : "-"}
                      </code>
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-[var(--color-text-muted)]"
                    >
                      Belum ada audit log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </main>
  );
}

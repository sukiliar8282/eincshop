import Link from "next/link";
import type { Metadata } from "next";

import { requireSuperAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/lib/i18n/server";
import { AuditLogsTable } from "./audit-logs-table";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function AuditLogsPage() {
  // Hanya Super Admin (bukan seller biasa) yang dapat mengakses riwayat audit sistem
  await requireSuperAdmin();
  const { locale } = await getDictionary();
  const isEn = locale === "en";

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
          {/* Breadcrumb Navigasi */}
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline mb-2"
          >
            {isEn
              ? "← Back to Admin Dashboard"
              : "← Kembali ke Dashboard Admin"}
          </Link>

          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {isEn ? "System & Compliance" : "Sistem & Kepatuhan"}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Audit Logs
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            {isEn
              ? "Track record of all administrative and governance actions across the platform."
              : "Rekam jejak setiap aksi administratif di sistem platform."}
          </p>

          {/* Komponen Tabel Interaktif dengan Fitur Hapus & Urungkan */}
          <AuditLogsTable initialLogs={logs} isEn={isEn} />
        </div>
      </Container>
    </main>
  );
}

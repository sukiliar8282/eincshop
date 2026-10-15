import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-user";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
          Admin
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
          Akses admin terverifikasi
        </h1>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/categories"
            className="rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-ink)]"
          >
            Manage categories
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-ink)]"
          >
            Manage orders
          </Link>

          <Link
            href="/admin/products/new"
            className="rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-3 text-sm font-medium text-white!"
          >
            Create product
          </Link>

          <Link
            href="/admin/audit-logs"
            className="rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-ink)]"
          >
            Audit logs
          </Link>
        </div>
      </Container>
    </main>
  );
}

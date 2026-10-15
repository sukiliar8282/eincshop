"use client";

import { Container } from "@/components/ui/container";

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-xl rounded-[var(--radius-card)] border border-[var(--color-danger-soft)] bg-white p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-danger-strong)]">
            Catalog error
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-[var(--color-ink)]">
            Produk belum dapat dimuat.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Silakan coba lagi beberapa saat.
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-6 min-h-11 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white"
          >
            Coba lagi
          </button>
        </div>
      </Container>
    </main>
  );
}

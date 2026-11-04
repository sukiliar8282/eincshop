"use client";

import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function ProductDetailError() {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">
            Product belum dapat dimuat.
          </h1>

          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Silakan kembali ke catalog dan coba lagi.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white"
          >
            Kembali ke products
          </Link>
        </div>
      </Container>
    </main>
  );
}

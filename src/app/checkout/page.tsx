import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/require-user";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { getCartForUser } from "@/modules/cart/service";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await requireUser();
  const cart = await getCartForUser(user.id);

  const items =
    cart?.items.filter(
      (item) =>
        item.product.status === "PUBLISHED" &&
        item.product.productType === "DIGITAL",
    ) ?? [];

  const subtotal = items.reduce(
    (total, item) => total + item.product.priceMinor * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="py-16 sm:py-24">
        <Container>
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
              Checkout
            </h1>

            <p className="mt-4 text-[var(--color-text-muted)]">
              Keranjang Anda kosong atau produk sudah tidak tersedia.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
            >
              Kembali ke katalog
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Order review
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Checkout
          </h1>

          <Link
            href="/cart"
            className="mt-5 inline-flex text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
          >
            ← Kembali ke keranjang
          </Link>

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="divide-y divide-[var(--color-line)]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-[var(--color-ink)]">
                      {item.product.title}
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      Produk digital · Jumlah {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-[var(--color-ink)]">
                    {formatIdr(item.product.priceMinor * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] p-5">
              <span className="text-sm text-[var(--color-text-muted)]">
                Total
              </span>

              <span className="text-lg font-semibold text-[var(--color-ink)]">
                {formatIdr(subtotal)}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-5">
            <p className="text-sm leading-6 text-[var(--color-text-muted)]">
              Pembayaran sedang berada dalam mode pengujian. Setelah pesanan
              dibuat, status pembayaran akan ditampilkan di halaman pesanan
              Anda.
            </p>
          </div>

          <div className="mt-6">
            <CheckoutForm />
          </div>
        </div>
      </Container>
    </main>
  );
}

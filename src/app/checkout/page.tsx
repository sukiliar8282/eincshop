import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUserOrGuest } from "@/lib/auth/require-user";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { getCartForUser } from "@/modules/cart/service";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await getCurrentUserOrGuest();
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
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Pembayaran Instan
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
            Checkout
          </h1>

          <div className="mt-10 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    {item.product.title}
                  </p>
                  <p className="mt-1 text-[var(--color-text-muted)]">
                    Jumlah: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-[var(--color-ink)]">
                  {formatIdr(item.product.priceMinor * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between text-base font-semibold text-[var(--color-ink)]">
            <span>Total Pembayaran</span>
            <span>{formatIdr(subtotal)}</span>
          </div>

          <div className="mt-8">
            <CheckoutForm />
          </div>
        </div>
      </Container>
    </main>
  );
}

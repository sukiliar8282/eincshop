import type { Metadata } from "next";

import { Button, ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { getCartForUser } from "@/modules/cart/service";
import { removeFromCartAction } from "@/modules/cart/actions";
import { getDictionary } from "@/lib/i18n/server";
import { localizeProduct } from "@/lib/i18n/catalog";

export const metadata: Metadata = {
  title: "Keranjang",
};

export default async function CartPage() {
  const [{ dict, locale }, user] = await Promise.all([
    getDictionary(),
    requireUser(),
  ]);

  const cart = await getCartForUser(user.id);

  const rawValidItems =
    cart?.items.filter(
      (item) =>
        item.product.status === "PUBLISHED" &&
        item.product.productType === "DIGITAL",
    ) ?? [];

  const validItems = rawValidItems.map((item) => ({
    ...item,
    product: localizeProduct(item.product, locale),
  }));

  const subtotal = validItems.reduce(
    (sum, item) => sum + item.product.priceMinor * item.quantity,
    0,
  );
  const totalItems = validItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {dict.cart.badge}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {dict.cart.title}
          </h1>

          <ButtonLink
            href="/products"
            variant="ghost"
            size="sm"
            className="mt-5"
          >
            {dict.cart.continueShopping}
          </ButtonLink>
        </div>

        {validItems.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] p-10 text-center">
            <p className="font-medium text-[var(--color-ink)]">
              {dict.cart.emptyTitle}
            </p>

            <ButtonLink
              href="/products"
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              {dict.cart.exploreCatalog}
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="divide-y divide-[var(--color-line)] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
              {validItems.map((item) => {
                const removeAction = removeFromCartAction.bind(
                  null,
                  item.product.id,
                );

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-medium text-[var(--color-ink)]">
                        {item.product.title}
                      </p>

                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {item.product.category.name}
                      </p>

                      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                        {dict.cart.quantity}: {item.quantity}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:block sm:text-right">
                      <p className="font-semibold text-[var(--color-ink)]">
                        {formatIdr(
                          item.product.priceMinor * item.quantity,
                          locale,
                        )}
                      </p>

                      <form action={removeAction} className="mt-3">
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="min-h-8 px-0 text-[var(--color-danger-strong)] hover:bg-transparent hover:underline"
                        >
                          {dict.common.delete}
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5">
              <h2 className="font-semibold text-[var(--color-ink)]">
                {dict.cart.summaryTitle}
              </h2>

              <div className="mt-5 space-y-3 border-t border-[var(--color-line)] pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">
                    {dict.cart.totalItems}
                  </span>

                  <span className="font-medium text-[var(--color-ink)]">
                    {totalItems}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">
                    {dict.cart.subtotal}
                  </span>

                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatIdr(subtotal, locale)}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--color-text-muted)]">
                {dict.cart.deliveryNote}
              </p>

              <ButtonLink href="/checkout" className="mt-5 w-full !text-white">
                {dict.cart.checkoutBtn}
              </ButtonLink>
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}

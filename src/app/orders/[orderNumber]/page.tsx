import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { PayOrderButton } from "@/components/payment/pay-order-button";

type OrderPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export const metadata: Metadata = {
  title: "Order",
};

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await requireUser();
  const { orderNumber } = await params;

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: user.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          downloadGrants: {
            where: {
              status: "ACTIVE",
            },
            include: {
              digitalAsset: {
                select: {
                  fileName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Order
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {order.orderNumber}
          </h1>

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-[var(--color-text-muted)]">
                  Order status
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">
                  {order.status}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-[var(--color-text-muted)]">
                  Payment status
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">
                  {order.paymentStatus}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-[var(--color-line)] pt-6">
              <h2 className="font-semibold text-[var(--color-ink)]">Items</h2>

              <div className="mt-4 divide-y divide-[var(--color-line)]">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">
                          {item.productTitle}
                        </p>

                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="font-medium text-[var(--color-ink)]">
                        {formatIdr(item.lineTotalMinor)}
                      </p>
                    </div>

                    {/* Tombol Download muncul per-item jika order status PAID */}
                    {order.paymentStatus === "PAID" &&
                      item.downloadGrants.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {item.downloadGrants.map((grant) => (
                            <a
                              key={grant.id}
                              href={`/api/downloads/${grant.id}`}
                              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--color-ink)] px-3 text-sm font-medium text-white!"
                            >
                              Download {grant.digitalAsset.fileName}
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Message jika PAID tapi asset belum tersedia */}
            {order.paymentStatus === "PAID" &&
              order.items.every((item) => item.downloadGrants.length === 0) && (
                <div className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-warning-soft)] p-4">
                  <p className="text-sm leading-6 text-[var(--color-warning-strong)]">
                    Pembayaran berhasil, tetapi digital asset belum tersedia
                    untuk product ini.
                  </p>
                </div>
              )}

            <div className="mt-6 flex items-center justify-between border-t border-[var(--color-line)] pt-5">
              <span className="text-sm text-[var(--color-text-muted)]">
                Total
              </span>

              <span className="text-lg font-semibold text-[var(--color-ink)]">
                {formatIdr(order.totalMinor)}
              </span>
            </div>

            {order.paymentStatus !== "PAID" && (
              <div className="mt-6 border-t border-[var(--color-line)] pt-6">
                <PayOrderButton orderNumber={order.orderNumber} />
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-5">
            <p className="text-sm leading-6 text-[var(--color-text-muted)]">
              Order sudah dibuat, tetapi payment provider belum aktif. Download
              digital product belum tersedia sampai pembayaran diverifikasi.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}

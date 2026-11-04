import Link from "next/link";
import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { OrderStatus } from "@/components/order/order-status";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Order History",
};

export default async function OrderHistoryPage() {
  const [user, { locale }] = await Promise.all([
    requireUser(),
    getDictionary(),
  ]);

  const isEn = locale === "en";
  const t = {
    account: isEn ? "Account" : "Akun",
    title: isEn ? "Order history" : "Riwayat pesanan",
    order: isEn ? "Order" : "Pesanan",
    date: isEn ? "Date" : "Tanggal",
    items: isEn ? "Items" : "Item",
    payment: isEn ? "Payment" : "Pembayaran",
    total: isEn ? "Total" : "Total",
    empty: isEn ? "No orders placed yet." : "Belum ada order.",
  };

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalMinor: true,
      createdAt: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {t.account}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {t.title}
          </h1>

          <div className="mobile-scroll mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">{t.order}</th>
                  <th className="px-5 py-4 font-semibold">{t.date}</th>
                  <th className="px-5 py-4 font-semibold">{t.items}</th>
                  <th className="px-5 py-4 font-semibold">{t.payment}</th>
                  <th className="px-5 py-4 font-semibold">{t.total}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-line)]">
                {orders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="font-medium text-[var(--color-accent-strong)] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      {order.createdAt.toLocaleDateString(
                        isEn ? "en-US" : "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>

                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      {order._count.items}
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatus status={order.paymentStatus} />
                    </td>

                    <td className="px-5 py-4 font-medium text-[var(--color-ink)]">
                      {formatIdr(order.totalMinor, locale)}
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-[var(--color-text-muted)]"
                    >
                      {t.empty}
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

import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { OrderStatus } from "@/components/order/order-status";

export const metadata: Metadata = {
  title: "Manage Orders",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalMinor: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
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
        <div className="max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Admin operations
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Orders
          </h1>

          <div className="mobile-scroll mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Order</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Order status</th>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
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

                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-ink)]">
                        {order.user.name ?? "Unnamed user"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {order.user.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatus status={order.status} />
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatus status={order.paymentStatus} />
                    </td>

                    <td className="px-5 py-4 font-medium text-[var(--color-ink)]">
                      {formatIdr(order.totalMinor)}
                    </td>

                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      {order.createdAt.toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[var(--color-text-muted)]"
                    >
                      Belum ada order.
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

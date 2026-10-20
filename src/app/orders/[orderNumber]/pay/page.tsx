import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { MidtransSnapPayment } from "@/components/payment/midtrans-snap-payment";
import { DummyPaymentSimulator } from "@/components/payment/dummy-payment-simulator";
import { getDictionary } from "@/lib/i18n/server";

type PaymentPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export const metadata: Metadata = {
  title: "Payment",
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const [user, { locale }] = await Promise.all([
    requireUser(),
    getDictionary(),
  ]);
  const { orderNumber } = await params;
  const isEn = locale === "en";

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: user.id,
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    notFound();
  }

  const payment = order.payments[0];

  if (!payment?.providerPaymentId) {
    notFound();
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Midtrans Snap
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {isEn ? "Complete your payment" : "Selesaikan pembayaran Anda"}
          </h1>

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6">
            <p className="text-sm leading-6 text-[var(--color-text-muted)]">
              {isEn
                ? "Once payment is completed, the order status will be automatically verified via the Midtrans webhook."
                : "Setelah pembayaran selesai, status order tetap akan diverifikasi melalui webhook Midtrans."}
            </p>

            <div className="mt-6">
              {process.env.PAYMENT_PROVIDER === "dummy" ? (
                <DummyPaymentSimulator orderNumber={order.orderNumber} />
              ) : (
                <MidtransSnapPayment
                  token={payment.providerPaymentId}
                  isProduction={isProduction}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

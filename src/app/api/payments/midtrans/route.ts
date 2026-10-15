import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type MidtransNotification = {
  order_id?: string;
  transaction_id?: string;
  transaction_status?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  fraud_status?: string;
  payment_type?: string;
  currency?: string;
};

function verifySignature(notification: MidtransNotification): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (
    !serverKey ||
    !notification.order_id ||
    !notification.status_code ||
    !notification.gross_amount ||
    !notification.signature_key
  ) {
    return false;
  }

  const expectedSignature = createHash("sha512")
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`,
    )
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(notification.signature_key);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function getPaymentStatus(notification: MidtransNotification) {
  const transactionStatus = notification.transaction_status?.toLowerCase();

  const fraudStatus = notification.fraud_status?.toLowerCase();

  const isSuccessful =
    (transactionStatus === "settlement" || transactionStatus === "capture") &&
    (!fraudStatus || fraudStatus === "accept");

  if (isSuccessful) {
    return {
      paymentStatus: "PAID" as const,
      orderStatus: "PAID" as const,
    };
  }

  if (transactionStatus === "expire") {
    return {
      paymentStatus: "EXPIRED" as const,
      orderStatus: "CANCELLED" as const,
    };
  }

  if (transactionStatus === "deny" || transactionStatus === "cancel") {
    return {
      paymentStatus: "FAILED" as const,
      orderStatus: "CANCELLED" as const,
    };
  }

  return {
    paymentStatus: "PENDING" as const,
    orderStatus: "PENDING_PAYMENT" as const,
  };
}

export async function POST(request: Request) {
  let notification: MidtransNotification;

  try {
    notification = (await request.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!verifySignature(notification)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (!notification.order_id || !notification.transaction_id) {
    return NextResponse.json(
      { error: "Invalid notification." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: {
      orderNumber: notification.order_id,
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
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const grossAmount = Number(notification.gross_amount);

  if (
    !Number.isFinite(grossAmount) ||
    grossAmount !== order.totalMinor ||
    notification.currency !== "IDR"
  ) {
    return NextResponse.json(
      { error: "Amount or currency mismatch." },
      { status: 400 },
    );
  }

  const payment = order.payments[0];

  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  const eventId = [
    notification.transaction_id,
    notification.transaction_status ?? "unknown",
    notification.status_code ?? "unknown",
  ].join(":");

  const payloadHash = createHash("sha256")
    .update(JSON.stringify(notification))
    .digest("hex");

  const nextStatus = getPaymentStatus(notification);

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.paymentEvent.create({
        data: {
          paymentId: payment.id,
          provider: "MIDTRANS",
          providerEventId: eventId,
          eventType: notification.transaction_status ?? "unknown",
          payloadHash,
          processedAt: new Date(),
        },
      });

      await transaction.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          provider: "MIDTRANS",
          providerPaymentId: notification.transaction_id,
          status: nextStatus.paymentStatus,
        },
      });

      await transaction.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: nextStatus.paymentStatus,
          status: nextStatus.orderStatus,
        },
      });
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    console.error("Midtrans webhook processing failed:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    received: true,
  });
}

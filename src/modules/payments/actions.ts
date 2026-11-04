"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { createSnapTransaction } from "@/modules/payments/midtrans";
import { createDownloadGrantsForPaidOrder } from "@/modules/digital-delivery/service";

export type PaymentActionState = {
  error?: string;
};

type DummyPaymentResult = "success" | "pending" | "failed";

function isDummyProvider(): boolean {
  return process.env.PAYMENT_PROVIDER === "dummy";
}

export async function createMidtransPaymentAction(
  orderNumber: string,
  _previousState: PaymentActionState,
  _formData: FormData,
): Promise<PaymentActionState> {
  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: user.id,
    },
    include: {
      items: true,
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    return {
      error: "Order tidak ditemukan.",
    };
  }

  if (order.paymentStatus === "PAID") {
    return {
      error: "Order ini sudah dibayar.",
    };
  }

  // F-13 Guard: Tolak pembuatan pembayaran pada pesanan yang sudah dibatalkan atau dikembalikan
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return {
      error:
        "Pesanan ini sudah dibatalkan atau dikembalikan dan tidak dapat dibayar.",
    };
  }

  const payment = order.payments[0];

  if (!payment) {
    return {
      error: "Payment record tidak ditemukan.",
    };
  }

  if (isDummyProvider()) {
    if (process.env.NODE_ENV === "production") {
      return {
        error: "Dummy payment tidak boleh digunakan di production.",
      };
    }

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        provider: "DUMMY",
        providerPaymentId: `dummy-${order.orderNumber}`,
        status: "PENDING",
      },
    });

    redirect(`/orders/${order.orderNumber}/pay`);
  }

  if (payment.providerPaymentId) {
    redirect(`/orders/${order.orderNumber}/pay`);
  }

  try {
    const snapTransaction = await createSnapTransaction({
      orderId: order.orderNumber,
      grossAmount: order.totalMinor,
      items: order.items.map((item) => ({
        id: item.productId,
        price: item.unitPriceMinor,
        quantity: item.quantity,
        name: item.productTitle,
      })),
      customer: {
        firstName: user.name,
        email: user.email,
      },
    });

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        provider: "MIDTRANS",
        providerPaymentId: snapTransaction.token,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("Payment creation failed:", error);

    return {
      error: "Payment session gagal dibuat.",
    };
  }

  redirect(`/orders/${order.orderNumber}/pay`);
}

export async function simulateDummyPaymentAction(
  orderNumber: string,
  result: DummyPaymentResult,
  _formData: FormData,
): Promise<void> {
  if (!isDummyProvider() || process.env.NODE_ENV === "production") {
    throw new Error("Dummy payment hanya tersedia di development.");
  }

  const user = await requireUser();

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
    throw new Error("Order tidak ditemukan.");
  }

  // F-13 Guard: Tolak simulasi pada order yang sudah berstatus batal atau refund
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    throw new Error("Pesanan ini sudah dibatalkan atau dikembalikan.");
  }

  const payment = order.payments[0];

  if (!payment) {
    throw new Error("Payment record tidak ditemukan.");
  }

  if (result === "success") {
    await prisma.$transaction(async (transaction) => {
      await transaction.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          provider: "DUMMY",
          status: "PAID",
        },
      });

      await transaction.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
        },
      });

      await transaction.cart.updateMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        data: {
          status: "CONVERTED",
        },
      });
    });

    await createDownloadGrantsForPaidOrder(order.id);
  }

  if (result === "pending") {
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          provider: "DUMMY",
          status: "PENDING",
        },
      }),
      prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "PENDING",
          status: "PENDING_PAYMENT",
        },
      }),
    ]);
  }

  if (result === "failed") {
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          provider: "DUMMY",
          status: "FAILED",
        },
      }),
      prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      }),
    ]);
  }

  redirect(`/orders/${order.orderNumber}`);
}

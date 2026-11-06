"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUserOrGuest } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { sanitizeLocale } from "@/lib/i18n/config";

export type OrderActionState = {
  error?: string;
};

function createOrderNumber(): string {
  return `EINC-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function createOrderAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const formLocale = formData?.get?.("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  // Bekerja untuk pembeli tamu maupun pengguna terdaftar
  const user = await getCurrentUserOrGuest();

  const cart = await prisma.cart.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    include: {
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return {
      error: isEn
        ? "Your cart is currently empty."
        : "Keranjang masih kosong.",
    };
  }

  const productIds = cart.items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      productType: "DIGITAL",
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      productType: true,
      priceMinor: true,
    },
  });

  // 1. Ambil produk yang valid & PUBLISHED di DB
  const validProductsMap = new Map(products.map((p) => [p.id, p]));
  const validCartItems = cart.items.filter((item) =>
    validProductsMap.has(item.productId),
  );

  // 2. Bersihkan otomatis ID usang dari tabel CartItem DB
  const invalidCartItems = cart.items.filter(
    (item) => !validProductsMap.has(item.productId),
  );
  if (invalidCartItems.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: { in: invalidCartItems.map((item) => item.productId) },
      },
    });
  }

  if (validCartItems.length === 0) {
    return {
      error: isEn
        ? "Selected products are no longer available."
        : "Ada produk yang sudah tidak tersedia.",
    };
  }

  const subtotalMinor = validCartItems.reduce((total, item) => {
    const product = validProductsMap.get(item.productId);

    if (!product) {
      return total;
    }

    return total + product.priceMinor * item.quantity;
  }, 0);

  if (subtotalMinor <= 0) {
    return {
      error: isEn ? "Invalid order total." : "Total order tidak valid.",
    };
  }

  const orderNumber = createOrderNumber();

  let order;

  try {
    order = await prisma.$transaction(async (transaction) => {
      // 1. Buat pesanan baru beserta detail item dan catatan pembayaran
      const createdOrder = await transaction.order.create({
        data: {
          userId: user.id,
          orderNumber,
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          currency: "IDR",
          subtotalMinor,
          discountMinor: 0,
          totalMinor: subtotalMinor,

          items: {
            create: validCartItems.map((item) => {
              const product = validProductsMap.get(item.productId);

              if (!product) {
                throw new Error("Product cart tidak valid.");
              }

              return {
                productId: product.id,
                productTitle: product.title,
                productType: product.productType,
                unitPriceMinor: product.priceMinor,
                quantity: item.quantity,
                lineTotalMinor: product.priceMinor * item.quantity,
                metadataSnapshot: {},
              };
            }),
          },

          payments: {
            create: {
              provider: "MIDTRANS",
              status: "PENDING",
              amountMinor: subtotalMinor,
              currency: "IDR",
            },
          },
        },
      });

      // 2. Kunci dan ubah status cart menjadi CONVERTED secara atomik
      await transaction.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          status: "CONVERTED",
        },
      });

      return createdOrder;
    });
  } catch (error) {
    console.error("Order creation failed:", error);

    return {
      error: isEn
        ? "Failed to process order. Please try again."
        : "Order belum dapat dibuat. Silakan coba lagi.",
    };
  }

  // Revalidasi halaman cart, akun, dan layout root (badge header)
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  revalidatePath("/account");

  redirect(`/orders/${order.orderNumber}`);
}
import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";

function createOrderNumber(): string {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  return `EINC-${Date.now()}-${suffix}`;
}

export async function createOrderFromActiveCart(userId: string) {
  return prisma.$transaction(async (transaction) => {
   const cart = await transaction.cart.findFirst({
     where: {
       userId: userId, // <-- Langsung sebut field-nya, TANPA userId_status!
       status: "ACTIVE",
     },
     include: {
       items: {
         include: {
           product: true,
         },
       },
     },
   });

    if (!cart || cart.items.length === 0) {
      throw new Error("CART_EMPTY");
    }

    const productIds = cart.items.map((item) => item.productId);

    const products = await transaction.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        productType: "DIGITAL",
        status: "PUBLISHED",
      },
    });

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    const validItems = cart.items
      .map((cartItem) => {
        const product = productsById.get(cartItem.productId);

        if (!product) {
          return null;
        }

        return {
          product,
          quantity: 1,
          lineTotalMinor: product.priceMinor,
        };
      })
      .filter(
        (
          item,
        ): item is {
          product: (typeof products)[number];
          quantity: number;
          lineTotalMinor: number;
        } => item !== null,
      );

    if (validItems.length === 0) {
      throw new Error("NO_VALID_PRODUCTS");
    }

    const subtotalMinor = validItems.reduce(
      (total, item) => total + item.lineTotalMinor,
      0,
    );

    const order = await transaction.order.create({
      data: {
        userId,
        orderNumber: createOrderNumber(),
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        currency: "IDR",
        subtotalMinor,
        discountMinor: 0,
        totalMinor: subtotalMinor,
        items: {
          create: validItems.map((item) => ({
            productId: item.product.id,
            productTitle: item.product.title,
            productType: item.product.productType,
            unitPriceMinor: item.product.priceMinor,
            quantity: item.quantity,
            lineTotalMinor: item.lineTotalMinor,
          })),
        },
        payments: {
          create: {
            provider: "UNSELECTED",
            status: "PENDING",
            amountMinor: subtotalMinor,
            currency: "IDR",
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    return order;
  });
}

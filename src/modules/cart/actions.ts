"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getOrCreateActiveCart } from "@/modules/cart/service";

export type CartActionState = {
  error?: string;
  success?: string;
};

export async function addToCartAction(
  productId: string,
  _previousState: CartActionState,
  _formData: FormData,
): Promise<CartActionState> {
  void _previousState;
  void _formData;

  const user = await requireUser();

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      productType: "DIGITAL",
      status: "PUBLISHED",
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    return {
      error: "Product tidak tersedia.",
    };
  }

  const cart = await getOrCreateActiveCart(user.id);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: product.id,
      },
    },
    create: {
      cartId: cart.id,
      productId: product.id,
      quantity: 1,
    },
    update: {
      quantity: 1,
    },
  });

  // Revalidate halaman cart dan root layout agar badge header langsung bertambah
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  revalidatePath(`/products/${productId}`);

  return {
    success: "Product ditambahkan ke Keranjang",
  };
}

export async function removeFromCartAction(
  productId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireUser();

  const cart = await prisma.cart.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  // Revalidate halaman cart dan root layout agar badge header langsung hilang/berkurang
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
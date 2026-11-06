"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserOrGuest } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getOrCreateActiveCart } from "@/modules/cart/service";
import { getLocale } from "@/lib/i18n/server";
import { sanitizeLocale } from "@/lib/i18n/config";

export type CartActionState = {
  error?: string;
  success?: string;
};

export async function addToCartAction(
  productId: string,
  _previousState: CartActionState,
  formData?: FormData,
): Promise<CartActionState> {
  const formLocale = formData?.get?.("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  // Bekerja untuk pengguna login maupun tamu tanpa dipaksa login
  const user = await getCurrentUserOrGuest();

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
      error: isEn ? "Product is unavailable." : "Produk tidak tersedia.",
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

  // Revalidate halaman cart dan root layout agar badge counter header bertambah
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  revalidatePath(`/products/${productId}`);

  return {
    success: isEn
      ? "Product added to cart successfully."
      : "Produk berhasil ditambahkan ke keranjang.",
  };
}

export async function buyNowAction(
  productId: string,
  _previousState: CartActionState,
  formData?: FormData,
): Promise<CartActionState> {
  const formLocale = formData?.get?.("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  // Bekerja untuk pengguna login maupun tamu tanpa dipaksa login
  const user = await getCurrentUserOrGuest();

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
      error: isEn ? "Product is unavailable." : "Produk tidak tersedia.",
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

  revalidatePath("/cart");
  revalidatePath("/checkout");

  // Langsung arahkan pembeli ke halaman checkout
  redirect("/checkout");
}

export async function removeFromCartAction(
  productId: string,
  _formData: FormData,
): Promise<void> {
  const user = await getCurrentUserOrGuest();

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

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
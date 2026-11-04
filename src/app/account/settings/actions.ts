"use server";

import { signOut } from "@/lib/auth";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";

export type DeleteAccountState = {
  error?: string;
};

export async function deleteAccountAction(
  _previousState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const sessionUser = await requireUser();
  const confirmationText = formData.get("confirmation");

  if (
    typeof confirmationText !== "string" ||
    confirmationText.trim() !== "HAPUS AKUN"
  ) {
    return {
      error: "Konfirmasi tidak sesuai. Harap ketik persis 'HAPUS AKUN'.",
    };
  }

  const userId = sessionUser.id;

  try {
    // Eksekusi pembersihan kaskade atomik dalam transaksi Prisma
    await prisma.$transaction(async (tx) => {
      // 1. Hapus Download Grants milik pengguna
      await tx.downloadGrant.deleteMany({
        where: { userId },
      });

      // 2. Ambil seluruh pesanan untuk menghapus relasi pembayaran dan item
      const userOrders = await tx.order.findMany({
        where: { userId },
        select: { id: true },
      });
      const orderIds = userOrders.map((o) => o.id);

      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.payment.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.order.deleteMany({
          where: { userId },
        });
      }

      // 3. Hapus Keranjang Belanja dan Item Keranjang
      const userCarts = await tx.cart.findMany({
        where: { userId },
        select: { id: true },
      });
      const cartIds = userCarts.map((c) => c.id);

      if (cartIds.length > 0) {
        await tx.cartItem.deleteMany({
          where: { cartId: { in: cartIds } },
        });
        await tx.cart.deleteMany({
          where: { userId },
        });
      }

      // 4. Jika pengguna adalah penjual, bersihkan produk dan aset digital
      const sellerProducts = await tx.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });
      const productIds = sellerProducts.map((p) => p.id);

      if (productIds.length > 0) {
        await tx.digitalAsset.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.productImage.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.product.deleteMany({
          where: { sellerId: userId },
        });
      }

      // 5. Hapus Log Audit yang terikat dengan pengguna ini (onDelete: Restrict)
      await tx.auditLog.deleteMany({
        where: { actorUserId: userId },
      });
      await tx.auditLog.deleteMany({
        where: { entityType: "User", entityId: userId },
      });

      // 6. Hapus Token Verifikasi OTP
      if (sessionUser.email) {
        await tx.verificationToken.deleteMany({
          where: { identifier: sessionUser.email.toLowerCase() },
        });
      }

      // 7. Hapus Akun OAuth dan Sesi Login
      await tx.account.deleteMany({
        where: { userId },
      });
      await tx.session.deleteMany({
        where: { userId },
      });

      // 8. Hapus Pengguna secara Permanen dari database
      await tx.user.delete({
        where: { id: userId },
      });
    });
  } catch (error) {
    console.error("[DeleteAccount Error]:", error);
    return {
      error: "Gagal menghapus akun karena kendala sistem. Silakan coba lagi.",
    };
  }

  // Logout otomatis dan alihkan ke halaman login dengan parameter deleted=true
  await signOut({ redirectTo: "/login?deleted=true" });
  return {};
}

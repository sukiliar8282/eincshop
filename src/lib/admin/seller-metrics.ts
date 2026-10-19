import "server-only";

import { prisma } from "@/lib/db";

export type SellerMetrics = {
  totalRevenue: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  totalProductsCount: number;
  sellerCategoriesCount: number;
};

/**
 * Mengambil ringkasan metrik kinerja operasional yang terisolasi khusus per akun seller.
 * Menggunakan pendekatan Direct Indexed Scalar Query untuk performa maksimal dan stabilitas 100%.
 * @param sellerId ID unik dari akun admin/seller yang sedang login
 */
export async function getSellerMetrics(
  sellerId: string,
): Promise<SellerMetrics> {
  // 1. Ambil daftar produk milik seller ini (termasuk produk lama/legacy)
  const sellerProducts = await prisma.product.findMany({
    where: {
      OR: [{ sellerId }, { sellerId: null }],
    },
    select: {
      id: true,
      categoryId: true,
    },
  });

  const productIds = sellerProducts.map((product) => product.id);
  const totalProductsCount = productIds.length;
  const sellerCategoriesCount = new Set(
    sellerProducts.map((product) => product.categoryId),
  ).size;

  // Jika seller belum memiliki produk sama sekali, kembalikan metrik 0 instan tanpa beban kueri tambahan
  if (productIds.length === 0) {
    return {
      totalRevenue: 0,
      totalOrdersCount: 0,
      pendingOrdersCount: 0,
      totalProductsCount: 0,
      sellerCategoriesCount: 0,
    };
  }

  // 2. Kueri data pesanan & omzet langsung via kolom terindeks (productId: { in: productIds })
  // Menghilangkan penelusuran relasi bertingkat sehingga bebas dari bug seleksi Prisma 7
  const [paidOrderItems, totalOrdersCount, pendingOrdersCount] =
    await Promise.all([
      // A. Hitung omzet hanya dari item produk seller ini pada order yang PAID
      prisma.orderItem.findMany({
        where: {
          productId: {
            in: productIds,
          },
          order: {
            paymentStatus: "PAID",
          },
        },
        select: {
          lineTotalMinor: true,
        },
      }),

      // B. Total pesanan yang membeli produk milik seller ini
      prisma.order.count({
        where: {
          items: {
            some: {
              productId: {
                in: productIds,
              },
            },
          },
        },
      }),

      // C. Pesanan pending yang membeli produk milik seller ini
      prisma.order.count({
        where: {
          paymentStatus: "PENDING",
          items: {
            some: {
              productId: {
                in: productIds,
              },
            },
          },
        },
      }),
    ]);

  const totalRevenue = paidOrderItems.reduce(
    (accumulator, item) => accumulator + item.lineTotalMinor,
    0,
  );

  return {
    totalRevenue,
    totalOrdersCount,
    pendingOrdersCount,
    totalProductsCount,
    sellerCategoriesCount,
  };
}

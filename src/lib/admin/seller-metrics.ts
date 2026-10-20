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
 * Mengambil ringkasan metrik kinerja operasional yang terisolasi ketat per akun seller.
 * STRICT MULTI-TENANT: SELLER hanya melihat produk miliknya sendiri.
 * @param sellerId ID unik dari akun admin/seller yang sedang login
 * @param userRole Role akun (SELLER atau ADMIN)
 */
export async function getSellerMetrics(
  sellerId: string,
  userRole?: string,
): Promise<SellerMetrics> {
  // Hanya Super Admin yang diizinkan melihat produk bawaan sistem (sellerId: null).
  // Seller biasa HANYA boleh melihat produk yang benar-benar miliknya sendiri.
  const whereClause =
    userRole === "ADMIN"
      ? { OR: [{ sellerId }, { sellerId: null }] }
      : { sellerId };

  // 1. Ambil daftar produk milik seller ini
  const sellerProducts = await prisma.product.findMany({
    where: whereClause,
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

  // Jika seller baru belum memiliki produk sama sekali, kembalikan 0 murni tanpa kebocoran data
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

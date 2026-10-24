import { prisma } from "@/lib/db";

export async function createDownloadGrantsForPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      userId: true,
      paymentStatus: true,
      status: true,
      items: {
        include: {
          product: {
            include: {
              digitalAssets: {
                where: {
                  status: "ACTIVE",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  // F-12 Defense-in-depth Guard: Pastikan pesanan benar-benar PAID sebelum hak unduh diterbitkan
  if (order.paymentStatus !== "PAID") {
    throw new Error(
      "Download grants hanya dapat diterbitkan untuk pesanan yang sudah berstatus PAID.",
    );
  }

  const grants = [];

  for (const item of order.items) {
    for (const asset of item.product.digitalAssets) {
      const grant = await prisma.downloadGrant.upsert({
        where: {
          orderItemId_digitalAssetId: {
            orderItemId: item.id,
            digitalAssetId: asset.id,
          },
        },
        create: {
          userId: order.userId,
          orderId,
          orderItemId: item.id,
          digitalAssetId: asset.id,
          status: "ACTIVE",
        },
        update: {
          status: "ACTIVE",
        },
      });

      grants.push(grant);
    }
  }

  return grants;
}

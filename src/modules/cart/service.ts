import { prisma } from "@/lib/db";

export async function getOrCreateActiveCart(userId: string) {
  // Pake findFirst + create (karena gak ada @@unique([userId, status]))
  const existingCart = await prisma.cart.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
      status: "ACTIVE",
    },
  });
}

export async function getCartForUser(userId: string) {
  // Ubah findUnique jadi findFirst
  return prisma.cart.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              priceMinor: true,
              currency: true,
              status: true,
              productType: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

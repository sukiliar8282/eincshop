import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";

// Nonaktifkan pra-render statis saat build Vercel agar tidak gagal jika database belum terhubung
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache selama 1 jam di sisi edge/CDN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        productType: "DIGITAL",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteConfig.url}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.warn(
      "[sitemap] Gagal mengambil daftar produk dinamis, menggunakan fallback rute statis:",
      error,
    );
    return staticRoutes;
  }
}

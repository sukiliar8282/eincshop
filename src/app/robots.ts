import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/products", "/products/"],
      disallow: [
        "/admin/",
        "/account/",
        "/cart/",
        "/checkout/",
        "/orders/",
        "/api/",
        "/login",
        "/register",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

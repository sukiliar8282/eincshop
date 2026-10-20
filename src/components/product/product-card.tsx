import Image from "next/image";
import Link from "next/link";

import { formatIdr } from "@/lib/format/currency";
import type { Locale } from "@/lib/i18n/config";

type ProductCardProps = {
  product: {
    title?: string;
    slug: string;
    description: string;
    priceMinor: number;
    category: {
      name: string;
    };
    image: {
      url: string;
      altText: string;
    } | null;
  };
  locale?: Locale | string;
};

export function ProductCard({ product, locale = "id" }: ProductCardProps) {
  const isEn = locale === "en" || locale === "en-US";
  const defaultTitle = isEn ? "Digital product" : "Produk digital";
  const title = product.title || defaultTitle;

  const labels = {
    viewDetailAria: isEn
      ? `View details for ${title}`
      : `Lihat detail ${title}`,
    preview: isEn ? "Product preview" : "Preview produk",
    typeBadge: isEn ? "Digital product" : "Produk digital",
    price: isEn ? "Price" : "Harga",
    viewDetail: isEn ? "View details →" : "Lihat detail →",
  };

  return (
    <article className="motion-enter surface-interactive group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
      <Link
        href={`/products/${product.slug}`}
        aria-label={labels.viewDetailAria}
        className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]"
      >
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.altText || title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-end p-5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              {labels.preview}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-accent-strong)]">
            {product.category.name}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {labels.typeBadge}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-semibold leading-tight tracking-[-0.025em] text-[var(--color-ink)]">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors group-hover:text-[var(--color-accent-strong)]"
          >
            {title}
          </Link>
        </h2>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--color-line)] pt-5">
          <div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {labels.price}
            </p>

            <p className="mt-1 font-semibold text-[var(--color-ink)]">
              {formatIdr(product.priceMinor, locale)}
            </p>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium text-[var(--color-accent-strong)] transition-colors hover:text-[var(--color-ink)]"
          >
            {labels.viewDetail}
          </Link>
        </div>
      </div>
    </article>
  );
}

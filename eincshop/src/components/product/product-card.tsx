import Image from "next/image";
import Link from "next/link";

import { formatIdr } from "@/lib/format/currency";
import type { Locale } from "@/lib/i18n/config";
import { getProductTechStack } from "@/lib/catalog/tech-stack";

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

  const techStack = getProductTechStack(
    product.slug,
    product.description,
    product.title,
  );

  const labels = {
    viewDetailAria: isEn
      ? `View details for ${title}`
      : `Lihat detail ${title}`,
    preview: isEn ? "Product preview" : "Preview produk",
    typeBadge: isEn ? "Digital Asset" : "Aset Digital",
    price: isEn ? "Price" : "Harga",
    viewDetail: isEn ? "View details →" : "Lihat detail →",
  };

  return (
    <article className="motion-enter surface-interactive group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
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

        <h2 className="mt-3.5 text-lg font-bold leading-tight tracking-[-0.02em] text-[var(--color-ink)]">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors group-hover:text-[var(--color-accent-strong)]"
          >
            {title}
          </Link>
        </h2>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {product.description}
        </p>

        {/* Tech Stack Badges Monokrom Presisi */}
        {techStack.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[10px] font-medium text-neutral-700 transition-colors group-hover:border-neutral-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--color-line)] pt-4 mt-4">
          <div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {labels.price}
            </p>

            <p className="mt-0.5 font-bold text-sm text-[var(--color-ink)]">
              {formatIdr(product.priceMinor, locale)}
            </p>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-semibold text-[var(--color-accent-strong)] transition-colors hover:text-[var(--color-ink)]"
          >
            {labels.viewDetail}
          </Link>
        </div>
      </div>
    </article>
  );
}

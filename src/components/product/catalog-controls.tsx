import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";
import { POPULAR_TECH_FILTERS } from "@/lib/catalog/tech-stack";

type CatalogControlsProps = {
  categories: {
    name: string;
    slug: string;
  }[];
  currentQuery: string;
  currentCategory: string;
  currentSort: "newest" | "oldest" | "price_asc" | "price_desc";
  dict: Dictionary["catalog"];
  locale: string;
  totalProducts: number;
};

export function CatalogControls({
  categories,
  currentQuery,
  currentCategory,
  currentSort,
  dict,
  locale,
}: CatalogControlsProps) {
  const isEn = locale === "en";
  const hasActiveFilters = Boolean(
    currentQuery ||
    currentCategory ||
    (currentSort && currentSort !== "newest"),
  );

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  return (
    <div className="mt-8 space-y-3.5">
      {/* 1-Click Quick Tech Stack Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-[var(--color-ink)] mr-1">
          {isEn ? "Frameworks:" : "Teknologi:"}
        </span>

        <Link
          href={`/products?${new URLSearchParams({
            ...(currentCategory ? { category: currentCategory } : {}),
            ...(currentSort !== "newest" ? { sort: currentSort } : {}),
          }).toString()}`}
          className={`rounded-full border px-3.5 py-1 text-xs transition-all ${
            !currentQuery
              ? "border-[var(--color-ink)] bg-[var(--color-ink)] !text-white text-white! font-semibold shadow-xs"
              : "border-[var(--color-line-strong)] bg-white text-neutral-700 hover:border-neutral-900 hover:text-[var(--color-ink)]"
          }`}
        >
          {isEn ? "All Stacks" : "Semua"}
        </Link>

        {POPULAR_TECH_FILTERS.map((tech) => {
          const isSelected = currentQuery.toLowerCase() === tech.toLowerCase();

          return (
            <Link
              key={tech}
              href={`/products?${new URLSearchParams({
                q: isSelected ? "" : tech,
                ...(currentCategory ? { category: currentCategory } : {}),
                ...(currentSort !== "newest" ? { sort: currentSort } : {}),
              }).toString()}`}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-all ${
                isSelected
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] !text-white text-white! font-semibold shadow-xs"
                  : "border-[var(--color-line-strong)] bg-white text-neutral-700 hover:border-neutral-900 hover:text-[var(--color-ink)]"
              }`}
            >
              {tech}
            </Link>
          );
        })}
      </div>

      {/* Search & Filter Form Bar */}
      <form
        method="get"
        className="grid min-w-0 gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]"
      >
        <label className="sr-only" htmlFor="q">
          {dict.searchPlaceholder}
        </label>

        <div className="relative flex items-center">
          <svg
            className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={currentQuery}
            placeholder={dict.searchPlaceholder}
            className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] pl-10 pr-3 text-sm outline-none transition-colors focus:border-[var(--color-ink)]"
          />
        </div>

        <label className="sr-only" htmlFor="category">
          {dict.allCategories}
        </label>

        <select
          id="category"
          name="category"
          defaultValue={currentCategory}
          className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none transition-colors focus:border-[var(--color-ink)] cursor-pointer"
        >
          <option value="">{dict.allCategories}</option>

          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="sort">
          {dict.sortLabel}
        </label>

        <select
          id="sort"
          name="sort"
          defaultValue={currentSort}
          className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none transition-colors focus:border-[var(--color-ink)] cursor-pointer"
        >
          <option value="newest">{dict.sortNewest}</option>
          <option value="oldest">{dict.sortOldest}</option>
          <option value="price_asc">{dict.sortPriceAsc}</option>
          <option value="price_desc">{dict.sortPriceDesc}</option>
        </select>

        <button
          type="submit"
          className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-98 shadow-xs"
        >
          {dict.searchBtn}
        </button>
      </form>

      {/* Baris Filter Aktif (Chips) & Tombol 1-Klik Reset Filter */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)]/60 px-4 py-2.5 text-xs text-[var(--color-text-muted)] animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--color-ink)]">
              {isEn ? "Active Filters:" : "Filter Aktif:"}
            </span>

            {/* Chip Keyword */}
            {currentQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-2.5 py-1 text-xs text-[var(--color-ink)] font-mono">
                <span>&ldquo;{currentQuery}&rdquo;</span>
                <Link
                  href={`/products?${new URLSearchParams({
                    ...(currentCategory ? { category: currentCategory } : {}),
                    ...(currentSort !== "newest" ? { sort: currentSort } : {}),
                  }).toString()}`}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  title={isEn ? "Remove keyword" : "Hapus kata kunci"}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Link>
              </span>
            )}

            {/* Chip Kategori */}
            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-2.5 py-1 text-xs text-[var(--color-ink)]">
                <span>{activeCategoryObj?.name || currentCategory}</span>
                <Link
                  href={`/products?${new URLSearchParams({
                    ...(currentQuery ? { q: currentQuery } : {}),
                    ...(currentSort !== "newest" ? { sort: currentSort } : {}),
                  }).toString()}`}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  title={isEn ? "Remove category" : "Hapus kategori"}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Link>
              </span>
            )}

            {/* Chip Urutan Sort */}
            {currentSort && currentSort !== "newest" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-2.5 py-1 text-xs text-[var(--color-ink)]">
                <span>
                  {currentSort === "oldest"
                    ? dict.sortOldest
                    : currentSort === "price_asc"
                      ? dict.sortPriceAsc
                      : dict.sortPriceDesc}
                </span>
                <Link
                  href={`/products?${new URLSearchParams({
                    ...(currentQuery ? { q: currentQuery } : {}),
                    ...(currentCategory ? { category: currentCategory } : {}),
                  }).toString()}`}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  title={isEn ? "Reset sort" : "Reset urutan"}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Link>
              </span>
            )}
          </div>

          {/* Tombol 1-Klik Reset Semua Filter */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent-strong)] hover:underline"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isEn ? "Reset all filters" : "Reset semua filter"}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

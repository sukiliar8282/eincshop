import type { Dictionary } from "@/lib/i18n/dictionaries/id";

type CatalogControlsProps = {
  categories: {
    name: string;
    slug: string;
  }[];
  currentQuery: string;
  currentCategory: string;
  currentSort: "newest" | "oldest" | "price_asc" | "price_desc";
  dict: Dictionary["catalog"];
};

export function CatalogControls({
  categories,
  currentQuery,
  currentCategory,
  currentSort,
  dict,
}: CatalogControlsProps) {
  return (
    <form
      method="get"
      className="mt-8 grid min-w-0 gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]"
    >
      <label className="sr-only" htmlFor="q">
        {dict.searchPlaceholder}
      </label>

      <input
        id="q"
        name="q"
        type="search"
        defaultValue={currentQuery}
        placeholder={dict.searchPlaceholder}
        className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm outline-none focus:border-[var(--color-ink)]"
      />

      <label className="sr-only" htmlFor="category">
        {dict.allCategories}
      </label>

      <select
        id="category"
        name="category"
        defaultValue={currentCategory}
        className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)]"
      >
        <option value="">{dict.allCategories}</option>

        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
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
        className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)]"
      >
        <option value="newest">{dict.sortNewest}</option>
        <option value="oldest">{dict.sortOldest}</option>
        <option value="price_asc">{dict.sortPriceAsc}</option>
        <option value="price_desc">{dict.sortPriceDesc}</option>
      </select>

      <button
        type="submit"
        className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {dict.searchBtn}
      </button>
    </form>
  );
}

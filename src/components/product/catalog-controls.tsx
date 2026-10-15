import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Temukan template, UI kit, dan aset digital praktis dari EINCSHOP.",
};

// ==========================================
// 1. Komponen Filter & Pencarian
// ==========================================
type CatalogControlsProps = {
  categories: {
    name: string;
    slug: string;
  }[];
  currentQuery: string;
  currentCategory: string;
  currentSort: "newest" | "oldest" | "price_asc" | "price_desc";
};

export function CatalogControls({
  categories,
  currentQuery,
  currentCategory,
  currentSort,
}: CatalogControlsProps) {
  return (
    <form
      method="get"
      className="mt-8 grid min-w-0 gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]"
    >
      <label className="sr-only" htmlFor="q">
        Cari produk
      </label>

      <input
        id="q"
        name="q"
        type="search"
        defaultValue={currentQuery}
        placeholder="Cari produk..."
        className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm outline-none focus:border-[var(--color-ink)]"
      />

      <label className="sr-only" htmlFor="category">
        Filter kategori
      </label>

      <select
        id="category"
        name="category"
        defaultValue={currentCategory}
        className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)]"
      >
        <option value="">Semua kategori</option>

        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="sort">
        Urutkan produk
      </label>

      <select
        id="sort"
        name="sort"
        defaultValue={currentSort}
        className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)]"
      >
        <option value="newest">Terbaru</option>
        <option value="oldest">Terlama</option>
        <option value="price_asc">Harga terendah</option>
        <option value="price_desc">Harga tertinggi</option>
      </select>

      <button
        type="submit"
        className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Cari
      </button>
    </form>
  );
}

// ==========================================
// 2. Komponen Halaman Utama (Products Page)
// ==========================================
type PageProps = {
  searchParams?:
    | Promise<{
        q?: string;
        category?: string;
        sort?: string;
      }>
    | {
        q?: string;
        category?: string;
        sort?: string;
      };
};

export default async function ProductsPage(props: PageProps) {
  // Support baik untuk Next.js 14 maupun Next.js 15+ (async searchParams)
  const resolvedSearchParams = await props.searchParams;

  const currentQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const currentCategory =
    typeof resolvedSearchParams?.category === "string"
      ? resolvedSearchParams.category
      : "";

  const validSorts: CatalogControlsProps["currentSort"][] = [
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
  ];
  const currentSort = validSorts.includes(
    resolvedSearchParams?.sort as CatalogControlsProps["currentSort"],
  )
    ? (resolvedSearchParams?.sort as CatalogControlsProps["currentSort"])
    : "newest";

  // Data kategori: ganti atau sambungkan dengan fetch database/API lu
  const categories = [
    { name: "Template", slug: "template" },
    { name: "UI Kit", slug: "ui-kit" },
    { name: "Aset Digital", slug: "aset-digital" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Katalog Baru */}
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
          Katalog EINCSHOP
        </p>

        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
          Produk untuk pekerjaan yang lebih terarah
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
          Temukan template, UI kit, dan aset digital praktis yang bisa langsung
          digunakan dalam alur kerja Anda.
        </p>
      </header>

      {/* Kontrol Pencarian & Filter */}
      <CatalogControls
        categories={categories}
        currentQuery={currentQuery}
        currentCategory={currentCategory}
        currentSort={currentSort}
      />

      {/* Bagian List / Grid Produk */}
      <section className="mt-10">
        {/* Render card/grid produk lu di sini */}
      </section>
    </main>
  );
}

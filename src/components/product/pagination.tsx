import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  query: string;
  category: string;
  sort: "newest" | "oldest" | "price_asc" | "price_desc";
};

function buildUrl(
  page: number,
  query: string,
  category: string,
  sort: string,
): string {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category) {
    params.set("category", category);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/products?${queryString}` : "/products";
}

export function Pagination({
  currentPage,
  totalPages,
  query,
  category,
  sort,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-3"
    >
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1, query, category, sort)}
          className="rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 py-2 text-sm font-medium"
        >
          Sebelumnya
        </Link>
      ) : (
        <span className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-text-muted)]">
          Sebelumnya
        </span>
      )}

      <span className="text-sm text-[var(--color-text-muted)]">
        Halaman {currentPage} dari {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1, query, category, sort)}
          className="rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 py-2 text-sm font-medium"
        >
          Berikutnya
        </Link>
      ) : (
        <span className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-text-muted)]">
          Berikutnya
        </span>
      )}
    </nav>
  );
}

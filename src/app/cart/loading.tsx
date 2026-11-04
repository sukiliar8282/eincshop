import { Container } from "@/components/ui/container";

export default function CartLoading() {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        {/* Header Section Skeleton */}
        <div className="max-w-3xl space-y-4">
          <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-200/80" />
          <div className="h-9 w-52 animate-pulse rounded-md bg-neutral-300/80" />
          <div className="h-8 w-36 animate-pulse rounded bg-neutral-200/60" />
        </div>

        {/* 2-Column Cart Layout Skeleton */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Daftar Item Keranjang */}
          <div className="divide-y divide-[var(--color-line)] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="h-5 w-52 animate-pulse rounded bg-neutral-300/80 sm:w-64" />
                  <div className="h-3.5 w-28 animate-pulse rounded bg-neutral-200/70" />
                  <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-200/60" />
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="h-5 w-24 animate-pulse rounded bg-neutral-300/80" />
                  <div className="h-4 w-14 animate-pulse rounded bg-neutral-200/60" />
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan Belanja Sidebar */}
          <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 space-y-4">
            <div className="h-5 w-36 animate-pulse rounded bg-neutral-300/80" />

            <div className="space-y-3 border-t border-[var(--color-line)] pt-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-200/70" />
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-300/80" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-neutral-200/70" />
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-300/80" />
              </div>
            </div>

            <div className="border-t border-[var(--color-line)] pt-4">
              <div className="h-10 w-full animate-pulse rounded-[var(--radius-control)] bg-neutral-300/90" />
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}

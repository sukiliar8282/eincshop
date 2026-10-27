import { Container } from "@/components/ui/container";

export default function OrderLoading() {
  return (
    <main className="py-12 sm:py-20">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header & Status Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200/80" />
              <div className="h-8 w-60 animate-pulse rounded-md bg-neutral-300/80" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-24 animate-pulse rounded-full bg-neutral-200/80" />
              <div className="h-9 w-28 animate-pulse rounded-[var(--radius-control)] bg-neutral-200/80" />
            </div>
          </div>

          {/* Kartu Rincian Pesanan */}
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-soft)]">
            {/* Header Box Info */}
            <div className="border-b border-[var(--color-line)] bg-neutral-50/60 p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-200/70" />
                  <div className="h-4 w-32 animate-pulse rounded bg-neutral-300/80" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-200/70" />
                  <div className="h-4 w-36 animate-pulse rounded bg-neutral-300/80" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-200/70" />
                  <div className="h-4 w-28 animate-pulse rounded bg-neutral-300/80" />
                </div>
              </div>
            </div>

            {/* List Item Pesanan */}
            <div className="divide-y divide-[var(--color-line)] p-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-5 w-56 animate-pulse rounded bg-neutral-300/80" />
                    <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-200/70" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-24 animate-pulse rounded bg-neutral-300/80" />
                    <div className="h-9 w-32 animate-pulse rounded-[var(--radius-control)] bg-neutral-200/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

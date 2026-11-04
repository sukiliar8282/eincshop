import { Container } from "@/components/ui/container";

export default function RootLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] py-12 sm:py-20">
      <Container>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="max-w-2xl space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200/80" />
            <div className="h-9 w-3/4 animate-pulse rounded-md bg-neutral-300/80 sm:w-80" />
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200/70" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="aspect-[16/10] w-full animate-pulse rounded-lg bg-neutral-200/70" />
                <div className="mt-4 space-y-2.5">
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-200/80" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-300/80" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

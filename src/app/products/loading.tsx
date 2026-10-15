import { Container } from "@/components/ui/container";

export default function ProductsLoading() {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="h-10 w-64 animate-pulse rounded bg-[var(--color-surface-muted)]" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white"
            >
              <div className="aspect-[4/3] animate-pulse bg-[var(--color-surface-muted)]" />

              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-muted)]" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--color-surface-muted)]" />
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-surface-muted)]" />
                <div className="h-5 w-28 animate-pulse rounded bg-[var(--color-surface-muted)]" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

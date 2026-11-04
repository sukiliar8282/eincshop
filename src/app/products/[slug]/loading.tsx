import { Container } from "@/components/ui/container";

export default function ProductDetailLoading() {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]" />

          <div className="space-y-5">
            <div className="h-4 w-32 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="h-8 w-32 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="h-32 w-full animate-pulse rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      </Container>
    </main>
  );
}

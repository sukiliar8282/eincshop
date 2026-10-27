import { Container } from "@/components/ui/container";

export default function AccountLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200/80" />
            <span className="text-xs text-neutral-300">/</span>
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-200/80" />
          </div>

          {/* Heading Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded-md bg-neutral-300/80" />
            <div className="h-4 w-72 animate-pulse rounded bg-neutral-200/70" />
          </div>

          {/* Kartu Profil Utama Skeleton */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar Circle */}
                <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200/90 sm:h-20 sm:w-20" />

                <div className="space-y-2.5">
                  <div className="h-5 w-36 animate-pulse rounded bg-neutral-300/80" />
                  <div className="h-3.5 w-48 animate-pulse rounded bg-neutral-200/70" />
                  <div className="h-3 w-32 animate-pulse rounded bg-neutral-200/60" />
                </div>
              </div>

              {/* Action Button Skeleton */}
              <div className="h-10 w-28 animate-pulse rounded-[var(--radius-control)] bg-neutral-200/80" />
            </div>
          </div>

          {/* Grid Kartu Menu Navigasi Skeleton */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200/80" />
                  <div className="h-4 w-12 animate-pulse rounded-full bg-neutral-200/60" />
                </div>
                <div className="h-4 w-28 animate-pulse rounded bg-neutral-200/80" />
                <div className="h-3 w-36 animate-pulse rounded bg-neutral-200/60" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

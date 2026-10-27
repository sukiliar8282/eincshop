import { Container } from "@/components/ui/container";

export default function BecomeSellerLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-10 sm:py-16">
      <Container>
        <div className="mx-auto max-w-xl space-y-6">
          {/* Header Info Onboarding Skeleton */}
          <div className="text-center space-y-3">
            <div className="mx-auto h-8 w-56 animate-pulse rounded-md bg-neutral-300/80 sm:w-64" />
            <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-neutral-200/70" />
          </div>

          {/* Form Card Skeleton */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8 space-y-5">
            {/* Input Nama Toko */}
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200/80" />
              <div className="h-10 w-full animate-pulse rounded-[var(--radius-control)] bg-neutral-100 border border-neutral-200/80" />
            </div>

            {/* Input Deskripsi Toko */}
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-neutral-200/80" />
              <div className="h-24 w-full animate-pulse rounded-[var(--radius-control)] bg-neutral-100 border border-neutral-200/80" />
            </div>

            {/* Tombol Aksi Submit */}
            <div className="pt-2">
              <div className="h-10 w-full animate-pulse rounded-[var(--radius-control)] bg-neutral-300/90" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

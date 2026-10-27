import { Container } from "@/components/ui/container";

export default function CheckoutLoading() {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded-md bg-neutral-300/80" />
            <div className="h-4 w-72 animate-pulse rounded bg-neutral-200/70" />
          </div>

          {/* Checkout Card Skeleton */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8 space-y-6">
            <div className="h-5 w-40 animate-pulse rounded bg-neutral-300/80" />

            {/* List Metode Pembayaran Skeleton */}
            <div className="space-y-3">
              {[1, 2].map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-line)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-neutral-200/80" />
                    <div className="h-4 w-28 animate-pulse rounded bg-neutral-300/80" />
                  </div>
                  <div className="h-6 w-16 animate-pulse rounded bg-neutral-200/60" />
                </div>
              ))}
            </div>

            {/* Total & Tombol Bayar */}
            <div className="border-t border-[var(--color-line)] pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200/70" />
                <div className="h-6 w-32 animate-pulse rounded bg-neutral-300/80" />
              </div>
              <div className="h-11 w-full animate-pulse rounded-[var(--radius-control)] bg-neutral-300/90" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

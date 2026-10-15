"use client";

import { simulateDummyPaymentAction } from "@/modules/payments/actions";

type DummyPaymentSimulatorProps = {
  orderNumber: string;
};

export function DummyPaymentSimulator({
  orderNumber,
}: DummyPaymentSimulatorProps) {
  const successAction = simulateDummyPaymentAction.bind(
    null,
    orderNumber,
    "success",
  );

  const pendingAction = simulateDummyPaymentAction.bind(
    null,
    orderNumber,
    "pending",
  );

  const failedAction = simulateDummyPaymentAction.bind(
    null,
    orderNumber,
    "failed",
  );

  return (
    <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
        Portfolio demo payment
      </p>

      <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        Ini simulasi pembayaran lokal. Tidak ada uang nyata yang diproses.
      </p>

      <div className="mt-5 grid gap-3">
        <form action={successAction}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-success-strong)] px-4 text-sm font-medium text-white"
          >
            Simulate success
          </button>
        </form>

        <form action={pendingAction}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-warning-strong)] px-4 text-sm font-medium text-white"
          >
            Simulate pending
          </button>
        </form>

        <form action={failedAction}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-danger-strong)] px-4 text-sm font-medium text-white"
          >
            Simulate failed
          </button>
        </form>
      </div>
    </div>
  );
}

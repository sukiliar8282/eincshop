"use client";

import { useActionState } from "react";

import {
  createOrderAction,
  type OrderActionState,
} from "@/modules/orders/actions";

const initialState: OrderActionState = {};

export function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(
    createOrderAction,
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error && (
        <p
          role="alert"
          className="mb-4 rounded-[var(--radius-control)] bg-[var(--color-danger-soft)] px-3 py-3 text-sm text-[var(--color-danger-strong)]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Membuat order..." : "Buat order"}
      </button>
    </form>
  );
}

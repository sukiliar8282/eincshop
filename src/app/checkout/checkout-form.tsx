"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
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
        <StatusMessage tone="error" className="mb-4">
          {state.error}
        </StatusMessage>
      )}

      <LoadingButton type="submit" loading={isPending} className="w-full">
        Buat order
      </LoadingButton>
    </form>
  );
}

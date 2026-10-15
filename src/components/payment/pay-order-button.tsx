"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  createMidtransPaymentAction,
  type PaymentActionState,
} from "@/modules/payments/actions";

type PayOrderButtonProps = {
  orderNumber: string;
};

const initialState: PaymentActionState = {};

export function PayOrderButton({ orderNumber }: PayOrderButtonProps) {
  const action = createMidtransPaymentAction.bind(null, orderNumber);

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <LoadingButton type="submit" loading={isPending} className="w-full">
          Bayar sekarang
        </LoadingButton>
      </form>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}
    </div>
  );
}

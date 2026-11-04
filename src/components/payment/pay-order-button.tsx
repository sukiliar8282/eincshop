"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  createMidtransPaymentAction,
  type PaymentActionState,
} from "@/modules/payments/actions";
import { useI18n } from "@/lib/i18n/client";

type PayOrderButtonProps = {
  orderNumber: string;
};

const initialState: PaymentActionState = {};

export function PayOrderButton({ orderNumber }: PayOrderButtonProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const action = createMidtransPaymentAction.bind(null, orderNumber);

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <LoadingButton type="submit" loading={isPending} className="w-full">
          {isEn ? "Pay now" : "Bayar sekarang"}
        </LoadingButton>
      </form>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}
    </div>
  );
}

"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  createOrderAction,
  type OrderActionState,
} from "@/modules/orders/actions";
import { useI18n } from "@/lib/i18n/client";

const initialState: OrderActionState = {};

type CheckoutFormProps = {
  locale?: string;
};

export function CheckoutForm({ locale: propLocale }: CheckoutFormProps) {
  const { locale: contextLocale } = useI18n();
  const locale = propLocale || contextLocale;
  const isEn = locale === "en";

  const [state, formAction, isPending] = useActionState(
    createOrderAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value={locale} />

      {state.error && (
        <StatusMessage tone="error" className="mb-4">
          {state.error}
        </StatusMessage>
      )}

      <LoadingButton type="submit" loading={isPending} className="w-full">
        {isPending
          ? isEn
            ? "Creating order..."
            : "Memproses order..."
          : isEn
            ? "Proceed to Order"
            : "Buat order"}
      </LoadingButton>
    </form>
  );
}
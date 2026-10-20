"use client";

import { useActionState, useEffect } from "react";

import { ButtonLink } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
import { addToCartAction, type CartActionState } from "@/modules/cart/actions";
import { useI18n } from "@/lib/i18n/client";

type AddToCartFormProps = {
  productId: string;
  isAuthenticated: boolean;
};

const initialState: CartActionState = {};

export function AddToCartForm({
  productId,
  isAuthenticated,
}: AddToCartFormProps) {
  const { dict } = useI18n();
  const action = addToCartAction.bind(null, productId);

  const [state, formAction, isPending] = useActionState(action, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast("success", state.success);
    }

    if (state.error) {
      showToast("error", state.error);
    }
  }, [state.success, state.error, showToast]);

  if (!isAuthenticated) {
    return (
      <ButtonLink href="/login">{dict.productDetail.loginToBuy}</ButtonLink>
    );
  }

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <LoadingButton type="submit" loading={isPending}>
          {dict.productDetail.addToCart}
        </LoadingButton>
      </form>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}
    </div>
  );
}

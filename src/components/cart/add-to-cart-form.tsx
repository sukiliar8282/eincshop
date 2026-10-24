"use client";

import { useActionState, useEffect } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
import {
  addToCartAction,
  buyNowAction,
  type CartActionState,
} from "@/modules/cart/actions";
import { useI18n } from "@/lib/i18n/client";

type AddToCartFormProps = {
  productId: string;
  slug?: string;
  isAuthenticated?: boolean;
};

const initialState: CartActionState = {};

export function AddToCartForm({ productId }: AddToCartFormProps) {
  const { locale, dict } = useI18n();
  const isEn = locale === "en";

  const addAction = addToCartAction.bind(null, productId);
  const buyAction = buyNowAction.bind(null, productId);

  const [addState, formAddAction, isAddPending] = useActionState(
    addAction,
    initialState,
  );
  const [buyState, formBuyAction, isBuyPending] = useActionState(
    buyAction,
    initialState,
  );

  const { showToast } = useToast();

  useEffect(() => {
    if (addState.success) {
      showToast("success", addState.success);
    }
    if (addState.error) {
      showToast("error", addState.error);
    }
  }, [addState.success, addState.error, showToast]);

  useEffect(() => {
    if (buyState.error) {
      showToast("error", buyState.error);
    }
  }, [buyState.error, showToast]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Tombol 1: Tambah ke Keranjang - Langsung aktif tanpa login */}
        <form action={formAddAction}>
          <button
            type="submit"
            disabled={isAddPending || isBuyPending}
            className="flex min-h-12 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-ink)] bg-white px-5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-neutral-50 active:scale-98 disabled:opacity-50"
          >
            {isAddPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isEn ? "Adding..." : "Menambahkan..."}
              </span>
            ) : (
              dict.productDetail.addToCart
            )}
          </button>
        </form>

        {/* Tombol 2: Beli Langsung - Langsung ke checkout tanpa login */}
        <form action={formBuyAction}>
          <LoadingButton
            type="submit"
            loading={isBuyPending}
            disabled={isAddPending || isBuyPending}
            className="min-h-12 w-full shadow-xs active:scale-98"
          >
            {isEn ? "Buy Now" : "Beli Langsung"}
          </LoadingButton>
        </form>
      </div>

      {addState.error && (
        <StatusMessage tone="error">{addState.error}</StatusMessage>
      )}
      {buyState.error && (
        <StatusMessage tone="error">{buyState.error}</StatusMessage>
      )}
      {addState.success && (
        <StatusMessage tone="success">{addState.success}</StatusMessage>
      )}
    </div>
  );
}

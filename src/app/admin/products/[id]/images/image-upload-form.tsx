"use client";

import { useActionState, useEffect } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
import {
  uploadProductImageAction,
  type ProductImageActionState,
} from "@/modules/catalog/image-actions";

type ImageUploadFormProps = {
  productId: string;
};

const initialState: ProductImageActionState = {};

export function ImageUploadForm({ productId }: ImageUploadFormProps) {
  const action = uploadProductImageAction.bind(null, productId);

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

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6"
    >
      <div>
        <label
          htmlFor="file"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          Foto product
        </label>

        <input
          id="file"
          name="file"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          required
          className="block min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 py-3 text-sm"
        />

        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Format JPG, PNG, atau WebP. Ukuran minimal 1600 × 1200 px, maksimal 5
          MB, dan maksimal 5 foto per product.
        </p>
      </div>

      <div>
        <label
          htmlFor="altText"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          Alt text
        </label>

        <input
          id="altText"
          name="altText"
          type="text"
          maxLength={160}
          placeholder="Contoh: Cover ebook produktivitas"
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
        />

        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Digunakan untuk accessibility dan SEO.
        </p>
      </div>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      <LoadingButton type="submit" loading={isPending}>
        Upload foto
      </LoadingButton>
    </form>
  );
}

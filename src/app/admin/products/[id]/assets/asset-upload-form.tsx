"use client";

import { useActionState, useEffect } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
import {
  uploadDigitalAssetAction,
  type AssetActionState,
} from "@/modules/catalog/asset-actions";

type AssetUploadFormProps = {
  productId: string;
};

const initialState: AssetActionState = {};

export function AssetUploadForm({ productId }: AssetUploadFormProps) {
  const uploadAction = uploadDigitalAssetAction.bind(null, productId);

  const [state, formAction, isPending] = useActionState(
    uploadAction,
    initialState,
  );
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
      className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6"
    >
      <label
        htmlFor="file"
        className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
      >
        Digital asset
      </label>

      <input
        id="file"
        name="file"
        type="file"
        accept=".pdf,.zip,application/pdf,application/zip"
        required
        className="block w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 py-3 text-sm"
      />

      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Format PDF atau ZIP, maksimal 4 MB.
      </p>

      {state.error && (
        <div className="mt-4">
          <StatusMessage tone="error">{state.error}</StatusMessage>
        </div>
      )}

      {state.success && (
        <div className="mt-4">
          <StatusMessage tone="success">{state.success}</StatusMessage>
        </div>
      )}

      <div className="mt-5">
        <LoadingButton type="submit" loading={isPending}>
          Upload asset
        </LoadingButton>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  createCategoryAction,
  type CatalogActionState,
} from "@/modules/catalog/actions";

const initialState: CatalogActionState = {};

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">
        Tambah kategori
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Nama
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={80}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-medium">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            placeholder="contoh: design-template"
            maxLength={80}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
          />
        </div>
      </div>

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
          Simpan kategori
        </LoadingButton>
      </div>
    </form>
  );
}

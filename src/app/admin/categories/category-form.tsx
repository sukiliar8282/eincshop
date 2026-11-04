"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  createCategoryAction,
  type CatalogActionState,
} from "@/modules/catalog/actions";
import { useI18n } from "@/lib/i18n/client";

const initialState: CatalogActionState = {};

export function CategoryForm() {
  const { locale } = useI18n();
  const isEn = locale === "en";

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
        {isEn ? "Add New Category" : "Tambah kategori"}
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            {isEn ? "Category Name" : "Nama"}
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={80}
            placeholder={
              isEn ? "e.g., Design Templates" : "contoh: Template Desain"
            }
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm outline-none focus:border-[var(--color-ink)]"
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
            placeholder={
              isEn ? "e.g., design-templates" : "contoh: design-templates"
            }
            maxLength={80}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm outline-none focus:border-[var(--color-ink)]"
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
          {isEn ? "Save Category" : "Simpan kategori"}
        </LoadingButton>
      </div>
    </form>
  );
}

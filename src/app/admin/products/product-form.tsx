"use client";

import { useActionState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  createProductAction,
  type CatalogActionState,
} from "@/modules/catalog/actions";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
};

const initialState: CatalogActionState = {};

export function ProductForm({ categories }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6"
    >
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Product title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
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
          placeholder="contoh: brand-guideline-einc"
          maxLength={160}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-2 block text-sm font-medium">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm"
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={5000}
          rows={7}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 py-3 text-sm"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="priceIdr" className="mb-2 block text-sm font-medium">
            Harga dalam IDR
          </label>
          <input
            id="priceIdr"
            name="priceIdr"
            type="number"
            min="0"
            step="1"
            required
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="sku" className="mb-2 block text-sm font-medium">
            Kode Produk{" "}
            <span className="font-normal text-gray-500">(opsional)</span>
          </label>
          <input
            id="sku"
            name="sku"
            placeholder="Contoh: EBK-Ebook-002"
            maxLength={80}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="file" className="mb-2 block text-sm font-medium">
          File digital product
        </label>

        <input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.zip,application/pdf,application/zip"
          className="block w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 py-3 text-sm"
        />

        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          PDF atau ZIP, maksimal 4 MB. Wajib diisi jika status product
          Published.
        </p>
      </div>

      <div>
        <label htmlFor="status" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue="DRAFT"
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      <LoadingButton
        type="submit"
        loading={isPending}
        disabled={categories.length === 0}
      >
        Simpan product
      </LoadingButton>

      {categories.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">
          Buat kategori terlebih dahulu sebelum membuat product.
        </p>
      )}
    </form>
  );
}

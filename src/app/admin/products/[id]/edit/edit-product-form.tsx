"use client";

import { useActionState, useRef, useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  updateProductAction,
  type CatalogActionState,
} from "@/modules/catalog/actions";

type EditProductFormProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    priceMinor: number;
    sku: string | null;
    categoryId: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  };
  categories: {
    id: string;
    name: string;
  }[];
  currentAsset: {
    fileName: string;
    fileSize: number;
  } | null;
};

const initialState: CatalogActionState = {};

export function EditProductForm({
  product,
  categories,
  currentAsset,
}: EditProductFormProps) {
  const updateAction = updateProductAction.bind(null, product.id);

  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialState,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  return (
    <form
      action={formAction}
      onReset={() => setSelectedFileName(null)}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6"
    >
      {/* 1. TITLE */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Product title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
          defaultValue={product.title}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
        />
      </div>

      {/* 2. SLUG */}
      <div>
        <label htmlFor="slug" className="mb-2 block text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          maxLength={160}
          defaultValue={product.slug}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
        />
      </div>

      {/* 3. CATEGORY */}
      <div>
        <label htmlFor="categoryId" className="mb-2 block text-sm font-medium">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={product.categoryId}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* 4. DESCRIPTION */}
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
          defaultValue={product.description}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 py-3 text-sm"
        />
      </div>

      {/* 5. PRICE & SKU */}
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
            defaultValue={product.priceMinor}
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
            placeholder="Contoh: EBK-GGB-01"
            maxLength={80}
            defaultValue={product.sku ?? ""}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
          />
        </div>
      </div>

      {/* 6. STATUS */}
      <div>
        <label htmlFor="status" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={
            product.status === "ARCHIVED" ? "DRAFT" : product.status
          }
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {/* 7. DIGITAL ASSET */}
      <div>
        <span className="mb-2 block text-sm font-medium">
          File digital{" "}
          <span className="font-normal text-gray-500">(opsional)</span>
        </span>

        {currentAsset && (
          <p className="mb-3 text-sm text-gray-600">
            File saat ini:{" "}
            <span className="font-medium text-[var(--color-ink)]">
              {currentAsset.fileName}
            </span>{" "}
            · {(currentAsset.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        )}

        <div className="flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white p-1 pr-3">
          <input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            accept=".pdf,.zip,application/pdf,application/zip"
            className="peer sr-only"
            onChange={(event) =>
              setSelectedFileName(event.target.files?.[0]?.name ?? null)
            }
          />

          <label
            htmlFor="file"
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-[calc(var(--radius-control)-2px)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white transition hover:opacity-90 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--color-ink)]"
          >
            {currentAsset ? "Ganti file" : "Pilih file"}
          </label>

          <span className="min-w-0 flex-1 truncate text-sm text-gray-500">
            {selectedFileName ?? "Belum ada file dipilih"}
          </span>

          {selectedFileName && (
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                setSelectedFileName(null);
              }}
              className="shrink-0 text-sm text-gray-500 hover:text-[var(--color-ink)]"
            >
              Batal
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Kosongkan jika tidak ingin mengganti file. Maksimal 4 MB, format PDF
          atau ZIP. Jika diganti, pembeli lama akan mengunduh file versi baru.
        </p>
      </div>

      {/* FEEDBACK STATE */}
      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      {/* SUBMIT BUTTON */}
      <LoadingButton type="submit" loading={isPending}>
        Simpan perubahan
      </LoadingButton>
    </form>
  );
}

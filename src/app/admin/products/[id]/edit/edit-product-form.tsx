"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  updateProductAction,
  type CatalogActionState,
} from "@/modules/catalog/actions";
import { ImageCropUploader } from "@/components/ui/image-crop-uploader";
import { TechStackInput } from "@/components/admin/tech-stack-input";
import { useI18n } from "@/lib/i18n/client";

type CategoryOption = {
  id: string;
  name: string;
};

type ExistingImage = {
  id: string;
  url: string;
};

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
    images: ExistingImage[];
    techStack?: string[];
  };
  categories: CategoryOption[];
  currentAsset: {
    fileName: string;
    fileSize: number;
  } | null;
  isSuperAdmin?: boolean;
};

const initialState: CatalogActionState = {};

export function EditProductForm({
  product,
  categories,
  currentAsset,
  isSuperAdmin = false,
}: EditProductFormProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const action = updateProductAction.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  // Form State Controlled untuk interaksi dinamis
  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Kategori Dinamis: Dropdown yang ada atau Buat Kategori Baru
  const [categoryMode, setCategoryMode] = useState<"existing" | "custom">(
    "existing",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product.categoryId,
  );
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Otomatis generate slug jika seller belum pernah mengedit slug secara manual
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 sm:p-8"
    >
      {/* Parameter Bahasa Aktif ke Server Action */}
      <input type="hidden" name="locale" value={locale} />

      {/* 1. NAMA PRODUK */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn ? "Product Title" : "Nama Produk"}
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={
            isEn
              ? "e.g. Next.js SaaS Starter Kit"
              : "contoh: Template Web Marketplace Next.js"
          }
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 2. SLUG URL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            {isEn ? "Slug (URL Path)" : "Slug (URL Produk)"}
          </label>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {isEn ? "Auto-generated from title" : "Otomatis dari judul"}
          </span>
        </div>
        <input
          id="slug"
          name="slug"
          required
          maxLength={160}
          value={slug}
          onChange={(e) => {
            setIsSlugManual(true);
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
          }}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-neutral-50 px-3 text-sm font-mono text-[var(--color-ink)] focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 3. KATEGORI PRODUK (BISA PILIH ATAU BUAT KUSTOM) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            {isEn ? "Product Category" : "Kategori Produk"}
          </label>
          <button
            type="button"
            onClick={() => {
              setCategoryMode(categoryMode === "existing" ? "custom" : "existing");
              setCustomCategoryInput("");
            }}
            className="text-xs font-semibold text-[var(--color-accent-strong)] hover:underline cursor-pointer"
          >
            {categoryMode === "existing"
              ? isEn
                ? "+ Type New Custom Category"
                : "+ Ketik Kategori Kustom Baru"
              : isEn
                ? "← Choose from Existing Categories"
                : "← Pilih dari Kategori yang Ada"}
          </button>
        </div>

        {categoryMode === "existing" ? (
          <div className="relative">
            <select
              id="categoryId"
              name="categoryId"
              required={categoryMode === "existing"}
              value={selectedCategoryId}
              onChange={(e) => {
                if (e.target.value === "NEW_CUSTOM_TRIGGER") {
                  setCategoryMode("custom");
                  setCustomCategoryInput("");
                } else {
                  setSelectedCategoryId(e.target.value);
                }
              }}
              className="min-h-11 w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 pr-8 text-sm focus:border-[var(--color-ink)] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {isSuperAdmin && (
                <option
                  value="NEW_CUSTOM_TRIGGER"
                  className="font-medium text-[var(--color-accent-strong)]"
                >
                  {isEn
                    ? "+ Create new custom category..."
                    : "+ Buat kategori kustom baru..."}
                </option>
              )}
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              id="newCategoryName"
              name="newCategoryName"
              type="text"
              required={categoryMode === "custom"}
              value={customCategoryInput}
              onChange={(e) => setCustomCategoryInput(e.target.value)}
              placeholder={
                isEn
                  ? "e.g. Lightroom Presets, Notion Templates, Audio & Music"
                  : "contoh: Preset Lightroom, Template Notion, Audio & Musik"
              }
              maxLength={80}
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 4. TECH STACK & FRAMEWORKS (SINKRON KE FILTER KATALOG) */}
      <TechStackInput initialValues={product.techStack} isEn={isEn} />

      {/* 5. DESKRIPSI PRODUK */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            {isEn ? "Description" : "Deskripsi Lengkap"}
          </label>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {isEn ? "Min. 20 characters" : "Min. 20 karakter"}
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={product.description}
          placeholder={
            isEn
              ? "Describe features, technical architecture, and included items..."
              : "Jelaskan fitur, arsitektur teknis, dan apa saja yang didapatkan pembeli..."
          }
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] p-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 6. HARGA PRODUK (IDR) */}
      <div>
        <label
          htmlFor="price"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn ? "Price (IDR)" : "Harga Jual (IDR)"}
        </label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3.5 text-xs font-semibold text-[var(--color-text-muted)]">
            Rp
          </span>
          <input
            id="price"
            name="price"
            type="number"
            min="10000"
            max="100000000"
            step="1000"
            required
            defaultValue={product.priceMinor}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] pl-10 pr-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
      </div>

      {/* 7. KODE PRODUK / SKU (OPSIONAL) */}
      <div>
        <label
          htmlFor="sku"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn
            ? "SKU / Product Code (Optional)"
            : "Kode SKU / Produk (Opsional)"}
        </label>
        <input
          id="sku"
          name="sku"
          maxLength={40}
          defaultValue={product.sku ?? ""}
          placeholder="e.g. TEMPLATE-NEXTJS-01"
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none font-mono uppercase"
        />
      </div>

      {/* 8. FOTO PRODUK (INTEGRASI CROPPER RASIO 4:3) */}
      <ImageCropUploader initialImages={product.images} />

      {/* 9. BERKAS DIGITAL UTAMA (.ZIP ATAU .PDF) */}
      <div className="rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-neutral-50/50 p-4">
        <label
          htmlFor="file"
          className="block text-sm font-semibold text-[var(--color-ink)]"
        >
          {isEn
            ? "Downloadable Digital File (.zip or .pdf)"
            : "Berkas Digital yang Dijual (.zip atau .pdf)"}
        </label>

        {currentAsset ? (
          <div className="mt-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] pb-3">
            <span className="text-[var(--color-text-muted)]">
              {isEn ? "Current file:" : "Berkas aktif:"}{" "}
              <strong className="text-[var(--color-ink)] font-mono">
                {currentAsset.fileName}
              </strong>{" "}
              ({(currentAsset.fileSize / 1024 / 1024).toFixed(2)} MB).{" "}
              {isEn
                ? "Upload a new file below to replace it."
                : "Unggah file baru di bawah jika ingin menggantinya."}
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 text-[10px]">
              {isEn ? "File uploaded" : "File tersedia"}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {isEn
              ? "Max 4 MB. Required for buyers to download after successful payment."
              : "Maksimal 4 MB. Berkas ini yang otomatis dapat diunduh pembeli setelah lunas."}
          </p>
        )}

        <div className="mt-3">
          <input
            id="file"
            name="file"
            type="file"
            accept=".zip,.pdf"
            className="block w-full text-xs text-[var(--color-text-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-surface-muted)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-ink)] hover:file:bg-[var(--color-line)] cursor-pointer"
          />
        </div>
      </div>

      {/* 10. STATUS PUBLIKASI PRODUK */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          {isEn ? "Product Status" : "Status Publikasi"}
        </label>
        <div className="flex flex-wrap gap-2">
          {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((s) => (
            <label
              key={s}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-4 text-xs font-semibold text-[var(--color-ink)] has-checked:border-[var(--color-ink)] has-checked:bg-[var(--color-ink)] has-checked:!text-white has-checked:text-white! cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="status"
                value={s}
                defaultChecked={product.status === s}
                className="hidden"
              />
              {s === "PUBLISHED"
                ? isEn
                  ? "Published"
                  : "Rilis Publik"
                : s === "DRAFT"
                  ? isEn
                    ? "Draft"
                    : "Draf"
                  : isEn
                    ? "Archived"
                    : "Arsip"}
            </label>
          ))}
        </div>
      </div>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}
      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      {/* TOMBOL AKSI SIMPAN */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-line)]">
        <Link
          href="/admin/products"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
        >
          {isEn ? "Cancel" : "Batal"}
        </Link>

        <LoadingButton
          type="submit"
          loading={isPending}
          loadingText={isEn ? "Saving changes..." : "Menyimpan perubahan..."}
          className="min-h-11 flex-1 shadow-xs font-semibold text-xs"
        >
          {isEn ? "Save Product Changes" : "Simpan Perubahan Produk"}
        </LoadingButton>
      </div>
    </form>
  );
}
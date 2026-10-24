"use client";

import { useActionState, useRef, useState, useEffect } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  updateProductAction,
  type CatalogActionState,
} from "@/modules/catalog/actions";
import { useI18n } from "@/lib/i18n/client";
import { ImageCropUploader } from "@/components/ui/image-crop-uploader";

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

  const updateAction = updateProductAction.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialState,
  );

  // STATE PERSISTENCE (Anti-Reset State)
  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState(product.description);
  const [priceIdr, setPriceIdr] = useState(String(product.priceMinor));
  const [sku, setSku] = useState(product.sku ?? "");
  const [status, setStatus] = useState(product.status);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product.categoryId,
  );

  // State Mode Kategori: "existing" atau "custom"
  const [categoryMode, setCategoryMode] = useState<"existing" | "custom">(
    "existing",
  );
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // State & Ref Berkas Digital Downloadable
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);

  useEffect(() => {
    if (!fileInputRef.current || !digitalFile) return;
    try {
      const dt = new DataTransfer();
      dt.items.add(digitalFile);
      fileInputRef.current.files = dt.files;
    } catch {
      // Fallback aman
    }
  }, [digitalFile]);

  // Otomatisasi Slug dari Judul
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

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
          placeholder={
            isEn
              ? "e.g. nextjs-saas-starter-kit"
              : "contoh: template-web-marketplace-nextjs"
          }
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 3. KATEGORI FLEKSIBEL (BAWAAN ATAU KUSTOM) */}
      <div className="rounded-xl border border-[var(--color-line-strong)] bg-neutral-50/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label className="text-sm font-semibold text-[var(--color-ink)]">
            {isEn ? "Product Category" : "Kategori Produk"}
          </label>

          {isSuperAdmin && (
            <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCategoryMode("existing")}
                className={`rounded-md px-3 py-1.5 font-medium transition ${
                  categoryMode === "existing"
                    ? "bg-[var(--color-ink)] text-white shadow-xs"
                    : "text-gray-600 hover:text-[var(--color-ink)]"
                }`}
              >
                {isEn ? "Available Categories" : "Kategori Bawaan"}
              </button>
              <button
                type="button"
                onClick={() => setCategoryMode("custom")}
                className={`rounded-md px-3 py-1.5 font-medium transition ${
                  categoryMode === "custom"
                    ? "bg-[var(--color-ink)] text-white shadow-xs"
                    : "text-gray-600 hover:text-[var(--color-ink)]"
                }`}
              >
                {isEn ? "+ Custom Category" : "+ Buat Kategori Sendiri"}
              </button>
            </div>
          )}
        </div>

        <input
          type="hidden"
          name="isCustomCategory"
          value={isSuperAdmin && categoryMode === "custom" ? "true" : "false"}
        />

        {categoryMode === "existing" || !isSuperAdmin ? (
          <div>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={selectedCategoryId}
              onChange={(e) => {
                if (isSuperAdmin && e.target.value === "__CREATE_NEW__") {
                  setCategoryMode("custom");
                } else {
                  setSelectedCategoryId(e.target.value);
                }
              }}
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
            >
              <option value="" disabled>
                {isEn
                  ? "-- Select an available category --"
                  : "-- Pilih kategori bawaan --"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              {isSuperAdmin && (
                <option
                  value="__CREATE_NEW__"
                  className="font-semibold text-[var(--color-accent-strong)]"
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

      {/* 4. DESKRIPSI PRODUK */}
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
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isEn
              ? "Describe features, technical architecture, and included items..."
              : "Jelaskan fitur utama, teknologi yang digunakan, serta apa saja yang didapatkan pembeli..."
          }
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] p-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 5. HARGA PRODUK */}
      <div>
        <label
          htmlFor="priceIdr"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn ? "Price (IDR)" : "Harga Jual (Rupiah)"}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--color-text-muted)]">
            Rp
          </span>
          <input
            id="priceIdr"
            name="priceIdr"
            type="number"
            min="0"
            step="1000"
            required
            value={priceIdr}
            onChange={(e) => setPriceIdr(e.target.value)}
            placeholder="50000"
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] pl-10 pr-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
      </div>

      {/* 6. SKU / KODE UNIK */}
      <div>
        <label
          htmlFor="sku"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn
            ? "SKU / Product Code (Optional)"
            : "SKU / Kode Unik (Opsional)"}
        </label>
        <input
          id="sku"
          name="sku"
          maxLength={64}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder={
            isEn ? "e.g. TEMPLATE-NEXTJS-01" : "contoh: TEMPLATE-NEXTJS-01"
          }
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 7. FOTO PRODUK (CROPPER & PREVIEW) */}
      <ImageCropUploader initialImages={product.images} />

      {/* 8. BERKAS DIGITAL DOWNLOADABLE */}
      <div className="rounded-xl border border-[var(--color-line-strong)] bg-neutral-50/50 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="file"
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            {isEn
              ? "Downloadable Digital File (.zip or .pdf)"
              : "Berkas Digital Downloadable (.zip atau .pdf)"}
          </label>
          {currentAsset && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              {isEn ? "File uploaded" : "Berkas terpasang"}
            </span>
          )}
        </div>
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          {currentAsset
            ? isEn
              ? `Current file: ${currentAsset.fileName} (${(currentAsset.fileSize / 1024 / 1024).toFixed(2)} MB). Upload a new file below to replace it.`
              : `Berkas aktif: ${currentAsset.fileName} (${(currentAsset.fileSize / 1024 / 1024).toFixed(2)} MB). Unggah berkas baru di bawah jika ingin menggantinya.`
            : isEn
              ? "Upload the primary file that customers will be able to download after payment."
              : "Unggah berkas utama yang akan didapatkan pembeli setelah pembayaran berhasil."}
        </p>

        <input
          ref={fileInputRef}
          id="file"
          name="file"
          type="file"
          accept=".zip,.pdf"
          className="sr-only"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label
            htmlFor="file-proxy"
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[var(--color-line-strong)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] shadow-2xs hover:bg-neutral-50 transition"
          >
            <svg
              className="w-4 h-4 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>
              {digitalFile
                ? isEn
                  ? "Change New File"
                  : "Ganti Berkas Baru"
                : currentAsset
                  ? isEn
                    ? "Replace File"
                    : "Ganti Berkas"
                  : isEn
                    ? "Choose File"
                    : "Pilih Berkas"}
            </span>
          </label>
          <input
            id="file-proxy"
            type="file"
            accept=".zip,.pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setDigitalFile(file);
            }}
          />

          <span className="text-xs text-[var(--color-text-muted)] truncate max-w-xs">
            {digitalFile
              ? `${digitalFile.name} (${(digitalFile.size / 1024 / 1024).toFixed(2)} MB)`
              : currentAsset
                ? isEn
                  ? "Keep current file"
                  : "Tetap gunakan berkas saat ini"
                : isEn
                  ? "No file selected (Max. 4 MB)"
                  : "Belum ada berkas dipilih (Maks. 4 MB)"}
          </span>
        </div>
      </div>

      {/* 9. STATUS PRODUK */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          {isEn ? "Product Status" : "Status Publikasi"}
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatus("DRAFT")}
            className={`min-h-11 rounded-[var(--radius-control)] border px-4 text-sm font-semibold transition ${
              status === "DRAFT"
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                : "border-[var(--color-line-strong)] bg-white text-[var(--color-text-muted)] hover:bg-neutral-50"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setStatus("PUBLISHED")}
            className={`min-h-11 rounded-[var(--radius-control)] border px-4 text-sm font-semibold transition ${
              status === "PUBLISHED"
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                : "border-[var(--color-line-strong)] bg-white text-[var(--color-text-muted)] hover:bg-neutral-50"
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setStatus("ARCHIVED")}
            className={`min-h-11 rounded-[var(--radius-control)] border px-4 text-sm font-semibold transition ${
              status === "ARCHIVED"
                ? "border-red-600 bg-red-600 text-white"
                : "border-[var(--color-line-strong)] bg-white text-[var(--color-text-muted)] hover:bg-neutral-50"
            }`}
          >
            Archived
          </button>
        </div>
        <input type="hidden" name="status" value={status} />
      </div>

      {/* NOTIFIKASI ERROR / SUKSES */}
      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}
      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      {/* TOMBOL SIMPAN / SUBMIT */}
      <div className="pt-2">
        <LoadingButton
          type="submit"
          loading={isPending}
          className="min-h-12 w-full rounded-[var(--radius-control)] bg-[var(--color-ink)] px-6 text-sm font-semibold text-white transition-all hover:bg-[var(--color-ink-soft)] active:scale-98 shadow-xs"
        >
          {isEn ? "Save Changes" : "Simpan Perubahan"}
        </LoadingButton>
      </div>
    </form>
  );
}

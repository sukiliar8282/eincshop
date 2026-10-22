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
};

const initialState: CatalogActionState = {};

export function EditProductForm({
  product,
  categories,
  currentAsset,
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
  const [isSlugManual, setIsSlugManual] = useState(true);
  const [description, setDescription] = useState(product.description);
  const [priceIdr, setPriceIdr] = useState(product.priceMinor.toString());
  const [sku, setSku] = useState(product.sku ?? "");
  const [status, setStatus] = useState<string>(
    product.status === "ARCHIVED" ? "DRAFT" : product.status,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product.categoryId,
  );

  // Mode Kategori Fleksibel: "existing" atau "custom"
  const [categoryMode, setCategoryMode] = useState<"existing" | "custom">(
    "existing",
  );
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // State Berkas Digital Pengganti (Downloadable Asset)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);

  useEffect(() => {
    if (!fileInputRef.current || !digitalFile) return;
    try {
      const dt = new DataTransfer();
      dt.items.add(digitalFile);
      fileInputRef.current.files = dt.files;
    } catch {
      // Fallback
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

      {/* 1. NAMA PRODUK / PRODUCT TITLE */}
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
        </div>

        <input
          type="hidden"
          name="isCustomCategory"
          value={categoryMode === "custom" ? "true" : "false"}
        />

        {categoryMode === "existing" ? (
          <div>
            <select
              id="categoryId"
              name="categoryId"
              required={categoryMode === "existing"}
              value={selectedCategoryId}
              onChange={(e) => {
                if (e.target.value === "__CREATE_NEW__") {
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
              <option
                value="__CREATE_NEW__"
                className="font-semibold text-[var(--color-accent-strong)]"
              >
                {isEn
                  ? "+ Create new custom category..."
                  : "+ Buat kategori kustom baru..."}
              </option>
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
            {description.length}/5000{" "}
            {isEn ? "(min. 20 chars)" : "(min. 20 karakter)"}
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={5000}
          rows={7}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isEn
              ? "Describe your product features, prerequisites, and contents (at least 20 characters)..."
              : "Jelaskan fitur, isi produk, petunjuk penggunaan, dan spesifikasinya (minimal 20 karakter)..."
          }
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {/* 5. HARGA & SKU */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="priceIdr"
            className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
          >
            {isEn ? "Price in IDR (Rupiah)" : "Harga dalam Rupiah (IDR)"}
          </label>
          <input
            id="priceIdr"
            name="priceIdr"
            type="number"
            min="0"
            step="1"
            required
            value={priceIdr}
            onChange={(e) => setPriceIdr(e.target.value)}
            placeholder="150000"
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="sku"
            className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
          >
            {isEn ? "Product Code / SKU " : "Kode Produk / SKU "}
            <span className="font-normal text-[var(--color-text-muted)]">
              {isEn ? "(optional)" : "(opsional)"}
            </span>
          </label>
          <input
            id="sku"
            name="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder={isEn ? "e.g. EBK-NEXTJS-01" : "Contoh: EBK-NEXTJS-01"}
            maxLength={80}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
      </div>

      {/* 6. UPLOADER FOTO PRODUK (CROP & SLIDE 4:3 + INITIAL IMAGES) */}
      <div className="rounded-xl border border-gray-100 bg-neutral-50/50 p-4 sm:p-5">
        <ImageCropUploader
          maxImages={5}
          maxSizeBytes={5 * 1024 * 1024}
          inputName="images"
          initialImages={product.images}
        />
      </div>

      {/* 7. BERKAS DIGITAL PRODUK (DOWNLOADABLE ASSET) */}
      <div>
        <label
          htmlFor="file"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn
            ? "Digital Product Asset (Downloadable)"
            : "Berkas Digital Produk (Dapat Diunduh)"}{" "}
          <span className="font-normal text-[var(--color-text-muted)]">
            {isEn ? "(optional)" : "(opsional)"}
          </span>
        </label>

        {currentAsset && (
          <p className="mb-2.5 text-xs text-gray-600">
            {isEn ? "Current active file: " : "Berkas aktif saat ini: "}
            <span className="font-semibold text-[var(--color-ink)]">
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
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setDigitalFile(selected);
            }}
          />
          <label
            htmlFor="file"
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-[calc(var(--radius-control)-2px)] bg-[var(--color-ink)] px-4 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
          >
            {currentAsset
              ? isEn
                ? "Replace File"
                : "Ganti Berkas"
              : isEn
                ? "Choose File"
                : "Pilih Berkas"}
          </label>
          <span className="min-w-0 flex-1 truncate text-xs text-[var(--color-text-muted)]">
            {digitalFile
              ? digitalFile.name
              : isEn
                ? "No new file chosen"
                : "Belum ada berkas baru dipilih"}
          </span>
          {digitalFile && (
            <button
              type="button"
              onClick={() => {
                setDigitalFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
            >
              {isEn ? "Cancel" : "Batal"}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          {isEn
            ? "Leave empty to keep current file. PDF or ZIP format, max 4 MB. Replacing this file will update the download for existing and new buyers."
            : "Kosongkan jika tidak ingin mengganti berkas. Format PDF atau ZIP, maksimal 4 MB. Penggantian berkas otomatis berlaku untuk pembeli lama dan baru."}
        </p>
      </div>

      {/* 8. STATUS PUBLIKASI */}
      <div>
        <label
          htmlFor="status"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {isEn ? "Publication Status" : "Status Publikasi"}
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        >
          <option value="DRAFT">
            {isEn ? "Draft (Hidden from Catalog)" : "Draf (Belum Ditampilkan)"}
          </option>
          <option value="PUBLISHED">
            {isEn
              ? "Published (Live on Catalog)"
              : "Dipublikasikan (Aktif di Katalog)"}
          </option>
        </select>
      </div>

      {/* STATUS PESAN ERROR / SUKSES */}
      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}
      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      {/* TOMBOL SIMPAN PERUBAHAN */}
      <LoadingButton
        type="submit"
        loading={isPending}
        disabled={categoryMode === "existing" && categories.length === 0}
      >
        {isEn ? "Save Changes" : "Simpan Perubahan"}
      </LoadingButton>
    </form>
  );
}

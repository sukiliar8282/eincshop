"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n/client";

export type UploadedImageItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export type ExistingImageItem = {
  id: string;
  url: string;
};

type ImageCropUploaderProps = {
  maxImages?: number;
  maxSizeBytes?: number;
  inputName?: string;
  initialImages?: ExistingImageItem[];
};

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 270;

export function ImageCropUploader({
  maxImages = DEFAULT_MAX_IMAGES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  inputName = "images",
  initialImages = [],
}: ImageCropUploaderProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  // Foto yang sudah ada sebelumnya dari database
  const [existingImages, setExistingImages] =
    useState<ExistingImageItem[]>(initialImages);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // Foto baru hasil crop yang diunggah saat ini
  const [newImages, setNewImages] = useState<UploadedImageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Dialog Crop
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [imageToCropSrc, setImageToCropSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] =
    useState<string>("product-image.jpg");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const filePickerRef = useRef<HTMLInputElement>(null);
  const hiddenDataInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const totalImageCount = existingImages.length + newImages.length;

  // 1. Render preview canvas rasio 4:3
  const renderCropPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const baseScale = Math.max(
      CANVAS_WIDTH / img.width,
      CANVAS_HEIGHT / img.height,
    );
    const currentScale = baseScale * zoom;

    const drawWidth = img.width * currentScale;
    const drawHeight = img.height * currentScale;

    const centerX = (CANVAS_WIDTH - drawWidth) / 2 + offset.x;
    const centerY = (CANVAS_HEIGHT - drawHeight) / 2 + offset.y;

    ctx.drawImage(img, centerX, centerY, drawWidth, drawHeight);
  }, [zoom, offset]);

  // 2. Sinkronisasi file baru ke hidden input
  useEffect(() => {
    if (!hiddenDataInputRef.current) return;
    try {
      const dataTransfer = new DataTransfer();
      newImages.forEach((item) => dataTransfer.items.add(item.file));
      hiddenDataInputRef.current.files = dataTransfer.files;
    } catch {
      // Fallback
    }
  }, [newImages]);

  // 3. Muat gambar ke memori
  useEffect(() => {
    if (!imageToCropSrc) return;
    const img = new Image();
    img.src = imageToCropSrc;
    img.onload = () => {
      sourceImageRef.current = img;
      renderCropPreview();
    };
  }, [imageToCropSrc, renderCropPreview]);

  // 4. Update canvas
  useEffect(() => {
    if (isCropOpen) {
      renderCropPreview();
    }
  }, [isCropOpen, renderCropPreview]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (totalImageCount >= maxImages) {
      setErrorMessage(
        isEn
          ? `Maximum limit of ${maxImages} images reached.`
          : `Batas maksimal ${maxImages} foto telah tercapai.`,
      );
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMessage(
        isEn
          ? `File size exceeds ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB limit.`
          : `Ukuran file melebihi batas maksimal ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB.`,
      );
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }

    setOriginalFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCropSrc(reader.result as string);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);

    if (filePickerRef.current) filePickerRef.current.value = "";
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File(
          [blob],
          originalFileName.replace(/\.[^/.]+$/, "") + "-cropped.jpg",
          { type: "image/jpeg" },
        );

        const newItem: UploadedImageItem = {
          id: crypto.randomUUID(),
          file: croppedFile,
          previewUrl: URL.createObjectURL(blob),
        };

        setNewImages((prev) => [...prev, newItem]);
        setIsCropOpen(false);
        setImageToCropSrc(null);
      },
      "image/jpeg",
      0.92,
    );
  };

  const cancelCrop = () => {
    setIsCropOpen(false);
    setImageToCropSrc(null);
  };

  // Hapus foto lama yang sudah ada di database
  const removeExistingImage = (idToRemove: string) => {
    setExistingImages((prev) => prev.filter((item) => item.id !== idToRemove));
    setDeletedImageIds((prev) => [...prev, idToRemove]);
  };

  // Hapus foto baru hasil crop saat ini
  const removeNewImage = (idToRemove: string) => {
    setNewImages((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  return (
    <div className="space-y-3">
      {/* Hidden input berkas baru */}
      <input
        ref={hiddenDataInputRef}
        type="file"
        name={inputName}
        multiple
        className="hidden"
      />

      {/* Hidden input daftar ID foto lama yang dihapus seller */}
      {deletedImageIds.map((id) => (
        <input key={id} type="hidden" name="deletedImageIds" value={id} />
      ))}

      {/* Hidden picker */}
      <input
        ref={filePickerRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--color-ink)]">
          {isEn
            ? "Product Images (4:3 Catalog Ratio)"
            : "Foto Produk (Rasio 4:3 Sesuai Katalog)"}
        </label>
        <span className="text-xs text-[var(--color-text-muted)]">
          {totalImageCount}/{maxImages} {isEn ? "photos" : "foto"}
        </span>
      </div>

      {/* HORIZONTAL CAROUSEL STRIP */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {/* 1. Render Foto Lama dari Database */}
        {existingImages.map((item, index) => (
          <div
            key={item.id}
            className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line-strong)] bg-neutral-100 shadow-xs sm:h-24 sm:w-32"
          >
            <img
              src={item.url}
              alt={`Existing image ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-[var(--color-ink)]/85 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                {isEn ? "Cover" : "Sampul"}
              </span>
            )}
            <button
              type="button"
              onClick={() => removeExistingImage(item.id)}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md transition hover:bg-red-700 active:scale-95"
              title={isEn ? "Remove photo" : "Hapus foto"}
            >
              ✕
            </button>
          </div>
        ))}

        {/* 2. Render Foto Baru Hasil Crop */}
        {newImages.map((item, index) => {
          const effectiveIndex = existingImages.length + index;
          return (
            <div
              key={item.id}
              className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line-strong)] bg-neutral-100 shadow-xs sm:h-24 sm:w-32"
            >
              <img
                src={item.previewUrl}
                alt={`New preview ${effectiveIndex + 1}`}
                className="h-full w-full object-cover"
              />
              {effectiveIndex === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-[var(--color-ink)]/85 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                  {isEn ? "Cover" : "Sampul"}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeNewImage(item.id)}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md transition hover:bg-red-700 active:scale-95"
                title={isEn ? "Remove photo" : "Hapus foto"}
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Tombol [+ Add Image] jika total belum mencapai maxImages */}
        {totalImageCount < maxImages && (
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--color-line-strong)] bg-neutral-50/70 p-2 text-center text-gray-500 transition hover:border-[var(--color-ink)] hover:bg-white active:scale-95 sm:h-24 sm:w-32"
          >
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[11px] font-medium leading-tight">
              {isEn ? "+ Add Image" : "+ Tambah Foto"}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        {isEn
          ? `Standard 4:3 catalog ratio. Max ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB per file. Up to ${maxImages} images.`
          : `Rasio standar 4:3 pas dengan katalog. Maks ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB per foto. Maksimal ${maxImages} foto.`}
      </p>

      {errorMessage && (
        <p className="text-xs font-medium text-red-600">{errorMessage}</p>
      )}

      {/* MODAL CROP INTERAKTIF RASIO 4:3 */}
      {isCropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                {isEn
                  ? "Crop Product Photo (4:3)"
                  : "Sesuaikan Foto Produk (Rasio 4:3)"}
              </h3>
              <button
                type="button"
                onClick={cancelCrop}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div
              className="relative mx-auto mt-4 h-[240px] w-[320px] cursor-grab overflow-hidden rounded-xl border border-gray-300 bg-neutral-900 active:cursor-grabbing sm:h-[270px] sm:w-[360px]"
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) =>
                handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchMove={(e) =>
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchEnd={handlePointerUp}
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full object-contain pointer-events-none"
              />
              <div className="pointer-events-none absolute inset-0 border-2 border-white/80 rounded-xl" />
            </div>

            <p className="mt-2 text-center text-[11px] text-gray-400">
              {isEn
                ? "Drag to reposition • Slide to zoom • Perfect 4:3 fit for catalog"
                : "Geser untuk atur posisi • Gunakan slider untuk perbesar • 100% pas kartu katalog"}
            </p>

            <div className="mt-3 flex items-center gap-3 px-2">
              <span className="text-xs font-medium text-gray-500">Zoom</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-[var(--color-ink)]"
              />
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={cancelCrop}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="flex-1 rounded-lg bg-[var(--color-ink)] py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
              >
                {isEn ? "Apply Crop" : "Gunakan Foto Ini"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

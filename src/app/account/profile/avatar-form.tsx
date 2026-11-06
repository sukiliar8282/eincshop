"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { Modal } from "@/components/ui/modal";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
import { useI18n } from "@/lib/i18n/client";
import {
  updateProfileImageAction,
  type AvatarActionState,
} from "./avatar-actions";

type AvatarFormProps = {
  currentImage?: string | null;
};

const initialState: AvatarActionState = {};
const MIN_DIMENSION = 300;
const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 512;

export function AvatarForm({ currentImage }: AvatarFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileImageAction,
    initialState,
  );
  const { showToast } = useToast();
  const { locale, t } = useI18n();
  const isEn = locale === "en";

  // State File & Live Preview
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);

  // Modal Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ nw: number; nh: number } | null>(
    null,
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const cropperContainerRef = useRef<HTMLDivElement>(null);
  const cropperImgRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Cleanup blob memory saat unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      if (rawImageSrc && rawImageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(rawImageSrc);
      }
    };
  }, [previewUrl, rawImageSrc]);

  // Handler Notifikasi Toast
  useEffect(() => {
    if (state.success) {
      showToast("success", state.success);
    }

    if (state.error) {
      showToast("error", state.error);
    }
  }, [state.success, state.error, showToast]);

  // Handler Pemilihan File: Tangguh di Android, iOS, dan Desktop
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    // Batasi ukuran file mentah maksimal 25 MB
    if (file.size > 25 * 1024 * 1024) {
      showToast(
        "error",
        isEn
          ? "Original photo is too large (maximum 25 MB)."
          : "Ukuran foto asli terlalu besar (maksimal 25 MB).",
      );
      return;
    }

    // Android Compatibility: Validasi cerdas via MIME atau ekstensi nama berkas
    const isImageMime =
      !file.type ||
      file.type.startsWith("image/") ||
      file.type === "application/octet-stream";
    const isImageExt = /\.(jpe?g|png|webp|gif|heic|heif|jpg)$/i.test(file.name);

    if (!isImageMime && !isImageExt) {
      showToast(
        "error",
        isEn
          ? "Please use JPG, PNG, or WebP photo format."
          : "Gunakan format foto JPG, PNG, atau WebP.",
      );
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);

      setSelectedFileName(file.name || "avatar");
      setRawImageSrc(objectUrl);
      setPreviewUrl(objectUrl);
      setActiveFile(file);
      setImageMeta(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropperOpen(true);
    } catch (err) {
      console.error("[AvatarForm] Gagal memuat foto:", err);
      showToast(
        "error",
        isEn
          ? "Failed to process photo from gallery."
          : "Gagal memproses foto dari galeri HP.",
      );
    }
  }

  function handleCropperImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setImageMeta({ nw, nh });

    const minRatio = Math.max(VIEWPORT_SIZE / nw, VIEWPORT_SIZE / nh);
    setZoom(Math.max(1, minRatio));
    setPan({ x: 0, y: 0 });
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y,
      };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y,
    });
  }

  function handleTouchEnd() {
    setIsDragging(false);
  }

  async function handleCropSave() {
    if (!cropperImgRef.current || !imageMeta) {
      showToast("error", t("cropper.notReadyError"));
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(
          isEn
            ? "Failed to initialize Canvas context."
            : "Gagal menginisialisasi context Canvas.",
        );
      }

      const img = cropperImgRef.current;
      const scaleRatio = OUTPUT_SIZE / VIEWPORT_SIZE;

      const renderedW = img.offsetWidth;
      const renderedH = img.offsetHeight;

      const cx = VIEWPORT_SIZE / 2 + pan.x;
      const cy = VIEWPORT_SIZE / 2 + pan.y;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        img,
        (cx - renderedW / 2) * scaleRatio,
        (cy - renderedH / 2) * scaleRatio,
        renderedW * scaleRatio,
        renderedH * scaleRatio,
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) {
        throw new Error(
          isEn
            ? "Failed to generate image file."
            : "Gagal menghasilkan file foto.",
        );
      }

      const fileName = selectedFileName
        ? selectedFileName.replace(/\.[^/.]+$/, "") + ".jpg"
        : "avatar.jpg";

      const cropped = new File([blob], fileName, {
        type: "image/jpeg",
      });

      if (
        previewUrl &&
        previewUrl.startsWith("blob:") &&
        previewUrl !== rawImageSrc
      ) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreview = URL.createObjectURL(blob);

      setActiveFile(cropped);
      setPreviewUrl(newPreview);
      setIsCropperOpen(false);
      showToast("success", t("cropper.processSuccess"));
    } catch (error) {
      console.error("[AvatarCropper] Gagal memproses foto:", error);
      showToast(
        "error",
        error instanceof Error
          ? `${error.message}`
          : isEn
            ? "Failed to process photo."
            : "Gagal memproses foto.",
      );
    }
  }

  const isSmallResolution =
    imageMeta && (imageMeta.nw < MIN_DIMENSION || imageMeta.nh < MIN_DIMENSION);

  return (
    <>
      <form
        key={currentImage ?? "avatar"}
        action={(formData) => {
          if (activeFile) {
            formData.set("image", activeFile);
          }
          formData.set("locale", locale);
          return formAction(formData);
        }}
        className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-sm sm:p-6"
      >
        <input type="hidden" name="locale" value={locale} />

        {/* Header Avatar & Informasi */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar Circle */}
          <div
            title={t("account.changePhoto")}
            className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-line)] bg-[var(--color-surface-muted)] shadow-inner transition-all hover:border-[var(--color-ink)] focus-within:ring-2 focus-within:ring-[var(--color-accent-strong)]"
          >
            <input
              type="file"
              accept="image/*"
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
              onChange={handleFileSelect}
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            />

            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Preview foto profile"
                className="h-full w-full object-cover"
              />
            ) : currentImage ? (
              <Image
                src={`/api/profile-image?v=${encodeURIComponent(currentImage)}`}
                alt="Current avatar"
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                className="h-8 w-8 text-[var(--color-text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            )}

            {/* Hover Overlay Camera Indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              {t("profile.photoSectionTitle")}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
              {t("profile.photoSectionDesc")}
            </p>
          </div>
        </div>

        {/* Status File Baru Terpilih */}
        {activeFile && (
          <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-3 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-[var(--color-ink)]">
                {t("profile.photoReadyToSave")}:
              </span>
              <span className="truncate text-[var(--color-text-muted)]">
                {selectedFileName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCropperOpen(true)}
              className="font-medium text-[var(--color-accent-strong)] hover:underline ml-2 shrink-0 cursor-pointer"
            >
              {t("profile.adjustPosition")}
            </button>
          </div>
        )}

        {state.error && (
          <StatusMessage tone="error">{state.error}</StatusMessage>
        )}
        {state.success && (
          <StatusMessage tone="success">{state.success}</StatusMessage>
        )}

        {/* Tombol Aksi */}
        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]">
            <input
              type="file"
              accept="image/*"
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
              onChange={handleFileSelect}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            {currentImage || activeFile
              ? t("profile.changeOtherPhoto")
              : t("profile.choosePhoto")}
          </label>

          {activeFile && (
            <LoadingButton
              type="submit"
              loading={isPending}
              className="min-h-11 px-5 text-xs font-semibold shadow-xs"
            >
              {isPending
                ? t("profile.savingPhotoBtn")
                : t("profile.savePhotoBtn")}
            </LoadingButton>
          )}
        </div>
      </form>

      {/* Modal Cropper Bersih & Responsif */}
      {isCropperOpen && rawImageSrc && (
        <Modal
          open={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          title={t("cropper.modalTitle")}
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              {t("cropper.modalDesc")}
            </p>

            {/* Warning Resolusi Rendah */}
            {isSmallResolution && (
              <div className="rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                {t("cropper.lowResWarning", {
                  w: imageMeta?.nw || 0,
                  h: imageMeta?.nh || 0,
                })}
              </div>
            )}

            {/* Viewport Lingkaran Crop */}
            <div className="flex justify-center py-2">
              <div
                ref={cropperContainerRef}
                style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden rounded-full border-2 border-[var(--color-ink)] bg-neutral-900 shadow-xl cursor-grab active:cursor-grabbing select-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={cropperImgRef}
                  src={rawImageSrc}
                  alt="Crop preview"
                  onLoad={handleCropperImageLoad}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  className="pointer-events-none max-w-none select-none transition-transform duration-75 ease-out"
                />
              </div>
            </div>

            {/* Slider Kontrol Zoom */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>
                  {t("cropper.zoomLabel", { zoom: Math.round(zoom * 100) })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="font-medium text-[var(--color-accent-strong)] hover:underline cursor-pointer"
                >
                  {t("cropper.recenter")}
                </button>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                aria-label={t("cropper.zoomSliderAria")}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--color-line)] accent-[var(--color-ink)]"
              />
            </div>

            {/* Tombol Aksi Modal */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--color-line)]">
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-4 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
              >
                {t("cropper.cancelBtn")}
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="min-h-10 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--color-ink-soft)] cursor-pointer"
              >
                {t("cropper.applyBtn")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
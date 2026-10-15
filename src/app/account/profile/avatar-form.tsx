"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { Modal } from "@/components/ui/modal";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
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
      showToast("error", "Ukuran foto asli terlalu besar (maksimal 25 MB).");
      return;
    }

    // Android Compatibility: Validasi cerdas via MIME atau ekstensi nama berkas
    const isImageMime =
      !file.type ||
      file.type.startsWith("image/") ||
      file.type === "application/octet-stream";
    const isImageExt = /\.(jpe?g|png|webp|gif|heic|heif|jpg)$/i.test(file.name);

    if (!isImageMime && !isImageExt) {
      showToast("error", "Gunakan format foto JPG, PNG, atau WebP.");
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);

      setSelectedFileName(file.name || "Foto profil");
      setRawImageSrc(objectUrl);
      setPreviewUrl(objectUrl);
      setActiveFile(file);
      setImageMeta(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropperOpen(true);
    } catch (err) {
      console.error("[AvatarForm] Gagal memuat foto:", err);
      showToast("error", "Gagal memproses foto dari galeri HP.");
    }
  }

  function handleCropperImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImageMeta({
        nw: img.naturalWidth,
        nh: img.naturalHeight,
      });
    }
  }

  function getClampedPan(
    newX: number,
    newY: number,
    currentZoom: number,
  ): { x: number; y: number } {
    if (!imageMeta) return { x: 0, y: 0 };

    const containerW = cropperContainerRef.current?.clientWidth;
    const currentV = containerW && containerW > 0 ? containerW : VIEWPORT_SIZE;

    const baseScale = Math.max(
      currentV / imageMeta.nw,
      currentV / imageMeta.nh,
    );
    const renderedW = imageMeta.nw * baseScale * currentZoom;
    const renderedH = imageMeta.nh * baseScale * currentZoom;

    const maxPanX = Math.max(0, (renderedW - currentV) / 2);
    const maxPanY = Math.max(0, (renderedH - currentV) / 2);

    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, newX)),
      y: Math.min(maxPanY, Math.max(-maxPanY, newY)),
    };
  }

  // Pointer Events dengan Pointer Capture untuk Layar Sentuh Mobile
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (
      !isDragging ||
      !e.isPrimary ||
      !e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      return;
    }

    const nextPan = getClampedPan(
      e.clientX - dragStartRef.current.x,
      e.clientY - dragStartRef.current.y,
      zoom,
    );

    setPan(nextPan);
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    setIsDragging(false);
  }

  function handleZoomChange(newZoom: number) {
    setZoom(newZoom);
    setPan((currentPan) => getClampedPan(currentPan.x, currentPan.y, newZoom));
  }

  // Pemotongan Foto Asinkronus dengan Canvas Export 512x512
  async function handleApplyCrop() {
    const img = cropperImgRef.current;

    if (!img) {
      showToast("error", "Foto belum siap diproses.");
      return;
    }

    try {
      if (img.decode) {
        await img.decode();
      }

      const nw = img.naturalWidth || imageMeta?.nw || 0;
      const nh = img.naturalHeight || imageMeta?.nh || 0;

      if (nw === 0 || nh === 0) {
        throw new Error("Dimensi foto tidak terbaca.");
      }

      const containerW = cropperContainerRef.current?.clientWidth;
      const currentV =
        containerW && containerW > 0 ? containerW : VIEWPORT_SIZE;

      const baseScale = Math.max(currentV / nw, currentV / nh);
      const renderedW = nw * baseScale * zoom;
      const renderedH = nh * baseScale * zoom;

      const cx = currentV / 2 + pan.x;
      const cy = currentV / 2 + pan.y;
      const scaleRatio = OUTPUT_SIZE / currentV;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Gagal menginisialisasi context Canvas.");
      }

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
        throw new Error("Gagal menghasilkan file foto.");
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
      showToast("success", "Foto berhasil dipotong dan siap disimpan!");
    } catch (error) {
      console.error("[AvatarCropper] Gagal memproses foto:", error);
      showToast(
        "error",
        error instanceof Error
          ? `Gagal memproses foto: ${error.message}`
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
          return formAction(formData);
        }}
        className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-sm sm:p-6"
      >
        {/* Header Avatar & Informasi */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar Circle */}
          <div
            title="Klik untuk memilih foto"
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
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-9 w-9 text-[var(--color-text-muted)] group-hover:scale-105 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            )}

            {/* Hover / Tap Camera Overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 z-10">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <circle cx="12" cy="13.5" r="3" />
              </svg>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                Ubah
              </span>
            </div>
          </div>

          {/* Keterangan & Panduan Dimensi */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Foto profile
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)] leading-relaxed">
              Format JPG, PNG, atau WebP. Minimal lebar{" "}
              <span className="font-semibold text-[var(--color-ink)]">
                300 × 300 px
              </span>
              , maksimal 2 MB.
            </p>
            {activeFile && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-success-strong)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success-strong)]" />
                Foto siap disimpan
              </span>
            )}
          </div>
        </div>

        {/* Input Bar Kontrol */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white p-2">
            <div className="relative overflow-hidden rounded-[var(--radius-control)]">
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onClick={(e) => {
                  e.currentTarget.value = "";
                }}
                onChange={handleFileSelect}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
              />
              <span className="block min-h-11 border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-line)] active:scale-95 text-center flex items-center">
                {activeFile ? "Ganti foto lain" : "Pilih foto"}
              </span>
            </div>

            <span className="flex-1 truncate text-xs text-[var(--color-text-muted)]">
              {selectedFileName ? (
                <span className="font-medium text-[var(--color-ink)]">
                  {selectedFileName}
                </span>
              ) : (
                "Pilih foto dari perangkat Anda"
              )}
            </span>

            {rawImageSrc && (
              <button
                type="button"
                onClick={() => setIsCropperOpen(true)}
                className="text-xs font-medium text-[var(--color-accent-strong)] hover:underline focus:outline-none shrink-0"
              >
                Atur posisi
              </button>
            )}
          </div>
        </div>

        {state.error && (
          <StatusMessage tone="error">{state.error}</StatusMessage>
        )}

        {state.success && (
          <StatusMessage tone="success">{state.success}</StatusMessage>
        )}

        <LoadingButton type="submit" loading={isPending} disabled={!activeFile}>
          Simpan foto
        </LoadingButton>
      </form>

      {/* Modern Modal Image Cropper */}
      <Modal
        open={isCropperOpen}
        title="Sesuaikan Foto Profile"
        description="Geser dan atur perbesaran foto agar pas di dalam lingkaran profil."
        onClose={() => setIsCropperOpen(false)}
      >
        <div className="space-y-6">
          {isSmallResolution && (
            <div className="rounded-[var(--radius-control)] border border-[var(--color-warning-strong)]/30 bg-[var(--color-warning-soft)] p-3 text-xs text-[var(--color-warning-strong)]">
              ⚠️ Resolusi foto ({imageMeta.nw} × {imageMeta.nh} px) di bawah
              rekomendasi minimal 300 × 300 px. Foto mungkin terlihat buram saat
              disimpan.
            </div>
          )}

          {/* Area Kanvas Pemotong */}
          <div
            ref={cropperContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className="relative mx-auto h-[min(15rem,calc(100vw-2rem))] w-[min(15rem,calc(100vw-2rem))] touch-none overflow-hidden rounded-full border-4 border-[var(--color-ink)] bg-[#121312] shadow-2xl select-none sm:h-72 sm:w-72"
          >
            {rawImageSrc && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={cropperImgRef}
                src={rawImageSrc}
                alt="Sesuaikan foto"
                draggable={false}
                onLoad={handleCropperImageLoad}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-h-full min-w-full max-w-none object-cover select-none"
              />
            )}

            <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20" />
          </div>

          {/* Slider Zoom & Tombol Reset Posisi */}
          <div className="space-y-2 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--color-ink)]">
              <span>Perbesaran ({Math.round(zoom * 100)}%)</span>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="text-[var(--color-accent-strong)] hover:underline"
              >
                Pusatkan kembali
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                1×
              </span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                aria-label="Perbesaran foto profil"
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--color-line-strong)] accent-[var(--color-ink)]"
              />
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                3×
              </span>
            </div>
          </div>

          {/* Aksi Modal */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[var(--color-line)] pt-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsCropperOpen(false)}
              className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] sm:w-auto"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="min-h-12 w-full rounded-[var(--radius-control)] bg-[var(--color-ink)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm sm:w-auto"
            >
              Gunakan foto ini
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

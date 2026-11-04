"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto overscroll-contain bg-black/30 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-panel min-h-0 max-h-[100dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-card)] border border-[var(--color-line)] bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[var(--shadow-soft)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[var(--radius-card)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 sm:gap-5">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-[var(--color-ink)]"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="pressable focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        </div>

        <div className="mt-5 sm:mt-6">{children}</div>
      </section>
    </div>
  );
}

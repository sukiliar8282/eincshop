"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, type DeleteAccountState } from "./actions";
import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useI18n } from "@/lib/i18n/client";

const initialState: DeleteAccountState = {};

export function DeleteAccountCard() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [isOpen, setIsOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [state, formAction, isPending] = useActionState(
    deleteAccountAction,
    initialState,
  );

  const isConfirmed = confirmInput.trim() === "HAPUS AKUN";

  return (
    <>
      {/* KARTU ZONA BAHAYA */}
      <div className="rounded-[var(--radius-card)] border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                {isEn ? "Danger Zone" : "Zona Bahaya"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">
              {isEn ? "Delete Account Permanently" : "Hapus Akun Permanen"}
            </h3>
            <p className="max-w-xl text-xs leading-5 text-[var(--color-text-muted)]">
              {isEn
                ? "Once deleted, your account cannot be recovered. All order history, digital asset access, and profile information will be permanently purged."
                : "Setelah dihapus, akun tidak dapat dipulihkan kembali. Seluruh riwayat pesanan, akses unduhan produk digital, dan data profil Anda akan dimusnahkan secara permanen."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-red-300 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800 cursor-pointer"
          >
            {isEn ? "Delete My Account" : "Hapus Akun Saya"}
          </button>
        </div>
      </div>

      {/* MODAL KONFIRMASI KEAMANAN */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider text-red-600 uppercase">
                  {isEn ? "Final Confirmation" : "Konfirmasi Terakhir"}
                </span>
                <h4 className="mt-1 text-xl font-bold text-[var(--color-ink)]">
                  {isEn
                    ? "Are you absolutely sure?"
                    : "Apakah Anda benar-benar yakin?"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setConfirmInput("");
                }}
                disabled={isPending}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-ink)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 leading-5">
              {isEn
                ? "This action is permanent and irreversible. Your access to purchased digital assets and fulfillment downloads will be revoked immediately."
                : "Tindakan ini permanen dan tidak dapat dibatalkan. Seluruh hak akses aset digital yang telah Anda beli akan langsung hangus seketika."}
            </div>

            <form action={formAction} className="space-y-4">
              <div>
                <label
                  htmlFor="confirmation"
                  className="mb-2 block text-xs font-semibold text-[var(--color-ink)]"
                >
                  {isEn
                    ? "Type 'HAPUS AKUN' below to confirm:"
                    : "Ketik 'HAPUS AKUN' di bawah ini untuk konfirmasi:"}
                </label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type="text"
                  required
                  autoFocus
                  autoComplete="off"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="HAPUS AKUN"
                  className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 font-mono text-sm uppercase outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {state.error && (
                <StatusMessage tone="error">{state.error}</StatusMessage>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setConfirmInput("");
                  }}
                  disabled={isPending}
                  className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-4 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>

                <LoadingButton
                  type="submit"
                  loading={isPending}
                  disabled={!isConfirmed}
                  className="min-h-10 bg-red-600 hover:bg-red-700 text-xs font-semibold"
                >
                  {isEn ? "Delete Account" : "Hapus Akun Permanen"}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

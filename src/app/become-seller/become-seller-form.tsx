"use client";

import { useActionState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import {
  registerAsSellerAction,
  type SellerRegistrationState,
} from "@/modules/seller/actions";
import { useI18n } from "@/lib/i18n/client";

interface BecomeSellerFormProps {
  userEmail: string;
  defaultStoreName?: string;
}

const initialState: SellerRegistrationState = {};

export function BecomeSellerForm({
  userEmail,
  defaultStoreName = "",
}: BecomeSellerFormProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [state, formAction, isPending] = useActionState(
    registerAsSellerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <StatusMessage tone="error">{state.error}</StatusMessage>
      )}

      {/* Field 1: Email Akun (Read-only / Terkunci) */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]"
        >
          {isEn ? "Seller Account Email" : "Email Akun Penjual"}
        </label>
        <div className="mt-1.5 flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--color-text-muted)]">
          <span>{userEmail}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-success-strong)]">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            {isEn ? "Verified" : "Terverifikasi"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {isEn
            ? "Official account email designated for order receipts and store administrative notices."
            : "Email resmi untuk notifikasi order dan administrasi penjualan toko Anda."}
        </p>
      </div>

      {/* Field 2: Nama Toko / Brand Digital */}
      <div>
        <label
          htmlFor="storeName"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]"
        >
          {isEn ? "Store / Studio Name" : "Nama Toko / Studio Digital"}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="storeName"
          name="storeName"
          type="text"
          required
          minLength={3}
          maxLength={50}
          defaultValue={defaultStoreName}
          placeholder={
            isEn
              ? "e.g., Nexa Design Studio, DevCraft, etc."
              : "Contoh: Nexa Design Studio, DevCraft, dsb."
          }
          className="mt-1.5 block w-full min-h-11 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-ink)] focus:outline-none"
        />
        {state?.fieldErrors?.storeName && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {state.fieldErrors.storeName[0]}
          </p>
        )}
        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {isEn
            ? "This name will be displayed on your product cards and public marketplace seller profile."
            : "Nama ini akan muncul pada kartu produk dan profil penjual di katalog marketplace."}
        </p>
      </div>

      {/* Submit CTA Button (Touch target 44px) */}
      <div className="pt-3">
        <LoadingButton
          type="submit"
          loading={isPending}
          className="w-full font-semibold shadow-xs"
        >
          {isEn ? "Activate My Store" : "Aktifkan Toko Saya"}
        </LoadingButton>
      </div>
    </form>
  );
}

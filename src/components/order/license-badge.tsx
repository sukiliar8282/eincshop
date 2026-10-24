"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type LicenseBadgeProps = {
  version?: string | null;
  licenseType?: "commercial" | "personal";
};

export function LicenseBadge({
  version = "1.0.0",
  licenseType = "commercial",
}: LicenseBadgeProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [showDetails, setShowDetails] = useState(false);

  const isCommercial = licenseType === "commercial";

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Badge Lisensi Monokrom Presisi */}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-800 print:border-neutral-400 print:bg-transparent">
          <svg
            className="h-3 w-3 text-neutral-600 print:text-neutral-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>
            {isCommercial
              ? isEn
                ? "Commercial License"
                : "Lisensi Komersial"
              : isEn
                ? "Personal License"
                : "Lisensi Personal"}
          </span>
        </span>

        {/* Badge Versi Monospace */}
        {version && (
          <span className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-600 print:border-neutral-300">
            {version.startsWith("v") ? version : `v${version}`}
          </span>
        )}

        {/* Tombol Rincian Hak Lisensi (Otomatis Sembunyi Saat Cetak) */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="print:hidden text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:underline transition-colors"
        >
          {showDetails
            ? isEn
              ? "Hide terms"
              : "Sembunyikan"
            : isEn
              ? "View rights"
              : "Lihat hak lisensi"}
        </button>
      </div>

      {/* Ringkasan Ketentuan Lisensi Interaktif */}
      {showDetails && (
        <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50/80 p-3 text-[11px] leading-relaxed text-neutral-600 print:hidden animate-in fade-in duration-150">
          <p className="font-semibold text-neutral-900 mb-1">
            {isCommercial
              ? isEn
                ? "Standard Commercial Grant:"
                : "Hak Lisensi Komersial Standar:"
              : isEn
                ? "Personal Non-Commercial Grant:"
                : "Hak Lisensi Non-Komersial:"}
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-600" />
              <span>
                {isEn
                  ? "Permitted for unlimited commercial client & in-house projects."
                  : "Diizinkan untuk proyek klien komersial & proyek internal tanpa batas."}
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-600" />
              <span>
                {isEn
                  ? "Royalty-free perpetual usage rights worldwide."
                  : "Bebas royalti seumur hidup berlaku global."}
              </span>
            </li>
            <li className="flex items-center gap-1.5 text-rose-700">
              <span className="h-1 w-1 rounded-full bg-rose-600" />
              <span>
                {isEn
                  ? "Direct resale or public redistribution of raw source code is prohibited."
                  : "Dilarang menjual ulang atau mendistribusikan source code mentah ke publik."}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

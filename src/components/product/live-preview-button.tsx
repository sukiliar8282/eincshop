"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type LivePreviewButtonProps = {
  slug: string;
  title?: string;
  description?: string;
  customDemoUrl?: string | null;
};

export function LivePreviewButton({
  slug,
  title = "Landing Page Starter",
  description,
}: LivePreviewButtonProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [isOpen, setIsOpen] = useState(false);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "docs">("preview");

  const handlePurchaseClick = () => {
    setIsOpen(false);
    const target = document.getElementById("product-purchase-action");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      {/* Tombol Pemicu Pratinjau Minimalis */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex min-h-11 w-full items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-xs tracking-wide">
              {isEn ? "Interactive Live Preview" : "Pratinjau Demo Interaktif"}
            </span>
          </div>

          <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-ink)]">
            {isEn ? "Open Preview ↗" : "Buka Demo ↗"}
          </span>
        </button>
      </div>

      {/* Modal Pratinjau Bespoke Human-Crafted */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
            {/* Header Toolbar Simulasi Browser */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-neutral-300">
              {/* Traffic dots ala macOS */}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>

              {/* Baris Alamat URL Bersih */}
              <div className="hidden sm:flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1 text-xs text-neutral-400 border border-neutral-800 font-mono">
                <svg
                  className="h-3 w-3 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>demo.eincshop.com/{slug}</span>
              </div>

              {/* Kontrol Device Switcher & Tombol Tutup */}
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg bg-neutral-800 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeviceView("desktop")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      deviceView === "desktop"
                        ? "bg-white text-neutral-900 font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceView("mobile")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      deviceView === "mobile"
                        ? "bg-white text-neutral-900 font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                  title={isEn ? "Close preview" : "Tutup pratinjau"}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sub-nav Tab Switcher: Preview vs Documentation */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === "preview"
                      ? "bg-neutral-800 text-white font-semibold"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {isEn ? "Live Canvas" : "Kanvas Pratinjau"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("docs")}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === "docs"
                      ? "bg-neutral-800 text-white font-semibold"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {isEn ? "Architecture & Setup" : "Arsitektur & Setup"}
                </button>
              </div>

              <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
                {isEn ? "Clean Code Architecture" : "Arsitektur Kode Bersih"}
              </span>
            </div>

            {/* Kanvas Demo Interaktif (Scrollable & Responsive) */}
            <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 flex justify-center items-start">
              <div
                className={`transition-all duration-300 bg-white text-neutral-900 overflow-hidden shadow-xl rounded-lg ${
                  deviceView === "desktop"
                    ? "w-full min-h-full"
                    : "w-[390px] min-h-[700px] border-4 border-neutral-800 rounded-3xl"
                }`}
              >
                {activeTab === "preview" ? (
                  <>
                    {/* Hero Section Template */}
                    <div className="border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white px-6 py-12 text-center sm:px-12 sm:py-16">
                      <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 tracking-wide">
                        Next.js 16 • Tailwind CSS v4 • TypeScript
                      </span>
                      <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                        {title}
                      </h2>
                      <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-600">
                        {description ||
                          (isEn
                            ? "A production-grade template engineered with modular components and clean code architecture."
                            : "Template modern dengan arsitektur kode bersih, modular, dan siap digunakan untuk kebutuhan proyek komersial Anda.")}
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={handlePurchaseClick}
                          className="rounded-md bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-95"
                        >
                          {isEn
                            ? "Purchase This Template"
                            : "Beli Template Ini"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("docs")}
                          className="rounded-md border border-neutral-300 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-95"
                        >
                          {isEn
                            ? "Component Documentation"
                            : "Dokumentasi Komponen"}
                        </button>
                      </div>
                    </div>

                    {/* Grid Fitur Bersih (Vektor SVG Monokrom - Bebas Emotikon) */}
                    <div className="p-6 sm:p-10">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        {isEn
                          ? "Core Architecture Highlights"
                          : "Fitur Unggulan Template"}
                      </h3>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Kartu 1: Performance */}
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-neutral-200 text-neutral-900">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <p className="mt-3 font-semibold text-xs text-neutral-900">
                            {isEn
                              ? "Peak Runtime Performance"
                              : "Kecepatan Maksimal"}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
                            {isEn
                              ? "Lighthouse 100/100 performance powered by Next.js Server Components."
                              : "Skor Lighthouse 100/100 dengan performa Server Components."}
                          </p>
                        </div>

                        {/* Kartu 2: Layout */}
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-neutral-200 text-neutral-900">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="mt-3 font-semibold text-xs text-neutral-900">
                            {isEn ? "Adaptive Layouts" : "Desain Responsif"}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
                            {isEn
                              ? "Proportional layouts tested on iOS, Android, laptops, and ultra-wide displays."
                              : "Tampilan proporsional di smartphone, tablet, laptop, hingga layar ultrawide."}
                          </p>
                        </div>

                        {/* Kartu 3: TypeScript */}
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-neutral-200 text-neutral-900">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                          </div>
                          <p className="mt-3 font-semibold text-xs text-neutral-900">
                            {isEn
                              ? "Type-Safe Architecture"
                              : "Kode TypeScript Aman"}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
                            {isEn
                              ? "Zero runtime type mismatches with Zod schema contracts and clean modular design."
                              : "Validasi skema Zod ketat tanpa runtime error dengan modul terisolasi rapi."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Tab Dokumentasi & Setup Nyata */
                  <div className="p-6 sm:p-10">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-neutral-950">
                          {isEn
                            ? "Developer Quickstart Guide"
                            : "Panduan Mulai Cepat Pengembang"}
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          {isEn
                            ? "Everything you need to launch this codebase locally in 2 minutes."
                            : "Langkah mudah menjalankan codebase ini di komputer lokal Anda."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handlePurchaseClick}
                        className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
                      >
                        {isEn
                          ? "Get License & Source"
                          : "Dapatkan Lisensi & Source"}
                      </button>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                          1.{" "}
                          {isEn
                            ? "Installation & Local Run"
                            : "Instalasi & Menjalankan Server"}
                        </p>
                        <div className="rounded-lg bg-neutral-900 p-4 font-mono text-xs text-emerald-400">
                          <p className="text-neutral-500">
                            # Clone & install dependencies
                          </p>
                          <p className="text-white mt-1">npm install</p>
                          <p className="text-neutral-500 mt-3">
                            # Start development server
                          </p>
                          <p className="text-emerald-300 mt-1">npm run dev</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                          2.{" "}
                          {isEn
                            ? "Included Artifacts"
                            : "Berkas yang Disertakan"}
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {isEn
                              ? "Full Source Code (.zip)"
                              : "Source Code Lengkap (.zip)"}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {isEn
                              ? "TypeScript & Tailwind Configuration"
                              : "Konfigurasi TypeScript & Tailwind"}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {isEn
                              ? "Commercial Use License"
                              : "Lisensi Penggunaan Komersial"}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {isEn
                              ? "Lifetime Access & Updates"
                              : "Akses Unduhan Seumur Hidup"}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

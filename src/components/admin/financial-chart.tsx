"use client";

import { useState } from "react";
import type {
  FinancialAnalytics,
  CashflowPoint,
} from "@/lib/admin/financial-analytics";
import { formatIdr } from "@/lib/format/currency";

type PeriodFilter = "daily" | "weekly" | "yearly";

interface FinancialChartProps {
  analytics: FinancialAnalytics;
}

export function FinancialChart({ analytics }: FinancialChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("daily");
  const currentSummary = analytics[selectedPeriod];

  // Point yang sedang dipilih/diklik untuk inspeksi detail
  const [activePointId, setActivePointId] = useState<string | null>(null);

  const activePoint =
    currentSummary.points.find((p) => p.id === activePointId) ??
    currentSummary.points[currentSummary.points.length - 1];

  const highestRevenue = Math.max(
    ...currentSummary.points.map((p) => p.revenueMinor),
    100000,
  );

  return (
    <section
      aria-label="Grafik Arus Kas dan Histori Keuangan"
      className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* HEADER & FILTER PERIODE */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-accent-strong)]" />
            <h2 className="text-base font-bold text-[var(--color-ink)] sm:text-lg">
              Arus Kas & Performa Keuangan Toko
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Perbandingan omzet masuk terhadap potongan biaya otomatis platform (
            {analytics.feeRatePercentage}%).
          </p>
        </div>

        {/* Tab Switcher: Harian / Mingguan / Tahunan (Touch Target 44px) */}
        <div className="inline-flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-1">
          <button
            type="button"
            onClick={() => {
              setSelectedPeriod("daily");
              setActivePointId(null);
            }}
            className={`min-h-11 px-3.5 text-xs font-semibold rounded-[var(--radius-control)] transition-all sm:min-h-9 ${
              selectedPeriod === "daily"
                ? "bg-white text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Harian (7 Hari)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPeriod("weekly");
              setActivePointId(null);
            }}
            className={`min-h-11 px-3.5 text-xs font-semibold rounded-[var(--radius-control)] transition-all sm:min-h-9 ${
              selectedPeriod === "weekly"
                ? "bg-white text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Mingguan (8 Mgg)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPeriod("yearly");
              setActivePointId(null);
            }}
            className={`min-h-11 px-3.5 text-xs font-semibold rounded-[var(--radius-control)] transition-all sm:min-h-9 ${
              selectedPeriod === "yearly"
                ? "bg-white text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Tahunan (12 Bln)
          </button>
        </div>
      </div>

      {/* STATISTIK RINGKASAN PERIODE INI */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Pemasukan (Kotor)
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-[var(--color-ink)]">
            {formatIdr(currentSummary.totalRevenue)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {currentSummary.totalOrders} item pesanan lunas
          </p>
        </div>

        <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Pengeluaran (Biaya Gateway)
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-rose-600">
            -{formatIdr(currentSummary.totalExpense)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            Biaya transaksi terhitung otomatis ({analytics.feeRatePercentage}%)
          </p>
        </div>

        <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Estimasi Laba Bersih
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {currentSummary.netMarginPct}% Net
            </span>
          </div>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-emerald-700">
            {formatIdr(currentSummary.totalNet)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            Pendapatan riil bersih toko Anda
          </p>
        </div>
      </div>

      {/* INTERACTIVE VISUAL CHART CANVAS */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-3">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Visualisasi Grafik (
            {selectedPeriod === "daily"
              ? "7 Hari"
              : selectedPeriod === "weekly"
                ? "8 Minggu"
                : "12 Bulan"}
            )
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />{" "}
              Pemasukan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-400" /> Biaya
              Potongan
            </span>
          </div>
        </div>

        {/* Scroll container untuk memastikan kenyamanan pada Android */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[480px]">
            <div className="flex h-56 items-end gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
              {currentSummary.points.map((pt) => {
                const revenueHeightPct = Math.min(
                  100,
                  Math.max(
                    6,
                    Math.round((pt.revenueMinor / highestRevenue) * 100),
                  ),
                );
                const expenseHeightPct = Math.min(
                  revenueHeightPct,
                  Math.max(
                    4,
                    Math.round((pt.expenseMinor / highestRevenue) * 100),
                  ),
                );
                const isSelected = activePoint?.id === pt.id;

                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setActivePointId(pt.id)}
                    className={`group relative flex flex-1 flex-col items-center justify-end h-full rounded-[var(--radius-control)] p-1 transition-all focus:outline-hidden ${
                      isSelected
                        ? "bg-white ring-2 ring-[var(--color-ink)] shadow-sm"
                        : "hover:bg-white/60"
                    }`}
                  >
                    {/* Batang Kolom Nilai */}
                    <div className="relative w-full max-w-[32px] flex items-end justify-center h-full">
                      {/* Bar Pemasukan (Emerald) */}
                      <div
                        style={{
                          height: `${pt.revenueMinor === 0 ? 4 : revenueHeightPct}%`,
                        }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          pt.revenueMinor === 0
                            ? "bg-gray-200"
                            : isSelected
                              ? "bg-emerald-600"
                              : "bg-emerald-500 group-hover:bg-emerald-600"
                        }`}
                      >
                        {/* Bar Pengeluaran (Rose/Merah) di bagian bawah */}
                        {pt.expenseMinor > 0 && (
                          <div
                            style={{
                              height: `${Math.max(15, (expenseHeightPct / revenueHeightPct) * 100)}%`,
                            }}
                            className="w-full bg-rose-400/90 rounded-b-sm border-t border-rose-500/30"
                          />
                        )}
                      </div>
                    </div>

                    {/* Label Sumbu X */}
                    <div className="mt-2 text-center">
                      <p
                        className={`text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? "text-[var(--color-ink)] font-bold"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {pt.title}
                      </p>
                      <p className="text-[9px] text-[var(--color-text-muted)] hidden sm:block">
                        {pt.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTIVE POINT INSPECTION CARD */}
        {activePoint && (
          <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--color-accent-strong)] uppercase tracking-wider">
                  Inspeksi Detail Titik Terpilih
                </span>
                <h3 className="text-base font-bold text-[var(--color-ink)]">
                  {activePoint.title} ({activePoint.subtitle})
                </h3>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                Volume:{" "}
                <span className="font-semibold text-[var(--color-ink)]">
                  {activePoint.count} item pesanan
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[var(--color-line)] pt-3 text-xs sm:grid-cols-3">
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Pemasukan Kotor:
                </span>
                <p className="font-bold text-emerald-600 text-sm">
                  {formatIdr(activePoint.revenueMinor)}
                </p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Potongan Fee ({analytics.feeRatePercentage}%):
                </span>
                <p className="font-bold text-rose-600 text-sm">
                  -{formatIdr(activePoint.expenseMinor)}
                </p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Laba Bersih:
                </span>
                <p className="font-bold text-[var(--color-ink)] text-sm">
                  {formatIdr(activePoint.netMinor)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABEL RINCIAN HISTORI BUKU KAS (AUDITABLE LEDGER) */}
      <div className="mt-6 border-t border-[var(--color-line)] pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-3">
          Histori Log Transaksi Periode Terpilih
        </h3>

        <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[var(--color-line)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--color-line)]">
              <tr>
                <th className="px-3.5 py-3">Periode</th>
                <th className="px-3.5 py-3">Pesanan</th>
                <th className="px-3.5 py-3">Pemasukan</th>
                <th className="px-3.5 py-3">Potongan Fee (3%)</th>
                <th className="px-3.5 py-3 text-right">Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)] bg-white">
              {currentSummary.points.map((pt, index) => (
                <tr
                  key={pt.id}
                  className={`transition-colors hover:bg-[var(--color-canvas)] ${
                    activePoint?.id === pt.id
                      ? "bg-[var(--color-accent-soft)]/20"
                      : index % 2 === 1
                        ? "bg-gray-50/50"
                        : ""
                  }`}
                >
                  <td className="px-3.5 py-2.5 font-medium text-[var(--color-ink)] whitespace-nowrap">
                    {pt.title}{" "}
                    <span className="text-[11px] text-[var(--color-text-muted)] font-normal">
                      ({pt.subtitle})
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-[var(--color-text-muted)] whitespace-nowrap">
                    {pt.count} item
                  </td>
                  <td className="px-3.5 py-2.5 font-semibold text-emerald-600 whitespace-nowrap">
                    {formatIdr(pt.revenueMinor)}
                  </td>
                  <td className="px-3.5 py-2.5 font-semibold text-rose-500 whitespace-nowrap">
                    {pt.expenseMinor > 0
                      ? `-${formatIdr(pt.expenseMinor)}`
                      : "Rp 0"}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-[var(--color-ink)] whitespace-nowrap">
                    {formatIdr(pt.netMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

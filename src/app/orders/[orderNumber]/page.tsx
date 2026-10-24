import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCurrentUserOrGuest } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { OrderStatus } from "@/components/order/order-status";
import { PayOrderButton } from "@/components/payment/pay-order-button";
import { PrintInvoiceButton } from "@/components/order/print-invoice-button";
import { LicenseBadge } from "@/components/order/license-badge";
import { getDictionary } from "@/lib/i18n/server";

type OrderPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export const metadata: Metadata = {
  title: "Order Invoice",
};

export default async function OrderPage({ params }: OrderPageProps) {
  const [user, { locale }] = await Promise.all([
    getCurrentUserOrGuest(),
    getDictionary(),
  ]);
  const { orderNumber } = await params;
  const isEn = locale === "en";

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          downloadGrants: {
            where: {
              status: "ACTIVE",
            },
            include: {
              digitalAsset: {
                select: {
                  fileName: true,
                  version: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="py-12 sm:py-20 print:py-0 print:m-0">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Header Faktur & Tombol Cetak Nota */}
          <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-center sm:justify-between print:border-neutral-900 print:pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)] print:text-neutral-600">
                {isEn ? "Official Tax Invoice" : "Faktur Resmi Pembelian"}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl font-mono">
                {order.orderNumber}
              </h1>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] print:text-neutral-500">
                {isEn ? "Issued on" : "Diterbitkan pada"}{" "}
                {order.createdAt.toLocaleString(isEn ? "en-US" : "id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* Tombol Cetak / Simpan PDF (Otomatis Sembunyi Saat di Lembar Cetak) */}
            <PrintInvoiceButton />
          </div>

          {/* Kartu Nota Utama */}
          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-xs print:rounded-none print:border-0 print:p-0 print:shadow-none">
            {/* Informasi Entitas Penjual & Pembeli (B2B Standard) */}
            <div className="grid grid-cols-1 gap-6 border-b border-[var(--color-line)] pb-6 sm:grid-cols-2 print:border-neutral-200">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {isEn ? "Merchant / Distributor" : "Penerbit / Penjual"}
                </span>
                <p className="mt-1 font-bold text-sm text-[var(--color-ink)]">
                  EINCSHOP DIGITAL MARKETPLACE
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Verified Digital Asset Distribution
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {isEn ? "Billed To" : "Ditagihkan Kepada"}
                </span>
                <p className="mt-1 font-semibold text-sm text-[var(--color-ink)]">
                  {order.user?.name ||
                    (isEn ? "Verified Customer" : "Pelanggan Terverifikasi")}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {order.user?.email ||
                    (isEn ? "Instant Checkout Customer" : "Pembeli Instan")}
                </p>
              </div>
            </div>

            {/* Status Pesanan & Pembayaran */}
            <dl className="mt-6 grid grid-cols-2 gap-4 border-b border-[var(--color-line)] pb-6 print:border-neutral-200">
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">
                  {isEn ? "Order Status" : "Status Pesanan"}
                </dt>
                <dd className="mt-1.5">
                  <OrderStatus status={order.status} locale={locale} />
                </dd>
              </div>

              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">
                  {isEn ? "Payment Verification" : "Verifikasi Pembayaran"}
                </dt>
                <dd className="mt-1.5">
                  <OrderStatus status={order.paymentStatus} locale={locale} />
                </dd>
              </div>
            </dl>

            {/* Tabel Item Pembelian dengan Badge Lisensi & Versi */}
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                {isEn ? "Purchased Digital Assets" : "Item Digital yang Dibeli"}
              </h2>

              <div className="divide-y divide-[var(--color-line)] print:divide-neutral-200">
                {order.items.map((item) => {
                  const assetVersion =
                    item.downloadGrants[0]?.digitalAsset?.version || "1.0.0";

                  return (
                    <div key={item.id} className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-sm text-[var(--color-ink)]">
                            {item.productTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                            {isEn ? "Quantity" : "Jumlah"}: {item.quantity}
                          </p>

                          {/* Badge Lisensi Komersial & Versi Kode */}
                          <LicenseBadge
                            version={assetVersion}
                            licenseType="commercial"
                          />
                        </div>

                        <p className="font-semibold text-sm text-[var(--color-ink)]">
                          {formatIdr(item.lineTotalMinor, locale)}
                        </p>
                      </div>

                      {/* Tombol Unduh Berkas (Hanya Tampil di Layar Web, Otomatis Sembunyi Saat Cetak PDF) */}
                      {order.paymentStatus === "PAID" &&
                        item.downloadGrants.length > 0 && (
                          <div className="mt-3.5 space-y-1.5 print:hidden">
                            {item.downloadGrants.map((grant) => (
                              <a
                                key={grant.id}
                                href={`/api/downloads/${grant.id}`}
                                className="inline-flex min-h-9 items-center rounded-[var(--radius-control)] bg-[var(--color-ink)] px-3 text-xs font-semibold text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-95 shadow-xs"
                              >
                                {isEn
                                  ? "Download Source File"
                                  : "Unduh File Source"}{" "}
                                ({grant.digitalAsset.fileName})
                              </a>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rincian Subtotal & Total Pembayaran */}
            <div className="mt-6 border-t border-[var(--color-line)] pt-4 space-y-2 print:border-neutral-200">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>{isEn ? "Subtotal" : "Subtotal"}</span>
                <span>{formatIdr(order.subtotalMinor, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>
                  {isEn
                    ? "Electronic Delivery Fee"
                    : "Biaya Pengiriman Digital"}
                </span>
                <span className="font-medium text-emerald-700">
                  {isEn ? "FREE (Instant)" : "GRATIS (Instan)"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-3 text-base font-bold text-[var(--color-ink)] print:border-neutral-900">
                <span>{isEn ? "Total Paid Amount" : "Total Lunas"}</span>
                <span>{formatIdr(order.totalMinor, locale)}</span>
              </div>
            </div>

            {/* Tombol Pembayaran Jika Belum Lunas */}
            {order.paymentStatus !== "PAID" && (
              <div className="mt-6 border-t border-[var(--color-line)] pt-6 print:hidden">
                <PayOrderButton orderNumber={order.orderNumber} />
              </div>
            )}

            {/* Stempel & Pernyataan Resmi Faktur Komputer */}
            <div className="mt-8 border-t border-dashed border-[var(--color-line)] pt-5 text-[11px] leading-relaxed text-[var(--color-text-muted)] print:border-neutral-300">
              <p>
                {isEn
                  ? "This invoice is an official electronic receipt generated by Eincshop Marketplace. Valid without a physical stamp or signature under applicable electronic commerce regulations."
                  : "Faktur ini merupakan bukti pembayaran resmi yang diterbitkan secara elektronik oleh Eincshop Marketplace. Sah tanpa tanda tangan basah sesuai regulasi transaksi elektronik."}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

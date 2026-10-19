import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";

function formatRupiah(amountMinor: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amountMinor);
}

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      productType: "DIGITAL",
    },
    select: {
      title: true,
      slug: true,
      description: true,
      priceMinor: true,
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
        select: {
          url: true,
          altText: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
  });

  const spotlightProduct = featuredProducts[0];

  return (
    <>
      <section className="border-b border-[var(--color-line)] bg-[var(--color-canvas)]">
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="pt-2 lg:pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
                EINCSHOP / DIGITAL GOODS
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
                Temukan aset digital yang langsung bisa dipakai.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-text-muted)]">
                Template, sistem desain, dan modul kode praktis untuk membantu
                pekerjaan kreatif berjalan lebih cepat dan terarah.
              </p>

              <form
                action="/products"
                method="GET"
                className="mt-8 flex max-w-lg flex-col gap-2 sm:flex-row"
              >
                <label className="sr-only" htmlFor="homepage-search">
                  Cari produk
                </label>

                <input
                  id="homepage-search"
                  type="search"
                  name="q"
                  placeholder="Cari template, UI kit, atau kode..."
                  className="min-h-11 flex-1 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-ink)] focus:outline-none"
                />

                <Button type="submit" size="md">
                  Cari produk
                </Button>
              </form>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className="rounded-full border border-[var(--color-line-strong)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-transform duration-150 hover:border-[var(--color-ink)] active:scale-95"
                >
                  Semua produk
                </Link>

                <Link
                  href="/products?category=templates"
                  className="rounded-full border border-[var(--color-line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] active:scale-95"
                >
                  Template
                </Link>

                <Link
                  href="/products?category=ui-kit"
                  className="rounded-full border border-[var(--color-line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] active:scale-95"
                >
                  UI kit
                </Link>

                <Link
                  href="/products?category=code"
                  className="rounded-full border border-[var(--color-line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] active:scale-95"
                >
                  Kode
                </Link>
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                    Pilihan terbaru
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Dipilih dari katalog minggu ini
                  </p>
                </div>

                <span className="text-xs text-[var(--color-text-muted)]">
                  01
                </span>
              </div>

              {spotlightProduct ? (
                <div className="pt-5">
                  {spotlightProduct.images[0]?.url ? (
                    /* FIX: Menggunakan aspect-[4/3] dan object-top agar judul foto tidak terpotong */
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-image)] bg-[var(--color-surface-muted)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spotlightProduct.images[0].url}
                        alt={
                          spotlightProduct.images[0].altText ??
                          spotlightProduct.title
                        }
                        className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-end rounded-[var(--radius-image)] bg-[var(--color-surface-muted)] p-5">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                        Preview produk
                      </span>
                    </div>
                  )}

                  <div className="mt-5">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {spotlightProduct.category?.name ?? "Produk digital"}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                      {spotlightProduct.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
                      {spotlightProduct.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-4">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Mulai dari
                        </p>

                        <p className="mt-1 font-semibold text-[var(--color-ink)]">
                          {formatRupiah(spotlightProduct.priceMinor)}
                        </p>
                      </div>

                      <ButtonLink
                        href={`/products/${spotlightProduct.slug}`}
                        size="sm"
                        className="text-white! hover:text-white"
                      >
                        Lihat produk
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
                  Produk akan tampil setelah diterbitkan.
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--color-line)] bg-white">
        <Container className="grid gap-6 py-7 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Siap digunakan
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              File dan template dibuat untuk langsung masuk ke alur kerja Anda.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Pembelian sederhana
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Pilih produk, selesaikan pembayaran, lalu akses file Anda.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Koleksi terkurasi
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Fokus pada produk yang berguna, bukan sekadar memenuhi katalog.
            </p>
          </div>
        </Container>
      </section>

      <section id="featured" className="py-14 sm:py-20">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Katalog pilihan
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl">
                Produk terbaru
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
                Jelajahi aset digital yang dibuat untuk mempercepat pekerjaan
                tanpa menambah kerumitan.
              </p>
            </div>

            <Link
              href="/products"
              className="text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
            >
              Lihat seluruh katalog →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={{
                    ...product,
                    image: product.images[0] ?? null,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] p-10 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Produk akan tampil di sini setelah diterbitkan.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

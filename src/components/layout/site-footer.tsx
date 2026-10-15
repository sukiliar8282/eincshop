import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink)]"
          >
            {siteConfig.name}
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Navigasi
          </p>

          <nav className="mt-4 grid gap-3 text-sm text-[var(--color-text-muted)]">
            <Link
              href="/"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              Katalog
            </Link>

            <Link
              href="/cart"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              Keranjang
            </Link>

            <Link
              href="/login"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              Masuk
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Hubungi kami
          </p>

          <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-muted)]">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {siteConfig.contact.email}
            </a>

            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {siteConfig.contact.phone}
            </a>

            <span className="text-xs leading-5 text-[var(--color-text-muted)]">
              {siteConfig.contact.label}
            </span>
          </div>
        </div>
      </Container>

      <div className="border-t border-[var(--color-line)]">
        <Container className="flex flex-col gap-2 py-4 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>

          <span>Produk digital untuk pekerjaan yang lebih baik.</span>
        </Container>
      </div>
    </footer>
  );
}

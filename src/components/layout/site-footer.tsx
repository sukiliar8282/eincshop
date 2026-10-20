import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/server";

export async function SiteFooter() {
  const { dict } = await getDictionary();

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
            {dict.footer.description}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {dict.footer.navTitle}
          </p>

          <nav className="mt-4 grid gap-3 text-sm text-[var(--color-text-muted)]">
            <Link
              href="/"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {dict.common.home}
            </Link>

            <Link
              href="/products"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {dict.common.catalog}
            </Link>

            <Link
              href="/cart"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {dict.common.cart}
            </Link>

            <Link
              href="/login"
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {dict.common.login}
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {dict.footer.contactTitle}
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
              {dict.footer.contactLabel}
            </span>
          </div>
        </div>
      </Container>

      <div className="border-t border-[var(--color-line)]">
        <Container className="flex flex-col gap-2 py-4 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}.{" "}
            {dict.footer.copyright}
          </span>

          <span>{dict.footer.tagline}</span>
        </Container>
      </div>
    </footer>
  );
}

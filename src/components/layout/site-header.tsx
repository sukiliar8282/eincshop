import Link from "next/link";

import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/config/site";

export async function SiteHeader() {
  const [session, { dict }] = await Promise.all([auth(), getDictionary()]);

  // Query user dan item keranjang yang valid secara paralel
  const [currentUser, activeCartItems] = session?.user?.id
    ? await Promise.all([
        prisma.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            name: true,
            email: true,
            image: true,
            role: true,
          },
        }),

        prisma.cartItem.findMany({
          where: {
            cart: {
              userId: session.user.id,
              status: "ACTIVE",
            },
            product: {
              status: "PUBLISHED",
              productType: "DIGITAL",
            },
          },
          select: {
            quantity: true,
          },
        }),
      ])
    : [null, []];

  // Hitung total kuantitas barang yang valid
  const cartCount =
    activeCartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="relative z-50 border-b border-[var(--color-line)] bg-white">
      <Container className="flex min-h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink)]"
        >
          {siteConfig.name}
        </Link>

        {/* Navigasi Desktop */}
        <nav
          aria-label={dict.nav.mainNav}
          className="hidden items-center gap-5 text-sm text-[var(--color-text-muted)] md:flex"
        >
          <NavLink
            href="/products"
            className="transition-[color,transform] hover:text-[var(--color-ink)] active:scale-95"
          >
            {dict.common.catalog}
          </NavLink>

          {/* Link Keranjang Desktop dengan Badge Indikator */}
          <NavLink
            href="/cart"
            className="relative transition-[color,transform] hover:text-[var(--color-ink)] active:scale-95"
          >
            {dict.common.cart}
            {cartCount > 0 && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </NavLink>

          {/* Sakelar Bahasa Minimalist Pill di Desktop */}
          <LanguageToggle variant="pill" />

          {/* Ikon Tautan GitHub Desktop (Ganti href sesuai URL repositori Anda) */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] active:scale-95"
          >
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {currentUser ? (
            <AccountMenu
              name={currentUser.name}
              email={currentUser.email}
              role={currentUser.role}
              image={currentUser.image}
              dict={dict}
            />
          ) : (
            <ButtonLink href="/login" size="sm" className="!text-white">
              {dict.common.login}
            </ButtonLink>
          )}
        </nav>

        {/* Navigasi Mobile (Ikon GitHub & Hamburger Menu) */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Ikon Tautan GitHub Mobile */}
          <a
            href="https://github.com/sukiliar8282/eincshop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
          >
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          <MobileNav
            user={
              currentUser
                ? {
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role,
                    image: currentUser.image,
                  }
                : null
            }
            cartCount={cartCount}
            dict={dict}
          />
        </div>
      </Container>
    </header>
  );
}
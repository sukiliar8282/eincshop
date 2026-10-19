import Link from "next/link";

import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";

export async function SiteHeader() {
  const session = await auth();

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
          aria-label="Navigasi utama"
          className="hidden items-center gap-5 text-sm text-[var(--color-text-muted)] md:flex"
        >
          <NavLink
            href="/products"
            className="transition-[color,transform] hover:text-[var(--color-ink)] active:scale-95"
          >
            Katalog
          </NavLink>

          {/* Link Keranjang Desktop dengan Badge Indikator */}
          <NavLink
            href="/cart"
            className="relative transition-[color,transform] hover:text-[var(--color-ink)] active:scale-95"
          >
            Keranjang
            {cartCount > 0 && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </NavLink>

          {currentUser ? (
            <AccountMenu
              name={currentUser.name}
              email={currentUser.email}
              role={currentUser.role}
              image={currentUser.image}
            />
          ) : (
            <ButtonLink href="/login" size="sm" className="!text-white">
              Masuk
            </ButtonLink>
          )}
        </nav>

        {/* Navigasi Mobile (Meneruskan data user dan cartCount) */}
        <div className="md:hidden">
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
          />
        </div>
      </Container>
    </header>
  );
}

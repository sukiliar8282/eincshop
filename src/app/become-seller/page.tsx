import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { BecomeSellerForm } from "./become-seller-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Buka Toko Digital | Eincshop",
  description: "Mulai perjalanan Anda sebagai seller aset digital di Eincshop.",
};

export default async function BecomeSellerPage() {
  const [sessionUser, { locale }] = await Promise.all([
    requireUser(),
    getDictionary(),
  ]);

  const isEn = locale === "en";

  // Ambil data user terkini dari database
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      email: true,
      name: true,
      storeName: true,
      role: true,
    },
  });

  // Jika sudah berstatus SELLER atau ADMIN, langsung arahkan ke Dashboard Toko
  if (dbUser?.role === "SELLER" || dbUser?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-10 sm:py-16 safe-bottom">
      <Container>
        <div className="mx-auto max-w-xl">
          {/* Header Info Onboarding */}
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {isEn ? "Open Your Digital Store" : "Buka Toko Digital Anda"}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {isEn
                ? "Start publishing your handcrafted templates, UI kits, and code modules to thousands of prospective buyers."
                : "Mulai publikasikan template, UI kit, dan modul kode Anda ke ribuan pembeli potensial."}
            </p>
          </div>

          {/* Form Card Onboarding */}
          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-xs sm:p-8">
            <BecomeSellerForm
              userEmail={dbUser?.email || sessionUser.email || ""}
              defaultStoreName={dbUser?.storeName || dbUser?.name || ""}
            />

            {/* Keuntungan Menjadi Seller */}
            <div className="mt-8 border-t border-[var(--color-line)] pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                {isEn
                  ? "Benefits of Selling on Eincshop"
                  : "Keuntungan Menjadi Seller di Eincshop"}
              </h2>
              <ul className="space-y-2 text-xs text-[var(--color-ink)]">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <strong>
                    {isEn
                      ? "Automated Payment Processing:"
                      : "Penerimaan Pembayaran Otomatis:"}
                  </strong>{" "}
                  {isEn
                    ? "Direct settlement via instant payment gateway."
                    : "Integrasi gateway lunas seketika."}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <strong>
                    {isEn
                      ? "Instant Digital Delivery:"
                      : "Pengiriman File Instan:"}
                  </strong>{" "}
                  {isEn
                    ? "Files unlocked immediately upon payment verification."
                    : "Berkas digital langsung terkirim ke pembeli."}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <strong>
                    {isEn
                      ? "Isolated Seller Dashboard:"
                      : "Dashboard Terisolasi:"}
                  </strong>{" "}
                  {isEn
                    ? "Real-time metrics, cashflow analytics, and order management."
                    : "Pantau omzet, pesanan, dan arus kas toko Anda."}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

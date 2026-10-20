import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipLink } from "@/components/layout/skip-link";
import { ToastProvider } from "@/components/ui/toast-provider";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil bahasa aktif dan kamus dari cookie secara aman di sisi server
  const { locale, dict } = await getDictionary();

  return (
    <html lang={locale}>
      <body>
        <ToastProvider>
          <I18nProvider initialLocale={locale} dictionary={dict}>
            <SkipLink />
            <SiteHeader />

            <main id="main-content">{children}</main>

            <SiteFooter />
          </I18nProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

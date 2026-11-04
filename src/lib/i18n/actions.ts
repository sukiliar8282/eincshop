"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE_NAME, sanitizeLocale, type Locale } from "./config";

/**
 * Server Action Resmi: Mengubah preferensi bahasa pengguna secara aman.
 * File ini memiliki direktif "use server" di baris paling atas sehingga
 * 100% valid dan aman diimpor oleh Client Components di Next.js App Router.
 */
export async function setLocaleAction(
  targetLocale: string,
): Promise<{ success: boolean; locale: Locale }> {
  const safeLocale = sanitizeLocale(targetLocale);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, safeLocale, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365, // Berlaku 1 tahun
    secure: process.env.NODE_ENV === "production",
  });

  // Revalidasi seluruh layout agar Server Components dan Client Components langsung sinkron
  revalidatePath("/", "layout");

  return { success: true, locale: safeLocale };
}

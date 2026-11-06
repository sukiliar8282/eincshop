"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { getRequestIp } from "@/lib/security/request";
import { getLocale } from "@/lib/i18n/server";
import { sanitizeLocale } from "@/lib/i18n/config";

export type SellerRegistrationState = {
  error?: string;
  fieldErrors?: {
    storeName?: string[];
  };
};

function getSellerRegistrationSchema(isEn: boolean) {
  return z.object({
    storeName: z
      .string()
      .trim()
      .min(
        3,
        isEn
          ? "Store name must be at least 3 characters."
          : "Nama toko minimal 3 karakter.",
      )
      .max(
        50,
        isEn
          ? "Store name cannot exceed 50 characters."
          : "Nama toko maksimal 50 karakter.",
      )
      .regex(
        /^[a-zA-Z0-9\s\-_.&]+$/,
        isEn
          ? "Store name can only contain letters, numbers, spaces, and symbols (- _ . &)"
          : "Nama toko hanya boleh berisi huruf, angka, spasi, dan simbol (- _ . &)",
      ),
  });
}

/**
 * Server Action untuk mengaktifkan toko digital (Role Upgrade CUSTOMER -> SELLER).
 * Terintegrasi ke PostgreSQL dan mencatat audit trail secara otomatis.
 */
export async function registerAsSellerAction(
  _previousState: SellerRegistrationState,
  formData: FormData,
): Promise<SellerRegistrationState> {
  const formLocale = formData?.get?.("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  // 1. Verifikasi pengguna sudah login
  const sessionUser = await requireUser();

  // 2. Validasi input nama toko secara bilingual
  const rawStoreName = formData.get("storeName");
  const schema = getSellerRegistrationSchema(isEn);
  const validationResult = schema.safeParse({
    storeName: typeof rawStoreName === "string" ? rawStoreName : "",
  });

  if (!validationResult.success) {
    const flattened = validationResult.error.flatten();
    return {
      error:
        flattened.formErrors[0] ||
        (isEn
          ? "Store name does not meet requirements."
          : "Nama toko belum sesuai ketentuan."),
      fieldErrors: flattened.fieldErrors,
    };
  }

  const { storeName } = validationResult.data;

  // 3. Ambil data pengguna dari database PostgreSQL
  const dbUser = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: {
      id: true,
      role: true,
      status: true,
      name: true,
    },
  });

  if (!dbUser || dbUser.status !== "ACTIVE") {
    return {
      error: isEn
        ? "Your account is not active or could not be found."
        : "Akun Anda tidak aktif atau tidak ditemukan.",
    };
  }

  // Jika sudah menjadi ADMIN, pertahankan role ADMIN namun perbarui storeName
  const targetRole = dbUser.role === "ADMIN" ? "ADMIN" : "SELLER";

  // 4. Update data di database: naikkan pangkat role & simpan nama toko
  await prisma.user.update({
    where: {
      id: dbUser.id,
    },
    data: {
      role: targetRole,
      storeName: storeName,
      // Jika pengguna belum punya nama profil, isi otomatis dengan nama tokonya
      name: dbUser.name || storeName,
    },
  });

  // 5. Rekam ke Audit Log untuk kepatuhan sistem enterprise
  const clientIp = await getRequestIp();
  await writeAuditLog({
    actorUserId: dbUser.id,
    action: "USER_BECOME_SELLER",
    entityType: "USER",
    entityId: dbUser.id,
    metadata: {
      previousRole: dbUser.role,
      newRole: targetRole,
      storeName: storeName,
    },
    ipAddress: clientIp,
  });

  // 6. Segarkan cache Next.js agar navigasi dan sesi langsung sinkron
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/become-seller");

  // 7. Arahkan seller baru langsung ke Dashboard Tokonya
  redirect("/admin");
}
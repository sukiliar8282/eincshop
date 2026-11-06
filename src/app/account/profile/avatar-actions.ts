"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { uploadProfileImage } from "@/lib/storage/profile-image";
import { getLocale } from "@/lib/i18n/server";
import { sanitizeLocale } from "@/lib/i18n/config";

export type AvatarActionState = {
  error?: string;
  success?: string;
};

export async function updateProfileImageAction(
  _previousState: AvatarActionState,
  formData: FormData,
): Promise<AvatarActionState> {
  const formLocale = formData?.get?.("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  const sessionUser = await requireUser();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return {
      error: isEn
        ? "Please select a profile photo."
        : "Foto profil belum dipilih.",
    };
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: {
      id: true,
      image: true,
    },
  });

  if (!currentUser) {
    return {
      error: isEn ? "User data not found." : "Data pengguna tidak ditemukan.",
    };
  }

  let uploadedStorageKey: string | null = null;

  try {
    const uploaded = await uploadProfileImage(currentUser.id, file);
    uploadedStorageKey = uploaded.storageKey;

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        image: uploaded.storageKey,
      },
    });

    if (currentUser.image && currentUser.image !== uploaded.storageKey) {
      try {
        await del(currentUser.image);
      } catch (error) {
        console.error("Old profile image cleanup failed:", error);
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/account");
    revalidatePath("/account/profile");

    return {
      success: isEn
        ? "Profile picture updated successfully."
        : "Foto profil berhasil diperbarui.",
    };
  } catch (error) {
    if (uploadedStorageKey) {
      try {
        await del(uploadedStorageKey);
      } catch (cleanupError) {
        console.error("Profile image cleanup failed:", cleanupError);
      }
    }

    const rawError = error instanceof Error ? error.message : "";
    let localizedError = isEn
      ? "Failed to update profile picture."
      : "Foto profil gagal diperbarui.";

    if (rawError.includes("belum dipilih") || rawError.includes("select")) {
      localizedError = isEn
        ? "Please select a profile photo."
        : "Foto profil belum dipilih.";
    } else if (rawError.includes("2 MB") || rawError.includes("Ukuran")) {
      localizedError = isEn
        ? "Image size must be under 2 MB."
        : "Ukuran foto maksimal 2 MB.";
    } else if (rawError.includes("Format") || rawError.includes("format")) {
      localizedError = isEn
        ? "Image format must be JPG, PNG, or WebP."
        : "Format foto harus JPG, PNG, atau WebP.";
    }

    return {
      error: localizedError,
    };
  }
}
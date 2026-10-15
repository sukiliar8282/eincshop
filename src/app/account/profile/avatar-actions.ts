"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { uploadProfileImage } from "@/lib/storage/profile-image";

export type AvatarActionState = {
  error?: string;
  success?: string;
};

export async function updateProfileImageAction(
  _previousState: AvatarActionState,
  formData: FormData,
): Promise<AvatarActionState> {
  const sessionUser = await requireUser();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return {
      error: "Foto profile belum dipilih.",
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
      error: "Data pengguna tidak ditemukan.",
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
      success: "Foto profile berhasil diperbarui.",
    };
  } catch (error) {
    if (uploadedStorageKey) {
      try {
        await del(uploadedStorageKey);
      } catch (cleanupError) {
        console.error("Profile image cleanup failed:", cleanupError);
      }
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Foto profile gagal diperbarui.",
    };
  }
}

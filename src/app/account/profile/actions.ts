"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { sanitizeLocale } from "@/lib/i18n/config";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const formLocale = formData?.get?.("locale");
  const locale =
    typeof formLocale === "string"
      ? sanitizeLocale(formLocale)
      : await getLocale();
  const isEn = locale === "en";

  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      error: isEn
        ? "Name must be between 2 and 80 characters."
        : "Nama harus diisi antara 2 sampai 80 karakter.",
    };
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: parsed.data.name,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");

  return {
    success: isEn
      ? "Profile successfully updated."
      : "Profil berhasil diperbarui.",
  };
}
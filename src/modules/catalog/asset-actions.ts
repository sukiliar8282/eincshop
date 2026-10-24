"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/security/audit";
import { getRequestIp } from "@/lib/security/request";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-user";
import {
  deletePrivateDigitalAsset,
  uploadPrivateDigitalAsset,
  validateDigitalAsset,
} from "@/lib/storage/blob";

export type AssetActionState = {
  error?: string;
  success?: string;
};

export async function uploadDigitalAssetAction(
  productId: string,
  _previousState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const admin = await requireAdmin();

  // F-01 Tenant Isolation: Pastikan penjual hanya dapat mengunggah ke produk miliknya sendiri
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
    },
    select: {
      id: true,
      productType: true,
    },
  });

  if (!product) {
    return {
      error:
        "Product tidak ditemukan atau Anda tidak memiliki izin untuk mengelolanya.",
    };
  }

  if (product.productType !== "DIGITAL") {
    return {
      error: "Asset ini hanya dapat dipasang pada digital product.",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      error: "File belum dipilih.",
    };
  }

  // F-06: Validasi ketat format & ukuran aset digital (cegah malware / berkas raksasa)
  const validation = await validateDigitalAsset(file);
  if (!validation.valid) {
    return {
      error: validation.error,
    };
  }

  let uploadedPathname: string | null = null;

  try {
    const uploaded = await uploadPrivateDigitalAsset(product.id, file);
    uploadedPathname = uploaded.pathname;

    const asset = await prisma.digitalAsset.create({
      data: {
        productId: product.id,
        storageKey: uploaded.pathname,
        fileName: uploaded.fileName ?? file.name,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
        status: "ACTIVE",
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "DIGITAL_ASSET_UPLOADED",
      entityType: "DigitalAsset",
      entityId: asset.id,
      ipAddress: await getRequestIp(),
      metadata: {
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      },
    });
  } catch (error) {
    if (uploadedPathname) {
      try {
        await deletePrivateDigitalAsset(uploadedPathname);
      } catch (cleanupError) {
        console.error("Blob cleanup failed:", cleanupError);
      }
    }
    console.error("Digital asset upload failed:", error);

    return {
      error:
        error instanceof Error ? error.message : "Upload digital asset gagal.",
    };
  }

  revalidatePath(`/admin/products/${productId}/assets`);

  return {
    success: "Digital asset berhasil diupload.",
  };
}

"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getRequestIp } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/security/audit";
import { uploadProductImage } from "@/lib/storage/product-image";

export type ProductImageActionState = {
  error?: string;
  success?: string;
};

export async function uploadProductImageAction(
  productId: string,
  _previousState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  const admin = await requireAdmin();

  // F-01 Tenant Isolation: Validasi hak kepemilikan produk sebelum unggah foto
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!product) {
    return {
      error:
        "Product tidak ditemukan atau Anda tidak memiliki izin untuk mengelolanya.",
    };
  }

  const imageCount = await prisma.productImage.count({
    where: { productId },
  });

  if (imageCount >= 5) {
    return {
      error: "Maksimal 5 foto per product.",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      error: "Foto belum dipilih.",
    };
  }

  const altText = String(formData.get("altText") ?? "").trim() || product.title;

  try {
    const imageId = crypto.randomUUID();
    const uploaded = await uploadProductImage(product.id, file);

    const lastImage = await prisma.productImage.aggregate({
      where: { productId: product.id },
      _max: { sortOrder: true },
    });

    const image = await prisma.productImage.create({
      data: {
        id: imageId,
        productId: product.id,
        storageKey: uploaded.storageKey,
        url: `/api/product-images/${imageId}`,
        altText,
        sortOrder: (lastImage._max.sortOrder ?? -1) + 1,
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "PRODUCT_IMAGE_UPLOADED",
      entityType: "ProductImage",
      entityId: image.id,
      ipAddress: await getRequestIp(),
      metadata: {
        productId: product.id,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath(`/admin/products/${product.id}/images`);

    return {
      success: "Foto product berhasil diupload.",
    };
  } catch (error) {
    console.error("Product image upload failed:", error);

    return {
      error:
        error instanceof Error ? error.message : "Upload foto product gagal.",
    };
  }
}

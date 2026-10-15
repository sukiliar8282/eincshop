"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/security/audit";
import { getRequestIp } from "@/lib/security/request";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-user";
import { categorySchema, productSchema } from "@/modules/catalog/validation";
import {
  deletePrivateDigitalAsset,
  uploadPrivateDigitalAsset,
  validateDigitalAsset,
} from "@/lib/storage/blob";

export type CatalogActionState = {
  error?: string;
  success?: string;
};

function normalizeOptionalValue(value: string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export async function createCategoryAction(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      error: "Nama atau slug kategori belum sesuai.",
    };
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }],
    },
    select: {
      id: true,
    },
  });

  if (existingCategory) {
    return {
      error: "Kategori dengan nama atau slug tersebut sudah ada.",
    };
  }

  const newCategory = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
    },
  });

  // Audit Log untuk Kategori
  await writeAuditLog({
    actorUserId: admin.id,
    action: "CATEGORY_CREATED",
    entityType: "Category",
    entityId: newCategory.id,
    ipAddress: await getRequestIp(),
    metadata: {
      name: newCategory.name,
      slug: newCategory.slug,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");

  return {
    success: "Kategori berhasil dibuat.",
  };
}

export async function createProductAction(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const parsed = productSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceIdr: formData.get("priceIdr"),
    sku: formData.get("sku"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: "Data product belum sesuai.",
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: parsed.data.categoryId,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!category || !category.isActive) {
    return {
      error: "Kategori tidak tersedia.",
    };
  }

  const fileValue = formData.get("file");

  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (parsed.data.status === "PUBLISHED" && !file) {
    return {
      error: "File digital wajib diisi untuk product Published.",
    };
  }

  if (file) {
    const fileValidation = await validateDigitalAsset(file);

    if (!fileValidation.valid) {
      return {
        error: fileValidation.error,
      };
    }
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: parsed.data.slug },
        parsed.data.sku
          ? { sku: parsed.data.sku }
          : { id: "__unused_product_id__" },
      ],
    },
    select: {
      id: true,
    },
  });

  if (existingProduct) {
    return {
      error: "Slug atau SKU product sudah digunakan.",
    };
  }

  let createdProductId: string | undefined;
  let uploadedStorageKey: string | undefined;

  try {
    const createdProduct = await prisma.product.create({
      data: {
        categoryId: parsed.data.categoryId,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        productType: "DIGITAL",
        status: parsed.data.status,
        priceMinor: parsed.data.priceIdr,
        currency: "IDR",
        sku: normalizeOptionalValue(parsed.data.sku),
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "PRODUCT_CREATED",
      entityType: "Product",
      entityId: createdProduct.id,
      ipAddress: await getRequestIp(),
      metadata: {
        status: parsed.data.status,
        productType: "DIGITAL",
      },
    });

    createdProductId = createdProduct.id;

    if (file) {
      const uploadedAsset = await uploadPrivateDigitalAsset(
        createdProduct.id,
        file,
      );

      uploadedStorageKey = uploadedAsset.pathname;

      const digitalAsset = await prisma.digitalAsset.create({
        data: {
          productId: createdProduct.id,
          storageKey: uploadedAsset.pathname,
          fileName: uploadedAsset.fileName ?? file.name,
          mimeType: uploadedAsset.mimeType,
          fileSize: uploadedAsset.fileSize,
          status: "ACTIVE",
        },
      });

      // Audit Log untuk Digital Asset Upload
      await writeAuditLog({
        actorUserId: admin.id,
        action: "DIGITAL_ASSET_UPLOADED",
        entityType: "DigitalAsset",
        entityId: digitalAsset.id,
        ipAddress: await getRequestIp(),
        metadata: {
          mimeType: uploadedAsset.mimeType,
          fileSize: uploadedAsset.fileSize,
        },
      });
    }
  } catch (error) {
    console.error("Product creation failed:", error);

    if (uploadedStorageKey) {
      await deletePrivateDigitalAsset(uploadedStorageKey);
    }

    if (createdProductId) {
      await prisma.product.delete({
        where: {
          id: createdProductId,
        },
      });
    }

    return {
      error: "Product atau file digital gagal disimpan.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return {
    success: "Product berhasil dibuat.",
  };
}

export async function updateProductAction(
  productId: string,
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const parsed = productSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceIdr: formData.get("priceIdr"),
    sku: formData.get("sku"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: "Data product belum sesuai.",
    };
  }

  const currentProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      publishedAt: true,
      digitalAssets: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, storageKey: true },
      },
    },
  });

  if (!currentProduct) {
    return {
      error: "Product tidak ditemukan.",
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: parsed.data.categoryId,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!category || !category.isActive) {
    return {
      error: "Kategori tidak tersedia.",
    };
  }

  const existingAsset = currentProduct.digitalAssets[0] ?? null;

  const fileValue = formData.get("file");

  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (parsed.data.status === "PUBLISHED" && !file && !existingAsset) {
    return {
      error: "File digital wajib diisi untuk product Published.",
    };
  }

  if (file) {
    const fileValidation = await validateDigitalAsset(file);

    if (!fileValidation.valid) {
      return {
        error: fileValidation.error,
      };
    }
  }

  const normalizedSku = normalizeOptionalValue(parsed.data.sku);

  const duplicateProduct = await prisma.product.findFirst({
    where: {
      id: {
        not: productId,
      },
      OR: [
        {
          slug: parsed.data.slug,
        },
        ...(normalizedSku ? [{ sku: normalizedSku }] : []),
      ],
    },
    select: {
      id: true,
    },
  });

  if (duplicateProduct) {
    return {
      error: "Slug atau SKU product sudah digunakan.",
    };
  }

  const publishedAt =
    parsed.data.status === "PUBLISHED"
      ? (currentProduct.publishedAt ?? new Date())
      : null;
  const fallbackFileName = file?.name ?? "digital-asset";
  let uploaded:
    Awaited<ReturnType<typeof uploadPrivateDigitalAsset>> | undefined;
  let assetId: string | undefined;

  try {
    if (file) {
      uploaded = await uploadPrivateDigitalAsset(productId, file);
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: {
          id: productId,
        },
        data: {
          categoryId: parsed.data.categoryId,
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          priceMinor: parsed.data.priceIdr,
          currency: "IDR",
          sku: normalizedSku,
          status: parsed.data.status,
          publishedAt,
        },
      });

      if (uploaded) {
        const assetData = {
          storageKey: uploaded.pathname,
          fileName: uploaded.fileName ?? fallbackFileName,
          mimeType: uploaded.mimeType,
          fileSize: uploaded.fileSize,
        };

        const asset = existingAsset
          ? await transaction.digitalAsset.update({
              where: { id: existingAsset.id },
              data: assetData,
            })
          : await transaction.digitalAsset.create({
              data: {
                productId,
                status: "ACTIVE",
                ...assetData,
              },
            });

        assetId = asset.id;
      }
    });
  } catch (error) {
    console.error("Product update failed:", error);

    if (uploaded) {
      await deletePrivateDigitalAsset(uploaded.pathname).catch(() => {});
    }

    return {
      error: "Product atau file digital gagal diperbarui.",
    };
  }

  // Hapus file lama dari storage setelah database berhasil diperbarui
  if (uploaded && existingAsset) {
    try {
      await deletePrivateDigitalAsset(existingAsset.storageKey);
    } catch (error) {
      console.error("Old digital asset cleanup failed:", error);
    }
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "PRODUCT_UPDATED",
    entityType: "Product",
    entityId: productId,
    ipAddress: await getRequestIp(),
    metadata: {
      title: parsed.data.title,
      status: parsed.data.status,
    },
  });

  if (uploaded && assetId) {
    await writeAuditLog({
      actorUserId: admin.id,
      action: existingAsset
        ? "DIGITAL_ASSET_REPLACED"
        : "DIGITAL_ASSET_UPLOADED",
      entityType: "DigitalAsset",
      entityId: assetId,
      ipAddress: await getRequestIp(),
      metadata: {
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath(`/admin/products/${productId}/assets`);

  return {
    success: "Product berhasil diperbarui.",
  };
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const productId = formData.get("productId");

  if (typeof productId !== "string") {
    throw new Error("Product ID tidak valid.");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!product) {
    throw new Error("Product tidak ditemukan.");
  }

  await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      status: "ARCHIVED",
      publishedAt: null,
    },
  });

  // Audit Log untuk Archive Product
  await writeAuditLog({
    actorUserId: admin.id,
    action: "PRODUCT_ARCHIVED",
    entityType: "Product",
    entityId: product.id,
    ipAddress: await getRequestIp(),
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
}

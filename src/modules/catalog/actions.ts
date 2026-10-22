"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/security/audit";
import { getRequestIp } from "@/lib/security/request";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth/require-user";
import { categorySchema, productSchema } from "@/modules/catalog/validation";
import { getLocale } from "@/lib/i18n/server";
import {
  deletePrivateDigitalAsset,
  uploadPrivateDigitalAsset,
  validateDigitalAsset,
} from "@/lib/storage/blob";
import { uploadProductImage } from "@/lib/storage/product-image";

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
  // Hanya Super Admin yang berhak membuat kategori katalog global
  const admin = await requireSuperAdmin();

  const userLocale = (formData.get("locale") as string) || (await getLocale());
  const isEn = userLocale === "en" || userLocale === "en-US";

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      error: isEn
        ? "Category name or slug is invalid."
        : "Nama atau slug kategori belum sesuai.",
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
      error: isEn
        ? "A category with that name or slug already exists."
        : "Kategori dengan nama atau slug tersebut sudah ada.",
    };
  }

  const newCategory = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
    },
  });

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
    success: isEn
      ? "Category successfully created."
      : "Kategori berhasil dibuat.",
  };
}

export async function createProductAction(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  // Deteksi Bahasa Pengguna
  const userLocale = (formData.get("locale") as string) || (await getLocale());
  const isEn = userLocale === "en" || userLocale === "en-US";

  // 1. Resolusi Kategori Fleksibel: Kategori Bawaan vs Kustom Sendiri
  const isCustomCategory = formData.get("isCustomCategory") === "true";
  const newCategoryName = formData.get("newCategoryName");
  let resolvedCategoryId = formData.get("categoryId") as string;

  if (isCustomCategory) {
    if (
      !newCategoryName ||
      typeof newCategoryName !== "string" ||
      newCategoryName.trim().length < 2
    ) {
      return {
        error: isEn
          ? "Custom category name must be at least 2 characters."
          : "Nama kategori kustom minimal 2 karakter.",
      };
    }

    const trimmedName = newCategoryName.trim();
    const generatedSlug =
      trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;

    let targetCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: "insensitive" } },
          { slug: generatedSlug },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!targetCategory) {
      targetCategory = await prisma.category.create({
        data: {
          name: trimmedName,
          slug: generatedSlug,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      await writeAuditLog({
        actorUserId: admin.id,
        action: "CATEGORY_CREATED",
        entityType: "Category",
        entityId: targetCategory.id,
        ipAddress: await getRequestIp(),
        metadata: {
          name: trimmedName,
          slug: generatedSlug,
          source: "ON_THE_FLY_PRODUCT_FORM",
        },
      });

      revalidatePath("/admin/categories");
    }

    resolvedCategoryId = targetCategory.id;
  }

  // 2. Validasi Skema Produk
  const parsed = productSchema.safeParse({
    categoryId: resolvedCategoryId,
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceIdr: formData.get("priceIdr"),
    sku: formData.get("sku"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    let customError = isEn
      ? "Product data is incomplete or invalid."
      : "Data produk belum sesuai.";

    if (firstIssue) {
      if (firstIssue.path.includes("description")) {
        customError = isEn
          ? "Product description must be at least 20 characters."
          : "Deskripsi produk wajib diisi minimal 20 karakter.";
      } else if (firstIssue.path.includes("title")) {
        customError = isEn
          ? "Product title must be between 3 and 160 characters."
          : "Nama produk harus diisi antara 3 sampai 160 karakter.";
      } else if (firstIssue.path.includes("slug")) {
        customError = isEn
          ? "Invalid URL slug format (use lowercase letters, numbers, and hyphens without spaces)."
          : "Format slug URL tidak valid (gunakan huruf kecil, angka, dan tanda strip tanpa spasi).";
      } else if (firstIssue.path.includes("priceIdr")) {
        customError = isEn
          ? "Product price in IDR must be a valid positive number."
          : "Harga produk dalam IDR harus berupa angka positif.";
      } else if (firstIssue.path.includes("categoryId")) {
        customError = isEn
          ? "Please select or create a product category."
          : "Kategori produk wajib dipilih atau dibuat.";
      } else {
        customError = firstIssue.message;
      }
    }

    return {
      error: customError,
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
      error: isEn
        ? "Selected category is not available."
        : "Kategori tidak tersedia.",
    };
  }

  const fileValue = formData.get("file");

  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (parsed.data.status === "PUBLISHED" && !file) {
    return {
      error: isEn
        ? "Digital file is required when publishing a product."
        : "File digital wajib diisi jika status produk Published.",
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

  // Tangkap seluruh berkas foto hasil crop
  const rawImages = formData.getAll("images");
  const imageFiles = rawImages.filter(
    (item): item is File => item instanceof File && item.size > 0,
  );

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
      error: isEn
        ? "Product slug URL or SKU is already used by another product."
        : "Slug URL atau SKU produk sudah digunakan oleh produk lain.",
    };
  }

  let createdProductId: string | undefined;
  let uploadedStorageKey: string | undefined;
  const uploadedImageKeys: string[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdProduct = await (prisma.product as any).create({
      data: {
        sellerId: admin.id,
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

    // 3. Simpan Koleksi Foto Produk (Carousel Strip) ke Storage & PostgreSQL
    for (let index = 0; index < imageFiles.length; index++) {
      const imgFile = imageFiles[index];
      const imageId = crypto.randomUUID();
      const uploadedImage = await uploadProductImage(
        createdProduct.id,
        imgFile,
      );
      uploadedImageKeys.push(uploadedImage.storageKey);

      await prisma.productImage.create({
        data: {
          id: imageId,
          productId: createdProduct.id,
          storageKey: uploadedImage.storageKey,
          url: `/api/product-images/${imageId}`,
          altText: `${createdProduct.title} - ${index + 1}`,
          sortOrder: index,
        },
      });

      await writeAuditLog({
        actorUserId: admin.id,
        action: "PRODUCT_IMAGE_UPLOADED",
        entityType: "ProductImage",
        entityId: imageId,
        ipAddress: await getRequestIp(),
        metadata: {
          productId: createdProduct.id,
          mimeType: uploadedImage.mimeType,
          fileSize: uploadedImage.fileSize,
          sortOrder: index,
        },
      });
    }

    // 4. Simpan Berkas Digital Downloadable
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
      await deletePrivateDigitalAsset(uploadedStorageKey).catch(() => {});
    }

    for (const key of uploadedImageKeys) {
      await deletePrivateDigitalAsset(key).catch(() => {});
    }

    if (createdProductId) {
      await prisma.product
        .delete({
          where: {
            id: createdProductId,
          },
        })
        .catch(() => {});
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : isEn
            ? "Failed to save product or files."
            : "Product atau berkas gagal disimpan.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return {
    success: isEn
      ? "Product successfully created."
      : "Product berhasil dibuat.",
  };
}

export async function updateProductAction(
  productId: string,
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const userLocale = (formData.get("locale") as string) || (await getLocale());
  const isEn = userLocale === "en" || userLocale === "en-US";

  // 1. Resolusi Kategori Fleksibel: Kategori Bawaan vs Kustom Sendiri
  const isCustomCategory = formData.get("isCustomCategory") === "true";
  const newCategoryName = formData.get("newCategoryName");
  let resolvedCategoryId = formData.get("categoryId") as string;

  if (isCustomCategory) {
    if (
      !newCategoryName ||
      typeof newCategoryName !== "string" ||
      newCategoryName.trim().length < 2
    ) {
      return {
        error: isEn
          ? "Custom category name must be at least 2 characters."
          : "Nama kategori kustom minimal 2 karakter.",
      };
    }

    const trimmedName = newCategoryName.trim();
    const generatedSlug =
      trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;

    let targetCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: "insensitive" } },
          { slug: generatedSlug },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!targetCategory) {
      targetCategory = await prisma.category.create({
        data: {
          name: trimmedName,
          slug: generatedSlug,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      await writeAuditLog({
        actorUserId: admin.id,
        action: "CATEGORY_CREATED",
        entityType: "Category",
        entityId: targetCategory.id,
        ipAddress: await getRequestIp(),
        metadata: {
          name: trimmedName,
          slug: generatedSlug,
          source: "ON_THE_FLY_PRODUCT_EDIT",
        },
      });

      revalidatePath("/admin/categories");
    }

    resolvedCategoryId = targetCategory.id;
  }

  // 2. Validasi Skema Produk
  const parsed = productSchema.safeParse({
    categoryId: resolvedCategoryId,
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceIdr: formData.get("priceIdr"),
    sku: formData.get("sku"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    let customError = isEn
      ? "Product data is incomplete or invalid."
      : "Data produk belum sesuai.";

    if (firstIssue) {
      if (firstIssue.path.includes("description")) {
        customError = isEn
          ? "Product description must be at least 20 characters."
          : "Deskripsi produk wajib diisi minimal 20 karakter.";
      } else if (firstIssue.path.includes("title")) {
        customError = isEn
          ? "Product title must be between 3 and 160 characters."
          : "Nama produk harus diisi antara 3 sampai 160 karakter.";
      } else if (firstIssue.path.includes("slug")) {
        customError = isEn
          ? "Invalid URL slug format (use lowercase letters, numbers, and hyphens without spaces)."
          : "Format slug URL tidak valid (gunakan huruf kecil, angka, dan tanda strip tanpa spasi).";
      } else if (firstIssue.path.includes("priceIdr")) {
        customError = isEn
          ? "Product price in IDR must be a valid positive number."
          : "Harga produk dalam IDR harus berupa angka positif.";
      } else if (firstIssue.path.includes("categoryId")) {
        customError = isEn
          ? "Please select or create a product category."
          : "Kategori produk wajib dipilih atau dibuat.";
      } else {
        customError = firstIssue.message;
      }
    }

    return {
      error: customError,
    };
  }

  // IDOR & Tenant Isolation Check: Seller hanya boleh mengedit produk miliknya sendiri
  const currentProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
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
      error: isEn
        ? "Product not found or you do not have permission to edit it."
        : "Product tidak ditemukan atau Anda tidak memiliki izin untuk mengedit produk ini.",
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
      error: isEn
        ? "Selected category is not available."
        : "Kategori tidak tersedia.",
    };
  }

  const existingAsset = currentProduct.digitalAssets[0] ?? null;

  const fileValue = formData.get("file");

  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (parsed.data.status === "PUBLISHED" && !file && !existingAsset) {
    return {
      error: isEn
        ? "Digital file is required when publishing a product."
        : "File digital wajib diisi jika status produk Published.",
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
      error: isEn
        ? "Product slug URL or SKU is already used by another product."
        : "Slug URL atau SKU produk sudah digunakan oleh produk lain.",
    };
  }

  // 3. Proses Penghapusan Foto yang Ditandai Pengguna (Deleted Images)
  const deletedImageIds = formData
    .getAll("deletedImageIds")
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (deletedImageIds.length > 0) {
    const imagesToDelete = await prisma.productImage.findMany({
      where: {
        id: { in: deletedImageIds },
        productId,
      },
      select: {
        id: true,
        storageKey: true,
      },
    });

    for (const img of imagesToDelete) {
      await deletePrivateDigitalAsset(img.storageKey).catch(() => {});
    }

    await prisma.productImage.deleteMany({
      where: {
        id: { in: imagesToDelete.map((img) => img.id) },
      },
    });
  }

  // 4. Proses Penambahan Foto Baru Hasil Crop (New Images)
  const rawImages = formData.getAll("images");
  const imageFiles = rawImages.filter(
    (item): item is File => item instanceof File && item.size > 0,
  );

  const existingImageCount = await prisma.productImage.count({
    where: { productId },
  });

  for (let index = 0; index < imageFiles.length; index++) {
    const imgFile = imageFiles[index];
    const imageId = crypto.randomUUID();
    const uploadedImage = await uploadProductImage(productId, imgFile);

    await prisma.productImage.create({
      data: {
        id: imageId,
        productId,
        storageKey: uploadedImage.storageKey,
        url: `/api/product-images/${imageId}`,
        altText: `${parsed.data.title} - ${existingImageCount + index + 1}`,
        sortOrder: existingImageCount + index,
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "PRODUCT_IMAGE_UPLOADED",
      entityType: "ProductImage",
      entityId: imageId,
      ipAddress: await getRequestIp(),
      metadata: {
        productId,
        mimeType: uploadedImage.mimeType,
        fileSize: uploadedImage.fileSize,
        sortOrder: existingImageCount + index,
      },
    });
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
      error: isEn
        ? "Failed to update product or files."
        : "Product atau file digital gagal diperbarui.",
    };
  }

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
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath(`/admin/products/${productId}/assets`);

  return {
    success: isEn
      ? "Product successfully updated."
      : "Product berhasil diperbarui.",
  };
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const productId = formData.get("productId");

  if (typeof productId !== "string") {
    throw new Error("Product ID tidak valid.");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!product) {
    throw new Error(
      "Product tidak ditemukan atau Anda tidak memiliki izin untuk mengarsipkan produk ini.",
    );
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

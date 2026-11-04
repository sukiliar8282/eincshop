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
  const superAdmin = await requireSuperAdmin();

  // Deteksi Bahasa Pengguna
  const userLocale = (formData.get("locale") as string) || (await getLocale());
  const isEn = userLocale === "en" || userLocale === "en-US";

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    let customError = isEn
      ? "Category data is invalid."
      : "Data kategori belum valid.";

    if (firstIssue) {
      if (firstIssue.path.includes("name")) {
        customError = isEn
          ? "Category name must be between 2 and 60 characters."
          : "Nama kategori harus antara 2 sampai 60 karakter.";
      } else if (firstIssue.path.includes("slug")) {
        customError = isEn
          ? "Invalid slug format (use lowercase letters, numbers, and hyphens)."
          : "Format slug tidak valid (gunakan huruf kecil, angka, dan tanda strip).";
      } else {
        customError = firstIssue.message;
      }
    }

    return {
      error: customError,
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
        ? "Category name or slug is already used."
        : "Nama atau slug kategori sudah digunakan.",
    };
  }

  const newCategory = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: normalizeOptionalValue(
        formData.get("description") as string | undefined,
      ),
    },
  });

  await writeAuditLog({
    actorUserId: superAdmin.id,
    action: "CATEGORY_CREATED",
    entityType: "Category",
    entityId: newCategory.id,
    ipAddress: await getRequestIp(),
    metadata: {
      name: parsed.data.name,
      slug: parsed.data.slug,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  revalidatePath("/");

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

  // 1. Resolusi Kategori: Validasi & Otorisasi Kategori Baru (F-05 Fix)
  const isCustomCategory = formData.get("isCustomCategory") === "true";
  const newCategoryName = formData.get("newCategoryName");
  let resolvedCategoryId = formData.get("categoryId") as string;

  if (isCustomCategory) {
    // F-05: Kunci pembuatan kategori global hanya untuk Platform Super Admin
    if (admin.role !== "ADMIN") {
      return {
        error: isEn
          ? "Unauthorized: Only platform administrators can create new global categories. Please select an existing category."
          : "Akses Ditolak: Hanya Admin Platform yang dapat menambahkan kategori baru. Silakan pilih kategori yang tersedia.",
      };
    }

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

  // 2. Tangkap Tech Stack & Validasi Skema Produk
  const rawTechStack = formData.getAll("techStack");
  const techStack = rawTechStack
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  const parsed = productSchema.safeParse({
    categoryId: resolvedCategoryId,
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceIdr: formData.get("priceIdr"),
    sku: formData.get("sku"),
    status: formData.get("status"),
    techStack,
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

  // 3. Tangkap Semua Berkas Gambar Hasil Crop
  const rawImages = formData.getAll("images");
  const imageFiles = rawImages.filter(
    (item): item is File => item instanceof File && item.size > 0,
  );

  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: parsed.data.slug },
        ...(parsed.data.sku ? [{ sku: parsed.data.sku }] : []),
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
    const createdProduct = await prisma.product.create({
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
        techStack: parsed.data.techStack,
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

    // Simpan Seluruh Gambar Produk Hasil Cropper
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
          url: uploadedImage.url,
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
          productId: createdProduct.id,
          mimeType: uploadedAsset.mimeType,
          fileSize: uploadedAsset.fileSize,
        },
      });
    }

    if (parsed.data.status === "PUBLISHED") {
      await prisma.product
        .updateMany({
          where: {
            id: createdProduct.id,
            publishedAt: null,
          },
          data: {
            publishedAt: new Date(),
          },
        })
        .catch(() => {});
    }
  } catch (error) {
    if (uploadedStorageKey) {
      try {
        await deletePrivateDigitalAsset(uploadedStorageKey);
      } catch (cleanupError) {
        console.error("Cleanup digital asset failed:", cleanupError);
      }
    }

    if (createdProductId) {
      try {
        await prisma.product.delete({
          where: {
            id: createdProductId,
          },
        });
      } catch (cleanupError) {
        console.error("Rollback created product failed:", cleanupError);
      }
    }

    console.error("Create product failed:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : isEn
            ? "Failed to create product."
            : "Gagal membuat produk baru.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return {
    success: isEn ? "Product successfully created." : "Produk berhasil dibuat.",
  };
}

export async function updateProductAction(
  productId: string,
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  // Deteksi Bahasa Pengguna
  const userLocale = (formData.get("locale") as string) || (await getLocale());
  const isEn = userLocale === "en" || userLocale === "en-US";

  // 1. Resolusi Kategori: Validasi & Otorisasi Kategori Baru (F-05 Fix)
  const isCustomCategory = formData.get("isCustomCategory") === "true";
  const newCategoryName = formData.get("newCategoryName");
  let resolvedCategoryId = formData.get("categoryId") as string;

  if (isCustomCategory) {
    // F-05: Kunci pembuatan kategori global hanya untuk Platform Super Admin
    if (admin.role !== "ADMIN") {
      return {
        error: isEn
          ? "Unauthorized: Only platform administrators can create new global categories. Please select an existing category."
          : "Akses Ditolak: Hanya Admin Platform yang dapat menambahkan kategori baru. Silakan pilih kategori yang tersedia.",
      };
    }

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

  // 2. Tangkap Tech Stack & Validasi Skema Produk
  const rawTechStack = formData.getAll("techStack");
  const techStack = rawTechStack
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  const parsed = productSchema.safeParse({
    categoryId: resolvedCategoryId,
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceIdr: formData.get("priceIdr"),
    sku: formData.get("sku"),
    status: formData.get("status"),
    techStack,
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

  const fileValue = formData.get("file");

  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  const existingAsset = currentProduct.digitalAssets[0];

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
      id: { not: productId },
      OR: [
        { slug: parsed.data.slug },
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

  // Tangkap Penghapusan Foto Lama
  const deleteImageIds = [
    ...formData.getAll("deleteImageIds"),
    ...formData.getAll("deletedImageIds"),
  ].filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );

  if (deleteImageIds.length > 0) {
    const imagesToDelete = await prisma.productImage.findMany({
      where: {
        id: { in: deleteImageIds },
        productId,
      },
      select: {
        id: true,
        storageKey: true,
      },
    });

    for (const image of imagesToDelete) {
      try {
        await deletePrivateDigitalAsset(image.storageKey);
      } catch (err) {
        console.error("Gagal menghapus file gambar fisik:", err);
      }
    }

    await prisma.productImage.deleteMany({
      where: {
        id: { in: deleteImageIds },
        productId,
      },
    });
  }

  // Tangkap Penambahan Foto Baru
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
    const sortOrder = existingImageCount + index;

    const uploadedImage = await uploadProductImage(productId, imgFile);

    await prisma.productImage.create({
      data: {
        id: imageId,
        productId,
        storageKey: uploadedImage.storageKey,
        url: uploadedImage.url,
        altText: `${parsed.data.title} - ${sortOrder + 1}`,
        sortOrder,
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
        sortOrder,
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
          techStack: parsed.data.techStack,
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
                ...assetData,
                status: "ACTIVE",
              },
            });

        assetId = asset.id;
      }
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "PRODUCT_UPDATED",
      entityType: "Product",
      entityId: productId,
      ipAddress: await getRequestIp(),
      metadata: {
        status: parsed.data.status,
        productType: "DIGITAL",
      },
    });

    if (assetId) {
      await writeAuditLog({
        actorUserId: admin.id,
        action: "DIGITAL_ASSET_UPLOADED",
        entityType: "DigitalAsset",
        entityId: assetId,
        ipAddress: await getRequestIp(),
        metadata: {
          productId,
          mimeType: uploaded?.mimeType,
          fileSize: uploaded?.fileSize,
        },
      });
    }

    if (existingAsset && uploaded) {
      try {
        await deletePrivateDigitalAsset(existingAsset.storageKey);
      } catch (cleanupError) {
        console.error("Cleanup old asset failed:", cleanupError);
      }
    }
  } catch (error) {
    if (uploaded?.pathname) {
      try {
        await deletePrivateDigitalAsset(uploaded.pathname);
      } catch (cleanupError) {
        console.error("Cleanup digital asset failed:", cleanupError);
      }
    }

    console.error("Update product failed:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : isEn
            ? "Failed to update product."
            : "Gagal memperbarui produk.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/");

  return {
    success: isEn
      ? "Product successfully updated."
      : "Produk berhasil diperbarui.",
  };
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const rawId = formData.get("productId");
  if (typeof rawId !== "string" || !rawId) {
    throw new Error("Product ID tidak valid.");
  }

  const productId = rawId;

  // Tenant Isolation: Validasi sellerId jika bukan super admin
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

/**
 * Hapus Permanen Produk (Multi-Tenant Isolated)
 * - Seller hanya dapat menghapus produk miliknya sendiri (sellerId: admin.id).
 * - Admin Platform (Super Admin) memiliki otoritas penuh menghapus produk mana pun.
 * - Seller dibatasi tidak dapat menghapus produk jika sudah dibeli pelanggan (orderItems > 0) demi integritas pesanan.
 */
export async function deleteProductAction(
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const userLocale = (formData.get("locale") as string) || (await getLocale());
  const isEn = userLocale === "en" || userLocale === "en-US";

  const rawId = formData.get("productId");
  if (typeof rawId !== "string" || !rawId) {
    return {
      error: isEn ? "Invalid Product ID." : "ID Produk tidak valid.",
    };
  }

  const productId = rawId;

  // 1. Tenant Isolation & IDOR Guard:
  // Seller biasa (role !== "ADMIN") HANYA dapat menghapus produk miliknya sendiri
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
    },
    include: {
      _count: {
        select: { orderItems: true },
      },
      orderItems: {
        select: { id: true },
      },
      images: {
        select: { id: true, storageKey: true },
      },
      digitalAssets: {
        select: { id: true, storageKey: true },
      },
    },
  });

  if (!product) {
    return {
      error: isEn
        ? "Product not found or you do not have permission to delete it."
        : "Produk tidak ditemukan atau Anda tidak memiliki izin untuk menghapus produk ini.",
    };
  }

  // 2. Proteksi Hak Akses Pembeli:
  // Seller biasa tidak boleh menghapus produk yang sudah memiliki transaksi pembeli
  if (admin.role !== "ADMIN" && product._count.orderItems > 0) {
    return {
      error: isEn
        ? "Products with existing customer orders cannot be permanently deleted by sellers. Please archive the product instead."
        : "Produk yang sudah pernah memiliki transaksi pesanan tidak dapat dihapus permanen oleh penjual demi menjaga akses unduh pembeli. Silakan gunakan fitur Arsipkan.",
    };
  }

  try {
    // 3. Bersihkan file fisik di blob/storage
    for (const img of product.images) {
      try {
        await deletePrivateDigitalAsset(img.storageKey);
      } catch (err) {
        console.error("Cleanup image file failed:", err);
      }
    }

    for (const asset of product.digitalAssets) {
      try {
        await deletePrivateDigitalAsset(asset.storageKey);
      } catch (err) {
        console.error("Cleanup digital asset file failed:", err);
      }
    }

    // 4. Jika Super Admin menghapus produk yang memiliki riwayat pesanan (contoh: produk test)
    if (admin.role === "ADMIN" && product.orderItems.length > 0) {
      const orderItemIds = product.orderItems.map((oi) => oi.id);
      const digitalAssetIds = product.digitalAssets.map((da) => da.id);

      await prisma.downloadGrant.deleteMany({
        where: {
          OR: [
            ...(orderItemIds.length > 0
              ? [{ orderItemId: { in: orderItemIds } }]
              : []),
            ...(digitalAssetIds.length > 0
              ? [{ digitalAssetId: { in: digitalAssetIds } }]
              : []),
          ],
        },
      });

      await prisma.orderItem.deleteMany({
        where: { productId },
      });
    }

    // 5. Hapus relasi keranjang belanja (cart items)
    await prisma.cartItem.deleteMany({
      where: { productId },
    });

    // 6. Hapus gambar & berkas aset dari database
    await prisma.productImage.deleteMany({
      where: { productId },
    });
    await prisma.digitalAsset.deleteMany({
      where: { productId },
    });

    // 7. Hapus data produk dari database
    await prisma.product.delete({
      where: { id: productId },
    });

    // 8. Catat Audit Log
    await writeAuditLog({
      actorUserId: admin.id,
      action: "PRODUCT_DELETED",
      entityType: "Product",
      entityId: productId,
      ipAddress: await getRequestIp(),
      metadata: {
        title: product.title,
        slug: product.slug,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: isEn
        ? "Product has been permanently deleted."
        : "Produk berhasil dihapus secara permanen.",
    };
  } catch (error) {
    console.error("Delete product failed:", error);
    return {
      error: isEn
        ? "Failed to permanently delete product."
        : "Gagal menghapus produk secara permanen.",
    };
  }
}

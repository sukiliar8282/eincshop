import { put } from "@vercel/blob";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

async function hasValidSignature(
  file: File,
  mimeType: string,
): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

export async function uploadProductImage(productId: string, file: File) {
  if (!file || file.size === 0) {
    throw new Error("Foto belum dipilih.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WebP.");
  }

  const validSignature = await hasValidSignature(file, file.type);

  if (!validSignature) {
    throw new Error("Isi file tidak sesuai dengan format foto.");
  }

  const safeName = sanitizeFileName(file.name);
  const pathname = `products/${productId}/images/${crypto.randomUUID()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return {
    storageKey: blob.pathname,
    url: blob.url,
    fileName: safeName,
    mimeType: file.type,
    fileSize: file.size,
  };
}

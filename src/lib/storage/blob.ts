import { del, put } from "@vercel/blob";

const MAX_DIGITAL_ASSET_BYTES = 4 * 1024 * 1024;

const ALLOWED_FILE_TYPES = new Map([
  [".pdf", ["application/pdf"]],
  [".zip", ["application/zip", "application/x-zip-compressed"]],
]);

function getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return fileName.slice(lastDot).toLowerCase();
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

async function hasValidSignature(
  file: File,
  extension: string,
): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());

  if (extension === ".pdf") {
    return (
      bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    );
  }

  if (extension === ".zip") {
    return (
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
      (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
    );
  }

  return false;
}

export async function validateDigitalAsset(file: File) {
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: "File belum dipilih.",
    };
  }

  if (file.size > MAX_DIGITAL_ASSET_BYTES) {
    return {
      valid: false,
      error: "Ukuran file maksimal 4 MB untuk upload tahap ini.",
    };
  }

  const extension = getExtension(file.name);
  const allowedMimeTypes = ALLOWED_FILE_TYPES.get(extension);

  if (!allowedMimeTypes || !allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Format file belum didukung. Gunakan PDF atau ZIP.",
    };
  }

  const validSignature = await hasValidSignature(file, extension);

  if (!validSignature) {
    return {
      valid: false,
      error: "Isi file tidak sesuai dengan format yang dipilih.",
    };
  }

  return {
    valid: true,
    extension,
    fileName: sanitizeFileName(file.name),
  };
}

export async function uploadPrivateDigitalAsset(productId: string, file: File) {
  const validation = await validateDigitalAsset(file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const pathname = `products/${productId}/assets/${crypto.randomUUID()}-${validation.fileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return {
    pathname: blob.pathname,
    fileName: validation.fileName,
    mimeType: file.type,
    fileSize: file.size,
  };
}

export async function deletePrivateDigitalAsset(pathname: string) {
  await del(pathname);
}

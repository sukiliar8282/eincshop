import { put } from "@vercel/blob";

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

async function hasValidSignature(file: File, type: string): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (type === "image/webp") {
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

export async function uploadProfileImage(userId: string, file: File) {
  if (!file || file.size === 0) {
    throw new Error("Foto profile belum dipilih.");
  }

  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error("Ukuran foto profile maksimal 2 MB.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Gunakan format JPG, PNG, atau WebP.");
  }

  if (!(await hasValidSignature(file, file.type))) {
    throw new Error("Isi file tidak sesuai dengan format gambar.");
  }

  const fileName = sanitizeFileName(file.name);
  const pathname = `users/${userId}/profile/${crypto.randomUUID()}-${fileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return {
    storageKey: blob.pathname,
  };
}

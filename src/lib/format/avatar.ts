/**
 * 8 Palet Warna Editorial Mewah & Lembut (Non-Cookie-Cutter).
 * Menggunakan kombinasi warna kontras tinggi yang ramah aksesibilitas.
 */
export const AVATAR_COLOR_PALETTES = [
  {
    name: "Nordic Indigo",
    bg: "bg-[#EEF2FF]",
    text: "text-[#4338CA]",
    border: "border-[#C7D2FE]",
  },
  {
    name: "Forest Emerald",
    bg: "bg-[#ECFDF5]",
    text: "text-[#065F46]",
    border: "border-[#A7F3D0]",
  },
  {
    name: "Warm Amber",
    bg: "bg-[#FFFBEB]",
    text: "text-[#92400E]",
    border: "border-[#FDE68A]",
  },
  {
    name: "Slate Rose",
    bg: "bg-[#FFF1F2]",
    text: "text-[#9F1239]",
    border: "border-[#FECDD3]",
  },
  {
    name: "Deep Violet",
    bg: "bg-[#F5F3FF]",
    text: "text-[#5B21B6]",
    border: "border-[#DDD6FE]",
  },
  {
    name: "Oceanic Teal",
    bg: "bg-[#F0FDFA]",
    text: "text-[#115E59]",
    border: "border-[#99F6E4]",
  },
  {
    name: "Midnight Sky",
    bg: "bg-[#F0F9FF]",
    text: "text-[#075985]",
    border: "border-[#BAE6FD]",
  },
  {
    name: "Bronze Stone",
    bg: "bg-[#F5F5F4]",
    text: "text-[#44403C]",
    border: "border-[#D6D3D1]",
  },
] as const;

/**
 * Algoritma String Hashing Deterministik (DJB2 Variant):
 * Menjamin pengguna yang sama selalu memiliki warna khas yang konsisten,
 * sedangkan pengguna berbeda akan mendapatkan warna yang bervariasi secara otomatis.
 */
export function getAvatarColor(seedString: string) {
  if (!seedString) {
    return AVATAR_COLOR_PALETTES[0];
  }

  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0; // Convert ke 32-bit integer
  }

  const index = Math.abs(hash) % AVATAR_COLOR_PALETTES.length;
  return AVATAR_COLOR_PALETTES[index];
}

/**
 * Ekstraksi Inisial Cerdas:
 * - "Italiahizhl Uang" -> "IU"
 * - "Budi Santoso" -> "BS"
 * - "admin@gmail.com" -> "A"
 */
export function getInitials(
  name?: string | null,
  email?: string | null,
): string {
  const cleanName = name?.trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, Math.min(cleanName.length, 2)).toUpperCase();
  }

  const cleanEmail = email?.trim()?.split("@")[0];
  if (cleanEmail) {
    const parts = cleanEmail.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanEmail.slice(0, Math.min(cleanEmail.length, 2)).toUpperCase();
  }

  return "U";
}

/**
 * Resolver URL Foto Profil:
 * Menangani URL eksternal (Google OAuth) secara langsung tanpa lewat proxy yang memicu 404,
 * dan mengarahkan file lokal ke API storage yang tepat.
 */
export function resolveAvatarUrl(image?: string | null): string | null {
  if (!image) return null;

  // Jika URL eksternal (Google OAuth / https://lh3.googleusercontent.com)
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Jika file lokal yang diupload ke storage
  return `/api/profile-image?v=${encodeURIComponent(image)}`;
}

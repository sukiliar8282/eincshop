"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getAvatarColor,
  getInitials,
  resolveAvatarUrl,
} from "@/lib/format/avatar";

export interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: {
    container: "h-7 w-7 text-[11px]",
    dimension: 28,
  },
  md: {
    container: "h-9 w-9 text-xs",
    dimension: 36,
  },
  lg: {
    container: "h-11 w-11 text-sm",
    dimension: 44,
  },
  xl: {
    container: "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl",
    dimension: 96,
  },
};

/**
 * Komponen Avatar Cerdas & Self-Healing:
 * Menampilkan foto profil asli, dan jika URL rusak/404, secara mulus beralih ke
 * inisial nama dengan palet warna deterministik (tiap profil berbeda warna).
 */
export function UserAvatar({
  name,
  email,
  image,
  size = "md",
  className = "",
  priority = false,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initialText = getInitials(name, email);
  const colorTheme = getAvatarColor(name || email || "default");
  const rawUrl = resolveAvatarUrl(image);
  const currentSize = sizeConfig[size];

  const showImage = Boolean(rawUrl && !hasError);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border ${colorTheme.border} ${currentSize.container} ${className}`}
    >
      {showImage && rawUrl ? (
        <Image
          src={rawUrl}
          alt="" // Dikosongkan agar browser tidak merender teks alt jika loading gagal
          width={currentSize.dimension}
          height={currentSize.dimension}
          unoptimized
          priority={priority}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-300"
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center font-bold tracking-tight uppercase select-none ${colorTheme.bg} ${colorTheme.text}`}
        >
          {initialText}
        </span>
      )}
    </div>
  );
}

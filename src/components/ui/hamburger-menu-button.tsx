"use client";

import React, { useState } from "react";

export interface HamburgerMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Status open/close yang dikontrol dari luar */
  isOpen?: boolean;
  /** Fungsi pengubah state dari luar */
  setIsOpen?: (isOpen: boolean) => void;
  /** ID elemen menu yang dikontrol untuk aksesibilitas ARIA */
  ariaControls?: string;
  /** Custom class untuk wrapper tombol */
  className?: string;
}

export function HamburgerMenuButton({
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  ariaControls,
  className = "",
  onClick,
  ...props
}: HamburgerMenuButtonProps) {
  // Mendukung mode mandiri (internal state) jika props tidak dipassing
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = externalIsOpen !== undefined;
  const open = isControlled ? externalIsOpen : internalIsOpen;

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextState = !open;
    if (isControlled) {
      externalSetIsOpen?.(nextState);
    } else {
      setInternalIsOpen(nextState);
    }
    onClick?.(e);
  };

  // Garis dasar: tebal 2px (h-0.5), lebar 20px (w-5), rounded, transisi 300ms ease-in-out
  const lineStyle =
    "block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-expanded={open}
      aria-controls={ariaControls}
      aria-label="Toggle navigation"
      className={`group relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-colors active:scale-95 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 hover:bg-[var(--color-surface-muted)] ${className}`}
      {...props}
    >
      {/* Container garis dengan tinggi 16px untuk menghasilkan titik potong silang 'X' yang presisi */}
      <span
        className="relative flex h-4 w-5 flex-col justify-between items-center pointer-events-none"
        aria-hidden="true"
      >
        {/* Garis 1 (Atas): Meluncur 7px ke bawah lalu rotasi 45 derajat */}
        <span
          className={`${lineStyle} ${
            open ? "translate-y-[7px] rotate-45" : "translate-y-0 rotate-0"
          }`}
        />

        {/* Garis 2 (Tengah): Geser sedikit lalu memudar halus (opacity 0) */}
        <span
          className={`${lineStyle} ${
            open ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100"
          }`}
        />

        {/* Garis 3 (Bawah): Meluncur 7px ke atas lalu rotasi -45 derajat */}
        <span
          className={`${lineStyle} ${
            open ? "-translate-y-[7px] -rotate-45" : "-translate-y-0 rotate-0"
          }`}
        />
      </span>
    </button>
  );
}

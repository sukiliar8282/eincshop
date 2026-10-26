"use client";

import { useState, useRef, useEffect } from "react";

export type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  id?: string;
  name: string;
  options: DropdownOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
};

export function CustomDropdown({
  id,
  name,
  options,
  defaultValue = "",
  value: controlledValue,
  onChange,
  placeholder,
  className = "",
  ariaLabel,
}: CustomDropdownProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    isControlled ? controlledValue : defaultValue,
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue = isControlled ? controlledValue : internalValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);
  const displayText =
    selectedOption?.label || placeholder || (options[0]?.label ?? "");

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
    setIsOpen(false);
  };

  // Menutup dropdown otomatis jika pengguna mengeklik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Menutup dropdown saat tombol Escape ditekan
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`relative min-w-0 w-full select-none ${className}`}
    >
      {/* Hidden input agar form HTML / Server Action mengenali data input */}
      <input type="hidden" id={id} name={name} value={currentValue} />

      {/* Tombol Trigger Dropdown Kustom */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayText}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-left text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus:border-[var(--color-ink)] focus:outline-none cursor-pointer"
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--color-ink)]" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Menu Pilihan Kustom (Sama bersih seperti tampilan Windows) */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[200px] overflow-auto rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white py-1 shadow-[var(--shadow-card)]"
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-[var(--color-surface-muted)] font-semibold text-[var(--color-ink)]"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]/70"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--color-ink)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

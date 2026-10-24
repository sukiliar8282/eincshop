"use client";

import { useState, type KeyboardEvent } from "react";

type TechStackInputProps = {
  initialValues?: string[];
  isEn?: boolean;
};

const PRESET_STACKS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Prisma",
  "Figma",
  "Node.js",
  "PostgreSQL",
  "Stripe",
  "Supabase",
];

export function TechStackInput({
  initialValues = [],
  isEn = false,
}: TechStackInputProps) {
  const [selectedStacks, setSelectedStacks] = useState<string[]>(initialValues);
  const [customInput, setCustomInput] = useState("");

  const toggleStack = (tech: string) => {
    setSelectedStacks((prev) =>
      prev.includes(tech)
        ? prev.filter((item) => item !== tech)
        : [...prev, tech],
    );
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (
      !selectedStacks.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      setSelectedStacks((prev) => [...prev, trimmed]);
    }
    setCustomInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const removeStack = (tech: string) => {
    setSelectedStacks((prev) => prev.filter((item) => item !== tech));
  };

  return (
    <div className="rounded-xl border border-[var(--color-line-strong)] bg-neutral-50/50 p-4 sm:p-5">
      <div className="mb-3">
        <label className="block text-sm font-semibold text-[var(--color-ink)]">
          {isEn ? "Tech Stack & Frameworks" : "Teknologi & Framework"}
        </label>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {isEn
            ? "Select frameworks used by this product or type custom ones. This syncs directly with the catalog filters."
            : "Pilih teknologi yang digunakan produk ini atau ketik baru. Pilihan ini otomatis tersinkron dengan filter katalog depan."}
        </p>
      </div>

      {/* Hidden inputs untuk FormData submit ke Server Action */}
      {selectedStacks.map((tech) => (
        <input key={tech} type="hidden" name="techStack" value={tech} />
      ))}

      {/* Quick Select Presets */}
      <div className="mb-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] mb-2 block">
          {isEn ? "Popular Stacks:" : "Pilihan Populer:"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_STACKS.map((tech) => {
            const isSelected = selectedStacks.includes(tech);
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleStack(tech)}
                className={`rounded-full border px-3 py-1 font-mono text-xs transition-all ${
                  isSelected
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] !text-white text-white! font-semibold shadow-xs"
                    : "border-[var(--color-line-strong)] bg-white text-neutral-700 hover:border-neutral-900 hover:text-[var(--color-ink)]"
                }`}
              >
                {tech}
                {isSelected && <span className="ml-1.5 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Custom Tag */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isEn
                ? "e.g. Astro, Vue 3, Docker, Laravel, Python (press Enter)"
                : "contoh: Astro, Vue 3, Docker, Laravel, Python (tekan Enter)"
            }
            maxLength={40}
            className="min-h-10 flex-1 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-xs focus:border-[var(--color-ink)] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="min-h-10 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-xs font-semibold !text-white text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-95"
          >
            {isEn ? "+ Add" : "+ Tambah"}
          </button>
        </div>

        {/* Selected Tech Stack Badges */}
        {selectedStacks.length > 0 && (
          <div className="pt-2 border-t border-[var(--color-line)]">
            <span className="text-[11px] font-medium text-[var(--color-text-muted)] mb-2 block">
              {isEn
                ? "Selected Stacks (will be saved):"
                : "Teknologi Terpilih (akan disimpan):"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedStacks.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1 font-mono text-xs font-medium text-[var(--color-ink)] shadow-2xs"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => removeStack(tech)}
                    aria-label={`Hapus ${tech}`}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

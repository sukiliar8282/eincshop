import type { Locale } from "./config";

export interface LocalizedProductData {
  title: string;
  description: string;
}

// Kamus terjemahan katalog digital goods bawaan
const CATALOG_TRANSLATIONS: Record<
  string,
  {
    en: LocalizedProductData;
    id: LocalizedProductData;
  }
> = {
  "focus-planner": {
    id: {
      title: "Focus Planner",
      description:
        "Template perencanaan mingguan untuk membantu menyusun prioritas, jadwal, dan target kerja.",
    },
    en: {
      title: "Focus Planner",
      description:
        "A structured weekly planning template engineered to align daily priorities, schedules, and career goals.",
    },
  },
  "simple-business-proposal": {
    id: {
      title: "Simple Business Proposal",
      description:
        "Template proposal bisnis yang rapi untuk presentasi ide, layanan, dan kerja sama profesional.",
    },
    en: {
      title: "Simple Business Proposal",
      description:
        "A polished business proposal template crafted for pitching ideas, consulting services, and client contracts.",
    },
  },
  "sora-mobile-ui-kit": {
    id: {
      title: "Sora Mobile UI Kit",
      description:
        "Kumpulan komponen UI mobile dengan struktur yang mudah disesuaikan untuk berbagai produk digital.",
    },
    en: {
      title: "Sora Mobile UI Kit",
      description:
        "A production-ready mobile UI kit featuring versatile, modular layouts built for rapid iOS and Android app prototyping.",
    },
  },
  "neutral-dashboard-kit": {
    id: {
      title: "Neutral Dashboard Kit",
      description:
        "UI kit dashboard dengan komponen navigasi, tabel, kartu statistik, dan halaman pengaturan.",
    },
    en: {
      title: "Neutral Dashboard Kit",
      description:
        "A clean enterprise dashboard UI kit complete with navigation bars, data tables, metrics cards, and settings panels.",
    },
  },
  "kerja-fokus-tanpa-ribet": {
    id: {
      title: "Kerja Fokus Tanpa Ribet",
      description:
        "Panduan praktis untuk menyusun sistem kerja yang lebih fokus, sederhana, dan mudah dipertahankan.",
    },
    en: {
      title: "Focus-Driven Workflow Guide",
      description:
        "A battle-tested handbook on designing distraction-free, minimalist daily systems that stick.",
    },
  },
  "dasar-membangun-produk-digital": {
    id: {
      title: "Dasar Membangun Produk Digital",
      description:
        "Panduan untuk memahami proses riset, validasi, desain, dan peluncuran produk digital pertama.",
    },
    en: {
      title: "Digital Product Foundations",
      description:
        "The complete founder roadmap covering user research, MVP validation, UX design, and go-to-market launch.",
    },
  },
  "next-commerce-starter": {
    id: {
      title: "Next Commerce Starter",
      description:
        "Fondasi Next.js untuk membangun katalog produk, autentikasi, cart, dan checkout sederhana.",
    },
    en: {
      title: "Next Commerce Starter",
      description:
        "An enterprise-ready Next.js boilerplate featuring authentication, dynamic catalog, shopping cart, and payment gateway.",
    },
  },
  "clean-landing-starter": {
    id: {
      title: "Clean Landing Starter",
      description:
        "Starter code landing page responsif dengan struktur komponen yang mudah dikembangkan.",
    },
    en: {
      title: "Clean Landing Starter",
      description:
        "A high-converting, responsive landing page starter codebase built with modular architecture and clean Tailwind CSS.",
    },
  },
};

const CATEGORY_TRANSLATIONS: Record<string, { id: string; en: string }> = {
  templates: { id: "Template", en: "Templates" },
  template: { id: "Template", en: "Templates" },
  "ui-kit": { id: "UI Kit", en: "UI Kits" },
  ebooks: { id: "Ebook", en: "E-Books" },
  ebook: { id: "Ebook", en: "E-Books" },
  code: { id: "Code Starter", en: "Code Starters" },
  "category-templates": { id: "Template", en: "Templates" },
  "category-ui-kit": { id: "UI Kit", en: "UI Kits" },
  "category-ebooks": { id: "Ebook", en: "E-Books" },
  "category-code": { id: "Code Starter", en: "Code Starters" },
};

/**
 * Defensive Localization for Product Entities:
 * Mengganti title, description, dan category name secara cerdas saat locale="en".
 * Jika produk custom buatan admin yang belum terdaftar di kamus, data database asli tetap aman ditampilkan.
 */
export function localizeProduct<
  T extends {
    slug: string;
    title?: string;
    description?: string;
    category?: { name: string; slug?: string } | null;
  },
>(product: T, locale: Locale | string): T {
  const isEn = locale === "en" || locale === "en-US";
  if (!isEn) return product;

  const translation = CATALOG_TRANSLATIONS[product.slug]?.en;
  const categorySlug = product.category?.slug?.toLowerCase();
  const categoryName = product.category?.name?.toLowerCase();
  const translatedCategoryName = categorySlug
    ? CATEGORY_TRANSLATIONS[categorySlug]?.en
    : categoryName
      ? CATEGORY_TRANSLATIONS[categoryName]?.en
      : undefined;

  return {
    ...product,
    title: translation?.title ?? product.title,
    description: translation?.description ?? product.description,
    ...(product.category
      ? {
          category: {
            ...product.category,
            name: translatedCategoryName ?? product.category.name,
          },
        }
      : {}),
  };
}

/**
 * Localize Category Name
 */
export function localizeCategoryName(
  slugOrName: string,
  fallbackName: string,
  locale: Locale | string,
): string {
  const isEn = locale === "en" || locale === "en-US";
  if (!isEn) return fallbackName;

  const key = slugOrName.toLowerCase();
  return CATEGORY_TRANSLATIONS[key]?.en ?? fallbackName;
}

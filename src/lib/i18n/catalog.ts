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
        "A minimal, performance-first landing page starter built with Next.js 16 and Tailwind CSS v4.",
    },
  },
};

const CATEGORY_TRANSLATIONS: Record<string, { en: string; id: string }> = {
  templates: { en: "Templates", id: "Template" },
  template: { en: "Templates", id: "Template" },
  "ui-kit": { en: "UI Kits", id: "UI Kit" },
  ebooks: { en: "E-Books", id: "Ebook" },
  ebook: { en: "E-Books", id: "Ebook" },
  code: { en: "Source Code", id: "Kode" },
};

/**
 * Localize Product Data
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

/**
 * Mencari slug produk yang cocok dengan kata kunci pencarian pada judul atau deskripsi terjemahan
 */
export function getProductSlugsByTranslationQuery(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matchedSlugs: string[] = [];

  for (const [slug, data] of Object.entries(CATALOG_TRANSLATIONS)) {
    const inEn =
      data.en.title.toLowerCase().includes(q) ||
      data.en.description.toLowerCase().includes(q);
    const inId =
      data.id.title.toLowerCase().includes(q) ||
      data.id.description.toLowerCase().includes(q);

    if (inEn || inId) {
      matchedSlugs.push(slug);
    }
  }

  return matchedSlugs;
}
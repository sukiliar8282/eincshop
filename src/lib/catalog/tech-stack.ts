// Pemetaan stack teknologi terkurasi untuk produk bawaan
const CURATED_TECH_STACKS: Record<string, string[]> = {
  "clean-landing-starter": ["Next.js 16", "Tailwind CSS v4", "TypeScript"],
  "next-commerce-starter": ["Next.js", "Prisma", "PostgreSQL", "Midtrans"],
  "sora-mobile-ui-kit": ["Figma", "React Native", "Mobile UI"],
  "neutral-dashboard-kit": ["React", "Tailwind CSS", "Dashboard UI"],
  "focus-planner": ["Notion", "Productivity System", "PDF"],
  "simple-business-proposal": ["Figma", "Pitch Deck", "Vector"],
  "kerja-fokus-tanpa-ribet": ["Ebook", "Workflow Guide", "Markdown"],
  "dasar-membangun-produk-digital": ["Ebook", "Product Strategy", "Roadmap"],
};

// Daftar kata kunci teknologi yang dipindai otomatis dari deskripsi produk baru seller
const KNOWN_TECH_KEYWORDS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Prisma",
  "PostgreSQL",
  "Supabase",
  "Figma",
  "React Native",
  "Flutter",
  "Python",
  "FastAPI",
  "Vue",
  "Docker",
  "REST API",
];

export const POPULAR_TECH_FILTERS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Figma",
  "Prisma",
];

export function getProductTechStack(
  slug: string,
  description?: string,
  title?: string,
): string[] {
  // 1. Cek kurasi manual berdasarkan slug
  if (CURATED_TECH_STACKS[slug]) {
    return CURATED_TECH_STACKS[slug];
  }

  // 2. Ekstraksi otomatis dari judul dan deskripsi produk
  const content = `${title ?? ""} ${description ?? ""}`.toLowerCase();
  const matched = new Set<string>();

  for (const keyword of KNOWN_TECH_KEYWORDS) {
    const escaped = keyword.replace(".", "\\.");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(content)) {
      matched.add(keyword);
    }
  }

  const result = Array.from(matched);
  return result.length > 0 ? result.slice(0, 4) : ["Digital Asset"];
}

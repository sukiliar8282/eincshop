BEGIN;

-- Sembunyikan produk testing lama dari katalog publik
UPDATE products
SET
  status = 'ARCHIVED',
  "updatedAt" = NOW()
WHERE status = 'PUBLISHED';

-- Buat atau perbarui kategori
INSERT INTO categories (
  id,
  name,
  slug,
  description,
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'category-templates',
    'Template',
    'templates',
    'Template siap pakai untuk kebutuhan kerja dan bisnis.',
    NOW(),
    NOW()
  ),
  (
    'category-ui-kit',
    'UI Kit',
    'ui-kit',
    'Komponen antarmuka untuk mempercepat proses desain produk digital.',
    NOW(),
    NOW()
  ),
  (
    'category-ebooks',
    'Ebook',
    'ebooks',
    'Panduan praktis untuk meningkatkan proses kerja dan kreativitas.',
    NOW(),
    NOW()
  ),
  (
    'category-code',
    'Code Starter',
    'code',
    'Starter code dan fondasi teknis untuk membangun produk digital.',
    NOW(),
    NOW()
  )
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "isActive" = true,
  "updatedAt" = NOW();

-- Buat atau perbarui produk fiksi
INSERT INTO products (
  id,
  "categoryId",
  title,
  slug,
  description,
  "productType",
  status,
  "priceMinor",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'fictional-product-01',
    'category-templates',
    'Focus Planner',
    'focus-planner',
    'Template perencanaan mingguan untuk membantu menyusun prioritas, jadwal, dan target kerja.',
    'DIGITAL',
    'PUBLISHED',
    49000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-02',
    'category-templates',
    'Simple Business Proposal',
    'simple-business-proposal',
    'Template proposal bisnis yang rapi untuk presentasi ide, layanan, dan kerja sama profesional.',
    'DIGITAL',
    'PUBLISHED',
    59000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-03',
    'category-ui-kit',
    'Sora Mobile UI Kit',
    'sora-mobile-ui-kit',
    'Kumpulan komponen UI mobile dengan struktur yang mudah disesuaikan untuk berbagai produk digital.',
    'DIGITAL',
    'PUBLISHED',
    79000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-04',
    'category-ui-kit',
    'Neutral Dashboard Kit',
    'neutral-dashboard-kit',
    'UI kit dashboard dengan komponen navigasi, tabel, kartu statistik, dan halaman pengaturan.',
    'DIGITAL',
    'PUBLISHED',
    89000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-05',
    'category-ebooks',
    'Kerja Fokus Tanpa Ribet',
    'kerja-fokus-tanpa-ribet',
    'Panduan praktis untuk menyusun sistem kerja yang lebih fokus, sederhana, dan mudah dipertahankan.',
    'DIGITAL',
    'PUBLISHED',
    39000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-06',
    'category-ebooks',
    'Dasar Membangun Produk Digital',
    'dasar-membangun-produk-digital',
    'Panduan untuk memahami proses riset, validasi, desain, dan peluncuran produk digital pertama.',
    'DIGITAL',
    'PUBLISHED',
    45000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-07',
    'category-code',
    'Next Commerce Starter',
    'next-commerce-starter',
    'Fondasi Next.js untuk membangun katalog produk, autentikasi, cart, dan checkout sederhana.',
    'DIGITAL',
    'PUBLISHED',
    149000,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'fictional-product-08',
    'category-code',
    'Clean Landing Starter',
    'clean-landing-starter',
    'Starter code landing page responsif dengan struktur komponen yang mudah dikembangkan.',
    'DIGITAL',
    'PUBLISHED',
    99000,
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (slug)
DO UPDATE SET
  "categoryId" = EXCLUDED."categoryId",
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "productType" = EXCLUDED."productType",
  status = EXCLUDED.status,
  "priceMinor" = EXCLUDED."priceMinor",
  "publishedAt" = EXCLUDED."publishedAt",
  "updatedAt" = NOW();

COMMIT;
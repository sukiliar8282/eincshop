BEGIN;

DELETE FROM product_images
WHERE "productId" IN (
  'fictional-product-01',
  'fictional-product-02',
  'fictional-product-03',
  'fictional-product-04',
  'fictional-product-05',
  'fictional-product-06',
  'fictional-product-07',
  'fictional-product-08'
);

INSERT INTO product_images (
  id,
  "productId",
  "storageKey",
  url,
  "altText",
  "sortOrder"
)
VALUES
  (
    'fictional-image-01',
    'fictional-product-01',
    'catalog/focus-planner.jpeg',
    '/catalog/focus-planner.jpeg',
    'Cover Focus Planner',
    0
  ),
  (
    'fictional-image-02',
    'fictional-product-02',
    'catalog/simple-business-proposal.jpeg',
    '/catalog/simple-business-proposal.jpeg',
    'Cover Simple Business Proposal',
    0
  ),
  (
    'fictional-image-03',
    'fictional-product-03',
    'catalog/sora-mobile-ui-kit.jpeg',
    '/catalog/sora-mobile-ui-kit.jpeg',
    'Cover Sora Mobile UI Kit',
    0
  ),
  (
    'fictional-image-04',
    'fictional-product-04',
    'catalog/neutral-dashboard-kit.jpeg',
    '/catalog/neutral-dashboard-kit.jpeg',
    'Cover Neutral Dashboard Kit',
    0
  ),
  (
    'fictional-image-05',
    'fictional-product-05',
    'catalog/kerja-fokus-tanpa-ribet.jpeg',
    '/catalog/kerja-fokus-tanpa-ribet.jpeg',
    'Cover Kerja Fokus Tanpa Ribet',
    0
  ),
  (
    'fictional-image-06',
    'fictional-product-06',
    'catalog/dasar-membangun-produk-digital.jpeg',
    '/catalog/dasar-membangun-produk-digital.jpeg',
    'Cover Dasar Membangun Produk Digital',
    0
  ),
  (
    'fictional-image-07',
    'fictional-product-07',
    'catalog/next-commerce-starter.jpeg',
    '/catalog/next-commerce-starter.jpeg',
    'Cover Next Commerce Starter',
    0
  ),
  (
    'fictional-image-08',
    'fictional-product-08',
    'catalog/clean-landing-starter.jpeg',
    '/catalog/clean-landing-starter.jpeg',
    'Cover Clean Landing Starter',
    0
  );

COMMIT;
BEGIN;

UPDATE products
SET
  status = 'ARCHIVED',
  "updatedAt" = NOW()
WHERE status <> 'ARCHIVED';

COMMIT;
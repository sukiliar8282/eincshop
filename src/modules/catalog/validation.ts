import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug tidak valid."),
});

export const productSchema = z.object({
  categoryId: z.string().cuid(),
  title: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug tidak valid."),
  description: z.string().trim().min(20).max(5000),
  priceIdr: z.coerce.number().int().min(0).max(2_000_000_000),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;

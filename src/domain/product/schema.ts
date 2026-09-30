import { z } from "zod";

export const identityLockSchema = z.enum([
  "silhouette",
  "cap",
  "label",
  "logo",
  "product_color",
  "material_finish",
]);

export const productIntelligenceSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().min(1),
  visual: z.object({
    primaryColor: z.string().min(1),
    secondaryColor: z.string().min(1),
    materials: z.array(z.string().min(1)).min(1).max(6),
    form: z.string().min(1),
    finish: z.array(z.string().min(1)).min(1).max(6),
  }),
  perception: z.array(z.string().min(1)).min(2).max(6),
  identityLocks: z.array(identityLockSchema).min(1),
  summary: z.string().min(20).max(400),
  confidence: z.object({
    category: z.number().min(0).max(1),
    materials: z.number().min(0).max(1),
  }),
});

export type ProductIntelligence = z.infer<typeof productIntelligenceSchema>;

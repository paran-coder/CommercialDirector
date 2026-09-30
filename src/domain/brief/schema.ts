import { z } from "zod";

export const creativeBriefSchema = z.object({
  brandPersonality: z.array(z.string().min(1)).min(1).max(3),
  audience: z.object({
    age: z.string().min(1),
    gender: z.string().min(1),
    context: z.string().min(1),
  }),
  coreBenefit: z.string().min(2),
  emotionalBenefit: z.string().min(2),
  mood: z.array(z.string().min(1)).min(1).max(4),
  occasion: z.string().min(1),
  constraints: z.array(z.string()),
});

export type CreativeBrief = z.infer<typeof creativeBriefSchema>;

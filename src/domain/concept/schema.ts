import { z } from "zod";

export const executionTypeSchema = z.enum([
  "narrative",
  "product_spectacle",
  "character",
  "sensory",
  "social",
]);

export const conceptSchema = z.object({
  id: z.string().min(1),
  territoryId: z.string().min(1),
  executionType: executionTypeSchema,
  title: z.string().min(2).max(70),
  hook: z.string().min(4).max(160),
  idea: z.string().min(20).max(650),
  productRole: z.string().min(10).max(300),
  audienceTakeaway: z.string().min(6).max(220),
  primaryDuration: z.union([z.literal(6), z.literal(15), z.literal(30), z.literal(45)]),
  treatment15s: z.array(z.object({
    time: z.string().min(2),
    beat: z.string().min(4).max(220),
  })).min(3).max(6),
  requirements: z.object({
    hero: z.boolean(),
    locations: z.array(z.string()).max(4),
    props: z.array(z.string()).max(6),
    vfx: z.array(z.string()).max(4),
  }),
  pro: z.object({
    creativeRationale: z.string().min(20).max(500),
    camera: z.array(z.string()).max(6),
    lighting: z.array(z.string()).max(6),
    continuity: z.array(z.string()).max(8),
  }),
});

export const conceptBatchSchema = z.object({
  concepts: z.array(conceptSchema).length(5),
});

export type ExecutionType = z.infer<typeof executionTypeSchema>;
export type Concept = z.infer<typeof conceptSchema>;

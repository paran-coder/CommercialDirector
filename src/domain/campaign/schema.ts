import { z } from "zod";

export const campaignBibleSchema = z.object({
  campaignName: z.string().min(2).max(80),
  campaignIdea: z.object({
    statement: z.string().min(10).max(160),
    promise: z.string().min(10).max(220),
  }),
  audienceSummary: z.string().min(10).max(300),
  visualWorld: z.object({
    keywords: z.array(z.string()).min(3).max(8),
    avoid: z.array(z.string()).min(1).max(8),
  }),
  hero: z.object({
    persona: z.string().min(2),
    ageRange: z.string().min(2),
    styling: z.string().min(2),
  }),
  locations: z.array(z.string()).min(3).max(6),
  props: z.array(z.string()).min(2).max(8),
  productBehavior: z.array(z.string()).min(3).max(8),
  cameraLanguage: z.array(z.string()).min(2).max(6),
  lighting: z.array(z.string()).min(2).max(6),
  palette: z.array(z.string()).min(3).max(8),
  soundLanguage: z.array(z.string()).min(1).max(6),
});

export const territorySchema = z.object({
  id: z.string().min(1),
  slot: z.number().int().min(1).max(4),
  title: z.string().min(2).max(60),
  premise: z.string().min(10).max(180),
  description: z.string().min(20).max(420),
});

export const territoryBatchSchema = z.object({
  territories: z.array(territorySchema).length(4),
});

export type CampaignBible = z.infer<typeof campaignBibleSchema>;
export type Territory = z.infer<typeof territorySchema>;

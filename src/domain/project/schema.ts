import { z } from "zod";
import { creativeBriefSchema } from "@/domain/brief/schema";
import { campaignBibleSchema, territorySchema } from "@/domain/campaign/schema";
import { conceptSchema } from "@/domain/concept/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";

export const campaignRevisionSchema = z.object({
  revision: z.number().int().positive(),
  bible: campaignBibleSchema,
  territories: z.array(territorySchema).length(4),
  concepts: z.array(conceptSchema).length(20),
  createdAt: z.string().min(1),
});

export const conceptRevisionSchema = z.object({
  conceptId: z.string().min(1),
  revision: z.number().int().positive(),
  instruction: z.string().min(1),
  data: conceptSchema,
  createdAt: z.string().min(1),
});

export const localProjectSnapshotSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1),
  brandName: z.string().min(1),
  productName: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  product: productIntelligenceSchema.optional(),
  brief: creativeBriefSchema.optional(),
  bible: campaignBibleSchema.optional(),
  territories: z.array(territorySchema).length(4).optional(),
  concepts: z.array(conceptSchema).length(20).optional(),
  shortlist: z.array(z.string()).default([]),
  campaignRevisions: z.array(campaignRevisionSchema).default([]),
  conceptRevisions: z.array(conceptRevisionSchema).default([]),
});

export const projectRuntimePatchSchema = z.object({
  brandName: z.string().min(1).max(120).optional(),
  productName: z.string().min(1).max(160).optional(),
  product: productIntelligenceSchema.optional(),
  brief: creativeBriefSchema.optional(),
});

export const campaignRevisionDataSchema = z.object({
  bible: campaignBibleSchema,
  territories: z.array(territorySchema).length(4),
  concepts: z.array(conceptSchema).length(20),
});

export type LocalProjectSnapshot = z.infer<typeof localProjectSnapshotSchema>;
export type ProjectSnapshot = LocalProjectSnapshot;
export type ProjectRuntimePatch = z.infer<typeof projectRuntimePatchSchema>;
export type CampaignRevisionData = z.infer<typeof campaignRevisionDataSchema>;

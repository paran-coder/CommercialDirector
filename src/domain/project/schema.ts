import { z } from "zod";
import { creativeBriefSchema } from "@/domain/brief/schema";
import { campaignBibleSchema, territorySchema } from "@/domain/campaign/schema";
import { conceptSchema } from "@/domain/concept/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";
import { assetBibleSchema } from "@/domain/assets/schema";
import { productionPlanSchema } from "@/domain/production/schema";

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

export const assetBibleRevisionSchema = z.object({
  revision: z.number().int().positive(),
  sourceCampaignRevision: z.number().int().positive(),
  sourceConceptKeys: z.array(z.string().min(1)).min(1).max(5),
  data: assetBibleSchema,
  createdAt: z.string().min(1),
});

export const productionPlanRevisionSchema = z.object({
  revision: z.number().int().positive(),
  sourceCampaignRevision: z.number().int().positive(),
  sourceAssetBibleRevision: z.number().int().positive(),
  sourceConceptKeys: z.array(z.string().min(1)).min(1).max(5),
  sourceConceptRevisions: z.record(z.string(), z.number().int().positive()),
  data: productionPlanSchema,
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
  assetBible: assetBibleSchema.optional(),
  assetBibleRevisions: z.array(assetBibleRevisionSchema).default([]),
  productionPlan: productionPlanSchema.optional(),
  productionPlanRevisions: z.array(productionPlanRevisionSchema).default([]),
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

export function isAssetBibleCurrent(project: ProjectSnapshot) {
  const latest = project.assetBibleRevisions.at(-1);
  if (!latest || !project.assetBible) return false;
  const campaignRevision = project.campaignRevisions.at(-1)?.revision;
  if (campaignRevision !== latest.sourceCampaignRevision) return false;
  const current = [...new Set(project.shortlist)].sort();
  const source = [...new Set(latest.sourceConceptKeys)].sort();
  return current.length === source.length && current.every((id, index) => id === source[index]);
}


export function getConceptRevisionSnapshot(project: ProjectSnapshot, conceptKeys = project.shortlist) {
  const snapshot: Record<string, number> = {};
  for (const key of [...new Set(conceptKeys)]) {
    const revisions = project.conceptRevisions
      .filter((item) => item.conceptId === key)
      .map((item) => item.revision);
    snapshot[key] = Math.max(1, ...revisions);
  }
  return snapshot;
}

export function isProductionPlanCurrent(project: ProjectSnapshot) {
  if (!isAssetBibleCurrent(project)) return false;
  const latest = project.productionPlanRevisions.at(-1);
  if (!latest || !project.productionPlan) return false;
  const campaignRevision = project.campaignRevisions.at(-1)?.revision;
  const assetRevision = project.assetBibleRevisions.at(-1)?.revision;
  if (campaignRevision !== latest.sourceCampaignRevision) return false;
  if (assetRevision !== latest.sourceAssetBibleRevision) return false;
  const current = [...new Set(project.shortlist)].sort();
  const source = [...new Set(latest.sourceConceptKeys)].sort();
  if (current.length !== source.length || !current.every((id, index) => id === source[index])) return false;
  const currentRevisions = getConceptRevisionSnapshot(project, source);
  return source.every((key) => currentRevisions[key] === latest.sourceConceptRevisions[key]);
}

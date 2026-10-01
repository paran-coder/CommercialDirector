import { z } from "zod";

export const heroApplicabilitySchema = z.enum(["required", "optional", "none"]);

const textList = (min: number, max: number) => z.array(z.string().min(2).max(180)).min(min).max(max);
const conceptRefsSchema = z.array(z.string().min(1)).min(1).max(5);

export const productSheetDraftSchema = z.object({
  identityStatement: z.string().min(20).max(420),
  preserve: textList(3, 12),
  formRules: textList(2, 8),
  materialsAndSurface: textList(2, 8),
  colorAndMarkingRules: textList(2, 8),
  scaleAndHandling: textList(1, 6),
  heroAngles: textList(2, 6),
  avoid: textList(2, 10),
  continuityLocks: textList(3, 12),
});

export const heroDraftSchema = z.object({
  applicability: heroApplicabilitySchema,
  role: z.string().min(8).max(260),
  castingDirection: z.string().min(8).max(320),
  appearanceAndGrooming: z.string().min(8).max(320),
  performanceDirection: z.string().min(8).max(320),
  relationshipToProduct: z.string().min(8).max(320),
  continuityLocks: textList(2, 10),
  conceptRefs: conceptRefsSchema,
});

export const wardrobeDraftSchema = z.object({
  label: z.string().min(2).max(80),
  silhouette: z.string().min(8).max(260),
  materials: textList(1, 8),
  palette: textList(1, 8),
  stylingNotes: textList(1, 8),
  continuityLocks: textList(1, 8),
  conceptRefs: conceptRefsSchema,
});

export const locationDraftSchema = z.object({
  label: z.string().min(2).max(80),
  environmentType: z.string().min(4).max(120),
  spatialDescription: z.string().min(12).max(360),
  materials: textList(1, 8),
  palette: textList(1, 8),
  lightingWindow: z.string().min(4).max(160),
  practicalCues: textList(1, 8),
  continuityLocks: textList(1, 8),
  conceptRefs: conceptRefsSchema,
});

export const propDraftSchema = z.object({
  label: z.string().min(2).max(80),
  productionRole: z.string().min(8).max(260),
  materialAndFinish: z.string().min(4).max(220),
  palette: textList(1, 6),
  handlingAndUse: z.string().min(6).max(260),
  placementAndStaging: z.string().min(6).max(260),
  continuityLocks: textList(1, 8),
  conceptRefs: conceptRefsSchema,
});

export const productSheetGenerationSchema = z.object({
  productSheet: productSheetDraftSchema,
});

export const castingStylingGenerationSchema = z.object({
  hero: heroDraftSchema,
  wardrobe: z.array(wardrobeDraftSchema).max(4),
});

export const productionDesignGenerationSchema = z.object({
  locations: z.array(locationDraftSchema).min(3).max(6),
  props: z.array(propDraftSchema).min(2).max(8),
});

export const assetBibleReviewSchema = z.object({
  globalContinuity: z.object({
    rules: textList(3, 12),
    conflicts: z.array(z.string().min(4).max(260)).max(8),
    productionNotes: textList(2, 10),
  }),
  issues: z.array(z.object({
    section: z.enum(["product", "hero", "wardrobe", "locations", "props"]),
    reason: z.string().min(6).max(160),
    repairInstruction: z.string().min(12).max(320),
  })).max(5),
});

export const productSheetSchema = productSheetDraftSchema.extend({
  stableKey: z.literal("product-main"),
});

export const heroSchema = heroDraftSchema.extend({
  stableKey: z.literal("hero-primary"),
});

export const wardrobeSchema = wardrobeDraftSchema.extend({
  stableKey: z.string().regex(/^wardrobe-\d{2}$/),
});

export const locationSchema = locationDraftSchema.extend({
  stableKey: z.string().regex(/^location-\d{2}$/),
});

export const propSchema = propDraftSchema.extend({
  stableKey: z.string().regex(/^prop-\d{2}$/),
});

export const assetBibleSchema = z.object({
  productSheet: productSheetSchema,
  hero: heroSchema,
  wardrobe: z.array(wardrobeSchema).max(4),
  locations: z.array(locationSchema).min(3).max(6),
  props: z.array(propSchema).min(2).max(8),
  globalContinuity: assetBibleReviewSchema.shape.globalContinuity,
});

export type AssetBible = z.infer<typeof assetBibleSchema>;
export type ProductSheetDraft = z.infer<typeof productSheetDraftSchema>;
export type HeroDraft = z.infer<typeof heroDraftSchema>;
export type WardrobeDraft = z.infer<typeof wardrobeDraftSchema>;
export type LocationDraft = z.infer<typeof locationDraftSchema>;
export type PropDraft = z.infer<typeof propDraftSchema>;
export type AssetBibleReview = z.infer<typeof assetBibleReviewSchema>;

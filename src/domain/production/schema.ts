import { z } from "zod";

export const productionDurationSchema = z.union([z.literal(15), z.literal(30), z.literal(45)]);
export const promptProviderSchema = z.enum(["generic", "seedance", "kling", "veo"]);

const textList = (min: number, max: number) => z.array(z.string().min(2).max(220)).min(min).max(max);
const assetRefs = z.array(z.string().min(1)).min(1).max(8);

export const treatmentBeatSchema = z.object({
  start: z.number().min(0).max(45),
  end: z.number().positive().max(45),
  beat: z.string().min(6).max(260),
  productRole: z.string().min(4).max(180),
});

export const treatmentDraftSchema = z.object({
  duration: productionDurationSchema,
  logline: z.string().min(12).max(260),
  pacing: z.string().min(8).max(220),
  beats: z.array(treatmentBeatSchema).min(3).max(12),
});

export const treatmentGenerationSchema = z.object({
  treatments: z.array(treatmentDraftSchema).length(3),
});

export const sceneDraftSchema = z.object({
  slot: z.number().int().min(1).max(12),
  title: z.string().min(2).max(90),
  duration: z.number().positive().max(45),
  storyPurpose: z.string().min(8).max(260),
  action: z.string().min(8).max(360),
  productRole: z.string().min(6).max(260),
  assetRefs,
  continuityIn: textList(1, 8),
  continuityOut: textList(1, 8),
  soundIntent: z.string().min(4).max(220),
});

export const sceneVariantDraftSchema = z.object({
  duration: productionDurationSchema,
  scenes: z.array(sceneDraftSchema).min(2).max(12),
});

export const sceneGenerationSchema = z.object({
  variants: z.array(sceneVariantDraftSchema).length(3),
});

export const shotDraftSchema = z.object({
  sceneSlot: z.number().int().min(1).max(12),
  slot: z.number().int().min(1).max(20),
  duration: z.number().positive().max(20),
  framing: z.string().min(2).max(120),
  cameraMovement: z.string().min(2).max(180),
  lensIntent: z.string().min(2).max(160),
  subjectAction: z.string().min(8).max(320),
  productVisibility: z.string().min(4).max(180),
  lightingIntent: z.string().min(4).max(220),
  assetRefs,
  continuityNotes: textList(1, 8),
  transitionIntent: z.string().min(2).max(180),
});

export const shotVariantDraftSchema = z.object({
  duration: productionDurationSchema,
  shots: z.array(shotDraftSchema).min(3).max(40),
});

export const shotGenerationSchema = z.object({
  variants: z.array(shotVariantDraftSchema).length(3),
});

export const treatmentSchema = treatmentDraftSchema.extend({
  stableKey: z.string().min(1),
});

export const sceneSchema = sceneDraftSchema.omit({ slot: true }).extend({
  stableKey: z.string().min(1),
});

export const shotSchema = shotDraftSchema.omit({ sceneSlot: true, slot: true }).extend({
  stableKey: z.string().min(1),
  sceneKey: z.string().min(1),
  start: z.number().min(0).max(45),
  end: z.number().positive().max(45),
});

export const promptIRSchema = z.object({
  stableKey: z.string().min(1),
  conceptKey: z.string().min(1),
  duration: productionDurationSchema,
  sceneKey: z.string().min(1),
  shotKey: z.string().min(1),
  shotDuration: z.number().positive().max(20),
  assetRefs,
  subject: z.string().min(4).max(260),
  action: z.string().min(4).max(320),
  environment: z.string().min(4).max(260),
  productContinuity: textList(1, 10),
  characterContinuity: z.array(z.string().min(2).max(220)).max(10),
  propContinuity: z.array(z.string().min(2).max(220)).max(10),
  framing: z.string().min(2).max(120),
  lensAndCamera: z.string().min(4).max(260),
  lighting: z.string().min(4).max(260),
  motion: z.string().min(4).max(260),
  temporalBehavior: z.string().min(4).max(220),
  negativeConstraints: textList(2, 12),
  continuityCarry: textList(1, 10),
});

export const compiledPromptSchema = z.object({
  provider: promptProviderSchema,
  promptIRKey: z.string().min(1),
  prompt: z.string().min(20).max(8000),
  negativePrompt: z.string().max(3000),
  parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const productionVariantSchema = z.object({
  duration: productionDurationSchema,
  treatment: treatmentSchema,
  scenes: z.array(sceneSchema).min(2).max(12),
  shots: z.array(shotSchema).min(3).max(40),
  promptIR: z.array(promptIRSchema).min(3).max(40),
  compiledPrompts: z.array(compiledPromptSchema).min(12).max(160),
});

export const conceptProductionPlanSchema = z.object({
  conceptKey: z.string().min(1),
  conceptTitle: z.string().min(2).max(90),
  variants: z.array(productionVariantSchema).length(3),
});

export const productionPlanSchema = z.object({
  concepts: z.array(conceptProductionPlanSchema).min(1).max(5),
  continuitySummary: z.object({
    rules: textList(3, 12),
    risks: z.array(z.string().min(4).max(260)).max(10),
  }),
});

export const productionReviewSchema = z.object({
  continuitySummary: productionPlanSchema.shape.continuitySummary,
  issues: z.array(z.object({
    conceptKey: z.string().min(1),
    duration: productionDurationSchema,
    level: z.enum(["treatment", "scenes", "shots"]),
    reason: z.string().min(6).max(220),
    repairInstruction: z.string().min(10).max(360),
  })).max(12),
});

export type ProductionDuration = z.infer<typeof productionDurationSchema>;
export type TreatmentDraft = z.infer<typeof treatmentDraftSchema>;
export type SceneDraft = z.infer<typeof sceneDraftSchema>;
export type ShotDraft = z.infer<typeof shotDraftSchema>;
export type ProductionPlan = z.infer<typeof productionPlanSchema>;
export type PromptIR = z.infer<typeof promptIRSchema>;
export type CompiledPrompt = z.infer<typeof compiledPromptSchema>;
export type ProductionReview = z.infer<typeof productionReviewSchema>;

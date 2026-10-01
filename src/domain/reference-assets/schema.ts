import { z } from "zod";

export const referenceAssetKindSchema = z.enum([
  "product",
  "hero",
  "wardrobe",
  "location",
  "prop",
]);

export const referenceAssetTargetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("product"),
    stableKey: z.literal("product-main"),
  }),
  z.object({
    kind: z.literal("hero"),
    stableKey: z.literal("hero-primary"),
  }),
  z.object({
    kind: z.literal("wardrobe"),
    stableKey: z.string().regex(/^wardrobe-\d{2}$/),
  }),
  z.object({
    kind: z.literal("location"),
    stableKey: z.string().regex(/^location-\d{2}$/),
  }),
  z.object({
    kind: z.literal("prop"),
    stableKey: z.string().regex(/^prop-\d{2}$/),
  }),
]);

export const renderArtifactSchema = z.object({
  ref: z.string().min(1).max(2048),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
});

export const renderRequestSchema = z.object({
  projectId: z.string().min(1),
  sourceAssetBibleRevision: z.number().int().positive(),
  target: referenceAssetTargetSchema,
  prompt: z.string().min(20).max(12000),
  negativeConstraints: z.array(z.string().min(2).max(320)).max(30),
  referenceArtifactRefs: z.array(z.string().min(1).max(2048)).max(12),
  aspectRatio: z.enum(["1:1", "4:5", "3:2", "2:3", "16:9"]),
});

export const renderResultSchema = z.object({
  requestId: z.string().min(1),
  artifact: renderArtifactSchema,
  generatedAt: z.string().datetime(),
});

export const referenceAssetRevisionSchema = z.object({
  revision: z.number().int().positive(),
  sourceAssetBibleRevision: z.number().int().positive(),
  target: referenceAssetTargetSchema,
  renderRequest: renderRequestSchema,
  renderResult: renderResultSchema,
  createdAt: z.string().datetime(),
}).superRefine((value, ctx) => {
  if (value.sourceAssetBibleRevision !== value.renderRequest.sourceAssetBibleRevision) {
    ctx.addIssue({
      code: "custom",
      path: ["renderRequest", "sourceAssetBibleRevision"],
      message: "Render request source Asset Bible revision must match the revision source binding.",
    });
  }

  if (
    value.target.kind !== value.renderRequest.target.kind
    || value.target.stableKey !== value.renderRequest.target.stableKey
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["renderRequest", "target"],
      message: "Render request target must match the Reference Asset revision target.",
    });
  }
});

export const continuityDimensionSchema = z.enum([
  "product_geometry",
  "product_color",
  "logo_label",
  "material_finish",
  "hero_identity",
  "wardrobe",
  "location_material_language",
  "prop_identity",
  "lighting",
]);

export const continuityFindingStatusSchema = z.enum(["passed", "warning", "failed"]);

export const continuityFindingSchema = z.object({
  dimension: continuityDimensionSchema,
  status: continuityFindingStatusSchema,
  summary: z.string().min(4).max(420),
  repairInstruction: z.string().min(8).max(520).optional(),
}).superRefine((value, ctx) => {
  if (value.status === "failed" && !value.repairInstruction) {
    ctx.addIssue({
      code: "custom",
      path: ["repairInstruction"],
      message: "Failed continuity findings require a repair instruction.",
    });
  }
});

const continuityDimensionsByKind = {
  product: new Set(["product_geometry", "product_color", "logo_label", "material_finish", "lighting"]),
  hero: new Set(["hero_identity", "lighting"]),
  wardrobe: new Set(["wardrobe", "lighting"]),
  location: new Set(["location_material_language", "lighting"]),
  prop: new Set(["prop_identity", "lighting"]),
} satisfies Record<z.infer<typeof referenceAssetKindSchema>, Set<string>>;

export const continuityCheckSchema = z.object({
  sourceAssetBibleRevision: z.number().int().positive(),
  target: referenceAssetTargetSchema,
  referenceAssetRevision: z.number().int().positive(),
  baselineArtifactRef: z.string().min(1).max(2048).optional(),
  candidateArtifactRef: z.string().min(1).max(2048),
  status: continuityFindingStatusSchema,
  findings: z.array(continuityFindingSchema).min(1).max(16),
  checkedAt: z.string().datetime(),
}).superRefine((value, ctx) => {
  const allowedDimensions = continuityDimensionsByKind[value.target.kind];

  value.findings.forEach((finding, index) => {
    if (!allowedDimensions.has(finding.dimension)) {
      ctx.addIssue({
        code: "custom",
        path: ["findings", index, "dimension"],
        message: `Continuity dimension ${finding.dimension} is not valid for ${value.target.kind} assets.`,
      });
    }
  });

  const derivedStatus = value.findings.some((finding) => finding.status === "failed")
    ? "failed"
    : value.findings.some((finding) => finding.status === "warning")
      ? "warning"
      : "passed";

  if (value.status !== derivedStatus) {
    ctx.addIssue({
      code: "custom",
      path: ["status"],
      message: `Continuity status must be ${derivedStatus} based on its findings.`,
    });
  }
});

export const referenceAssetSchema = z.object({
  target: referenceAssetTargetSchema,
  revisions: z.array(referenceAssetRevisionSchema).min(1),
  continuityChecks: z.array(continuityCheckSchema),
}).superRefine((value, ctx) => {
  let previousRevision = 0;

  value.revisions.forEach((revision, index) => {
    if (
      revision.target.kind !== value.target.kind
      || revision.target.stableKey !== value.target.stableKey
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["revisions", index, "target"],
        message: "Every revision in a Reference Asset must use the aggregate target.",
      });
    }

    if (revision.revision <= previousRevision) {
      ctx.addIssue({
        code: "custom",
        path: ["revisions", index, "revision"],
        message: "Reference Asset revisions must be strictly increasing.",
      });
    }

    previousRevision = revision.revision;
  });

  value.continuityChecks.forEach((check, index) => {
    if (
      check.target.kind !== value.target.kind
      || check.target.stableKey !== value.target.stableKey
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["continuityChecks", index, "target"],
        message: "Every Continuity Check in a Reference Asset must use the aggregate target.",
      });
    }
  });
});

export type ReferenceAssetKind = z.infer<typeof referenceAssetKindSchema>;
export type ReferenceAssetTarget = z.infer<typeof referenceAssetTargetSchema>;
export type RenderArtifact = z.infer<typeof renderArtifactSchema>;
export type RenderRequest = z.infer<typeof renderRequestSchema>;
export type RenderResult = z.infer<typeof renderResultSchema>;
export type ReferenceAssetRevision = z.infer<typeof referenceAssetRevisionSchema>;
export type ContinuityDimension = z.infer<typeof continuityDimensionSchema>;
export type ContinuityFinding = z.infer<typeof continuityFindingSchema>;
export type ContinuityCheck = z.infer<typeof continuityCheckSchema>;
export type ReferenceAsset = z.infer<typeof referenceAssetSchema>;

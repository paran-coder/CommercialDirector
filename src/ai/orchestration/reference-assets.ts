import { renderRequestSchema, type RenderRequest } from "@/domain/reference-assets/schema";
import type { AssetBible } from "@/domain/assets/schema";
import type { ProductIntelligence } from "@/domain/product/schema";

export interface BuildProductReferenceRequestInput {
  projectId: string;
  sourceAssetBibleRevision: number;
  product: ProductIntelligence;
  assetBible: AssetBible;
}

export function buildProductReferenceRenderRequest(
  input: BuildProductReferenceRequestInput,
): RenderRequest {
  const sheet = input.assetBible.productSheet;

  const prompt = [
    "Create a production reference image for the exact product described below.",
    "This is a continuity reference, not a new product design. Preserve all locked identity features exactly.",
    "",
    `Category: ${input.product.category} / ${input.product.subcategory}`,
    `Product summary: ${input.product.summary}`,
    `Primary color: ${input.product.visual.primaryColor}`,
    `Secondary color: ${input.product.visual.secondaryColor}`,
    `Observed materials: ${input.product.visual.materials.join(", ")}`,
    `Observed form: ${input.product.visual.form}`,
    `Observed finish: ${input.product.visual.finish.join(", ")}`,
    `Identity locks: ${input.product.identityLocks.join(", ")}`,
    "",
    `Identity statement: ${sheet.identityStatement}`,
    `Preserve: ${sheet.preserve.join("; ")}`,
    `Form rules: ${sheet.formRules.join("; ")}`,
    `Materials and surface: ${sheet.materialsAndSurface.join("; ")}`,
    `Color and markings: ${sheet.colorAndMarkingRules.join("; ")}`,
    `Scale and handling: ${sheet.scaleAndHandling.join("; ")}`,
    `Hero angles: ${sheet.heroAngles.join("; ")}`,
    `Continuity locks: ${sheet.continuityLocks.join("; ")}`,
    "",
    "Render a clean studio-grade reference sheet image with the product clearly readable and no invented branding, geometry, labels, accessories, or packaging.",
  ].join("\n");

  return renderRequestSchema.parse({
    projectId: input.projectId,
    sourceAssetBibleRevision: input.sourceAssetBibleRevision,
    target: {
      kind: "product",
      stableKey: "product-main",
    },
    prompt,
    negativeConstraints: [
      ...sheet.avoid,
      "Do not redesign the silhouette.",
      "Do not invent or modify logos, labels, caps, colors, or material finishes.",
      "Do not add unrelated props or secondary products.",
    ],
    referenceArtifactRefs: [],
    aspectRatio: "1:1",
  });
}

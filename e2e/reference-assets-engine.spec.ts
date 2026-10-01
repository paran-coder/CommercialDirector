import { expect, test } from "@playwright/test";
import { FixtureProvider } from "../src/ai/providers/fixture-provider";
import { FixtureImageGenerationProvider } from "../src/ai/image-generation/fixture-provider";
import { FixtureImageArtifactStore } from "../src/ai/image-generation/fixture-artifact-store";
import { buildCampaign } from "../src/ai/orchestration";
import { buildAssetBible } from "../src/ai/orchestration/assets";
import { buildProductReferenceRenderRequest } from "../src/ai/orchestration/reference-assets";
import { referenceAssetRevisionSchema } from "../src/domain/reference-assets/schema";
import { demoBrief, demoProduct } from "../src/lib/fixtures/demo";
import { runTrackedGeneration, TrackedGenerationError } from "../src/services/tracked-generation";

async function buildFixtureAssetBible() {
  const provider = new FixtureProvider();
  const campaign = await buildCampaign(provider, demoProduct, demoBrief);
  const shortlist = campaign.concepts.slice(0, 2).map((concept) => concept.id);
  const result = await buildAssetBible(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist,
  });

  return result.assetBible;
}

test("Product Reference request preserves product-main and Product Sheet continuity", async () => {
  const assetBible = await buildFixtureAssetBible();
  const request = buildProductReferenceRenderRequest({
    projectId: "00000000-0000-4000-8000-000000000123",
    sourceAssetBibleRevision: 3,
    product: demoProduct,
    assetBible,
  });

  expect(request.target).toEqual({
    kind: "product",
    stableKey: "product-main",
  });
  expect(request.sourceAssetBibleRevision).toBe(3);
  expect(request.prompt).toContain(assetBible.productSheet.identityStatement);
  expect(request.prompt).toContain(demoProduct.visual.primaryColor);
  expect(request.negativeConstraints).toEqual(expect.arrayContaining(assetBible.productSheet.avoid));
});

test("Fixture image generation keeps transient image data out of the persisted Reference Asset revision", async () => {
  const assetBible = await buildFixtureAssetBible();
  const request = buildProductReferenceRenderRequest({
    projectId: "00000000-0000-4000-8000-000000000123",
    sourceAssetBibleRevision: 1,
    product: demoProduct,
    assetBible,
  });

  const provider = new FixtureImageGenerationProvider();
  const store = new FixtureImageArtifactStore();
  const result = await provider.generate(request);
  const artifact = await store.persist({
    projectId: request.projectId,
    sourceAssetBibleRevision: request.sourceAssetBibleRevision,
    target: request.target,
    result,
  });

  const revision = referenceAssetRevisionSchema.parse({
    revision: 1,
    sourceAssetBibleRevision: request.sourceAssetBibleRevision,
    target: request.target,
    renderRequest: request,
    artifact,
    createdAt: new Date().toISOString(),
  });

  expect(result.imageBase64.length).toBeGreaterThan(0);
  expect(revision.artifact.ref).toMatch(/^fixture:\/\/reference-assets\//);
  expect(JSON.stringify(revision)).not.toContain(result.imageBase64);
});

test("Reference Asset persistence failure does not rerun successful image generation", async () => {
  const assetBible = await buildFixtureAssetBible();
  const request = buildProductReferenceRenderRequest({
    projectId: "00000000-0000-4000-8000-000000000123",
    sourceAssetBibleRevision: 1,
    product: demoProduct,
    assetBible,
  });
  const provider = new FixtureImageGenerationProvider();

  let generationCalls = 0;
  let commitCalls = 0;
  let caught: unknown;

  try {
    await runTrackedGeneration({
      kind: "reference_asset",
      payload: {
        stableKey: request.target.stableKey,
      },
      maxAttempts: 2,
      operation: async () => {
        generationCalls += 1;
        return provider.generate(request);
      },
      commit: async () => {
        commitCalls += 1;
        throw new Error("artifact persistence unavailable");
      },
      jobOutput: (result) => ({
        requestId: result.requestId,
        generatedAt: result.generatedAt,
      }),
    });
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(TrackedGenerationError);
  expect(generationCalls).toBe(1);
  expect(commitCalls).toBe(1);
});

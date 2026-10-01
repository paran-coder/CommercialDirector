import { expect, test } from "@playwright/test";
import { FixtureProvider } from "../src/ai/providers/fixture-provider";
import { buildCampaign } from "../src/ai/orchestration";
import { buildAssetBible } from "../src/ai/orchestration/assets";
import { buildProductionPlan } from "../src/ai/orchestration/production";
import { compilePromptSet } from "../src/ai/orchestration/prompt-compiler";
import { validateProductionPlan } from "../src/ai/orchestration/production-quality";
import { demoBrief, demoProduct } from "../src/lib/fixtures/demo";
import { runTrackedGeneration, TrackedGenerationError } from "../src/services/tracked-generation";

async function productionFixture(shortlistMode: "mixed" | "product-only" = "mixed") {
  const provider = new FixtureProvider();
  const campaign = await buildCampaign(provider, demoProduct, demoBrief);
  const shortlist = shortlistMode === "product-only"
    ? campaign.concepts.filter((concept) => concept.executionType === "product_spectacle").slice(0, 1).map((concept) => concept.id)
    : campaign.concepts.slice(0, 2).map((concept) => concept.id);

  const assets = await buildAssetBible(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist,
  });

  const production = await buildProductionPlan(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist,
    assetBible: assets.assetBible,
  });

  return { provider, campaign, shortlist, assets, production };
}

test("fixture Production Plan has canonical 15/30/45 variants and valid references", async () => {
  const { shortlist, assets, production } = await productionFixture();

  expect(production.productionPlan.concepts).toHaveLength(shortlist.length);
  for (const concept of production.productionPlan.concepts) {
    expect(concept.variants.map((variant) => variant.duration).sort((a, b) => a - b)).toEqual([15, 30, 45]);

    for (const variant of concept.variants) {
      expect(variant.treatment.stableKey).toBe(`treatment-${concept.conceptKey}-${variant.duration}`);
      expect(variant.scenes.every((scene, index) =>
        scene.stableKey === `scene-${concept.conceptKey}-${variant.duration}-${String(index + 1).padStart(2, "0")}`,
      )).toBeTruthy();

      const finalEnd = variant.shots.at(-1)?.end ?? 0;
      expect(Math.abs(finalEnd - variant.duration)).toBeLessThanOrEqual(0.75);
      expect(variant.scenes.every((scene) => variant.shots.some((shot) => shot.sceneKey === scene.stableKey))).toBeTruthy();

      for (const shot of variant.shots) {
        const prompt = variant.promptIR.find((item) => item.shotKey === shot.stableKey);
        expect(prompt).toBeTruthy();
        expect(prompt?.sceneKey).toBe(shot.sceneKey);
        expect([...new Set(prompt?.assetRefs ?? [])].sort()).toEqual([...new Set(shot.assetRefs)].sort());

        const compiled = variant.compiledPrompts.filter((item) => item.promptIRKey === prompt?.stableKey);
        expect(compiled.map((item) => item.provider).sort()).toEqual(["generic", "kling", "seedance", "veo"]);
      }
    }
  }

  expect(validateProductionPlan(production.productionPlan, assets.assetBible).valid).toBeTruthy();
});

test("product-only Production Plan never references Hero or Wardrobe", async () => {
  const { assets, production } = await productionFixture("product-only");
  expect(assets.assetBible.hero.applicability).toBe("none");

  const refs = production.productionPlan.concepts.flatMap((concept) =>
    concept.variants.flatMap((variant) => [
      ...variant.scenes.flatMap((scene) => scene.assetRefs),
      ...variant.shots.flatMap((shot) => shot.assetRefs),
      ...variant.promptIR.flatMap((prompt) => prompt.assetRefs),
    ]),
  );

  expect(refs.includes("hero-primary")).toBeFalsy();
  expect(refs.some((ref) => ref.startsWith("wardrobe-"))).toBeFalsy();
  expect(validateProductionPlan(production.productionPlan, assets.assetBible).valid).toBeTruthy();
});

test("provider prompt compilation is deterministic and source preserving", async () => {
  const { production } = await productionFixture();
  const ir = production.productionPlan.concepts[0].variants[0].promptIR[0];

  const first = compilePromptSet(ir);
  const second = compilePromptSet(ir);

  expect(first).toEqual(second);
  for (const compiled of first) {
    expect(compiled.promptIRKey).toBe(ir.stableKey);
    expect(compiled.prompt.length).toBeGreaterThan(20);
    expect(compiled.negativePrompt).toContain("Do not");
  }
});

test("Production Plan rejects an invalid shortlist", async () => {
  const provider = new FixtureProvider();
  const campaign = await buildCampaign(provider, demoProduct, demoBrief);
  const assets = await buildAssetBible(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist: [campaign.concepts[0].id],
  });

  await expect(buildProductionPlan(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist: ["not-a-real-concept"],
    assetBible: assets.assetBible,
  })).rejects.toThrow(/does not exist/i);
});

test("Production Plan persistence failure does not rerun successful generation", async () => {
  const { provider, campaign, shortlist, assets } = await productionFixture();
  let generationCalls = 0;
  let commitCalls = 0;
  let caught: unknown;

  try {
    await runTrackedGeneration({
      kind: "production_plan",
      payload: { shortlist },
      maxAttempts: 2,
      operation: async () => {
        generationCalls += 1;
        return buildProductionPlan(provider, {
          product: demoProduct,
          bible: campaign.bible,
          territories: campaign.territories,
          concepts: campaign.concepts,
          shortlist,
          assetBible: assets.assetBible,
        });
      },
      commit: async () => {
        commitCalls += 1;
        throw new Error("database unavailable");
      },
    });
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(TrackedGenerationError);
  expect(generationCalls).toBe(1);
  expect(commitCalls).toBe(1);
});

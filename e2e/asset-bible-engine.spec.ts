import { expect, test } from "@playwright/test";
import { FixtureProvider } from "../src/ai/providers/fixture-provider";
import { buildCampaign } from "../src/ai/orchestration";
import { buildAssetBible } from "../src/ai/orchestration/assets";
import { validateAssetBible } from "../src/ai/orchestration/asset-bible-quality";
import { demoBrief, demoProduct } from "../src/lib/fixtures/demo";

test("fixture Asset Bible uses canonical keys and shortlisted concept refs", async () => {
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

  expect(result.assetBible.productSheet.stableKey).toBe("product-main");
  expect(result.assetBible.hero.stableKey).toBe("hero-primary");
  expect(result.assetBible.wardrobe.every((item, index) => item.stableKey === `wardrobe-${String(index + 1).padStart(2, "0")}`)).toBeTruthy();
  expect(result.assetBible.locations).toHaveLength(3);
  expect(result.assetBible.props.length).toBeGreaterThanOrEqual(2);

  const refs = [
    ...result.assetBible.hero.conceptRefs,
    ...result.assetBible.wardrobe.flatMap((item) => item.conceptRefs),
    ...result.assetBible.locations.flatMap((item) => item.conceptRefs),
    ...result.assetBible.props.flatMap((item) => item.conceptRefs),
  ];
  expect(refs.every((ref) => shortlist.includes(ref))).toBeTruthy();
  expect(validateAssetBible(result.assetBible, shortlist).valid).toBeTruthy();
});

test("product-only shortlisted concepts produce no wardrobe", async () => {
  const provider = new FixtureProvider();
  const campaign = await buildCampaign(provider, demoProduct, demoBrief);
  const shortlist = campaign.concepts
    .filter((concept) => concept.executionType === "product_spectacle")
    .map((concept) => concept.id);

  const result = await buildAssetBible(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist,
  });

  expect(result.assetBible.hero.applicability).toBe("none");
  expect(result.assetBible.wardrobe).toHaveLength(0);
  expect(validateAssetBible(result.assetBible, shortlist).valid).toBeTruthy();
});

test("Asset Bible generation rejects an invalid shortlist", async () => {
  const provider = new FixtureProvider();
  const campaign = await buildCampaign(provider, demoProduct, demoBrief);

  await expect(buildAssetBible(provider, {
    product: demoProduct,
    bible: campaign.bible,
    territories: campaign.territories,
    concepts: campaign.concepts,
    shortlist: ["not-a-real-concept"],
  })).rejects.toThrow(/does not exist/i);
});

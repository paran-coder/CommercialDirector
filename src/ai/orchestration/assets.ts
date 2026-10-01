import type { AIProvider } from "@/ai/provider";
import { generateObjectWithRetry } from "@/ai/orchestration/generate";
import {
  ASSET_BIBLE_REVIEW_INSTRUCTIONS,
  CASTING_STYLING_DIRECTOR_INSTRUCTIONS,
  PRODUCT_CONTINUITY_DIRECTOR_INSTRUCTIONS,
  PRODUCTION_DESIGNER_INSTRUCTIONS,
} from "@/ai/prompts";
import {
  assetBibleReviewSchema,
  castingStylingGenerationSchema,
  productSheetGenerationSchema,
  productionDesignGenerationSchema,
  type AssetBibleReview,
} from "@/domain/assets/schema";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import {
  normalizeAssetBible,
  validateAssetBible,
} from "@/ai/orchestration/asset-bible-quality";
import { createAssetBibleFixture } from "@/lib/fixtures/asset-bible";

export type BuildAssetBibleInput = {
  product: ProductIntelligence;
  bible: CampaignBible;
  territories: Territory[];
  concepts: Concept[];
  shortlist: string[];
};

export async function buildAssetBible(provider: AIProvider, input: BuildAssetBibleInput) {
  const source = createSourceContext(input);
  const fixture = createAssetBibleFixture(input);

  let [productResult, castingResult, productionResult] = await Promise.all([
    generateObjectWithRetry(provider, {
      name: "asset_bible_product",
      schema: productSheetGenerationSchema,
      instructions: PRODUCT_CONTINUITY_DIRECTOR_INSTRUCTIONS,
      prompt: JSON.stringify(source),
      fixture: { productSheet: fixture.productSheet },
      reasoningEffort: "medium",
    }),
    generateObjectWithRetry(provider, {
      name: "asset_bible_casting_styling",
      schema: castingStylingGenerationSchema,
      instructions: CASTING_STYLING_DIRECTOR_INSTRUCTIONS,
      prompt: JSON.stringify(source),
      fixture: { hero: fixture.hero, wardrobe: fixture.wardrobe },
      reasoningEffort: "low",
    }),
    generateObjectWithRetry(provider, {
      name: "asset_bible_production_design",
      schema: productionDesignGenerationSchema,
      instructions: PRODUCTION_DESIGNER_INSTRUCTIONS,
      prompt: JSON.stringify(source),
      fixture: { locations: fixture.locations, props: fixture.props },
      reasoningEffort: "low",
    }),
  ]);

  let review = await reviewAssetBible(provider, source, {
    productSheet: productResult.productSheet,
    hero: castingResult.hero,
    wardrobe: castingResult.wardrobe,
    locations: productionResult.locations,
    props: productionResult.props,
  }, fixture.review);

  const preliminary = normalizeAssetBible({
    productSheet: productResult.productSheet,
    hero: castingResult.hero,
    wardrobe: castingResult.wardrobe,
    locations: productionResult.locations,
    props: productionResult.props,
    globalContinuity: review.globalContinuity,
  });
  const preliminaryStructural = validateAssetBible(preliminary, input.shortlist);

  const repairGroups = new Set<"product" | "casting" | "production">();
  for (const issue of review.issues) repairGroups.add(groupForSection(issue.section));
  for (const issue of preliminaryStructural.issues) {
    if (issue.section !== "global") repairGroups.add(groupForSection(issue.section));
  }

  if (repairGroups.has("product")) {
    const instruction = repairInstructionForGroup("product", review, preliminaryStructural.issues);
    productResult = await generateObjectWithRetry(provider, {
      name: "asset_bible_product_repair",
      schema: productSheetGenerationSchema,
      instructions: PRODUCT_CONTINUITY_DIRECTOR_INSTRUCTIONS,
      prompt: JSON.stringify({ ...source, repairInstruction: instruction, current: productResult }),
      fixture: { productSheet: fixture.productSheet },
      reasoningEffort: "low",
    });
  }

  if (repairGroups.has("casting")) {
    const instruction = repairInstructionForGroup("casting", review, preliminaryStructural.issues);
    castingResult = await generateObjectWithRetry(provider, {
      name: "asset_bible_casting_repair",
      schema: castingStylingGenerationSchema,
      instructions: CASTING_STYLING_DIRECTOR_INSTRUCTIONS,
      prompt: JSON.stringify({ ...source, repairInstruction: instruction, current: castingResult }),
      fixture: { hero: fixture.hero, wardrobe: fixture.wardrobe },
      reasoningEffort: "low",
    });
  }

  if (repairGroups.has("production")) {
    const instruction = repairInstructionForGroup("production", review, preliminaryStructural.issues);
    productionResult = await generateObjectWithRetry(provider, {
      name: "asset_bible_production_repair",
      schema: productionDesignGenerationSchema,
      instructions: PRODUCTION_DESIGNER_INSTRUCTIONS,
      prompt: JSON.stringify({ ...source, repairInstruction: instruction, current: productionResult }),
      fixture: { locations: fixture.locations, props: fixture.props },
      reasoningEffort: "low",
    });
  }

  if (repairGroups.size > 0) {
    review = await reviewAssetBible(provider, source, {
      productSheet: productResult.productSheet,
      hero: castingResult.hero,
      wardrobe: castingResult.wardrobe,
      locations: productionResult.locations,
      props: productionResult.props,
    }, fixture.review);
  }

  const assetBible = normalizeAssetBible({
    productSheet: productResult.productSheet,
    hero: castingResult.hero,
    wardrobe: castingResult.wardrobe,
    locations: productionResult.locations,
    props: productionResult.props,
    globalContinuity: review.globalContinuity,
  });

  const structural = validateAssetBible(assetBible, input.shortlist);
  if (!structural.valid) {
    throw new Error(
      `Asset Bible remained structurally invalid: ${structural.issues.map((issue) => issue.detail).join(" ")}`,
    );
  }

  return {
    assetBible,
    quality: {
      passed: review.issues.length === 0,
      issues: review.issues,
      repairedSections: [...repairGroups],
    },
  };
}

async function reviewAssetBible(
  provider: AIProvider,
  source: ReturnType<typeof createSourceContext>,
  sections: {
    productSheet: unknown;
    hero: unknown;
    wardrobe: unknown;
    locations: unknown;
    props: unknown;
  },
  fixture: AssetBibleReview,
) {
  return generateObjectWithRetry(provider, {
    name: "asset_bible_quality_review",
    schema: assetBibleReviewSchema,
    instructions: ASSET_BIBLE_REVIEW_INSTRUCTIONS,
    prompt: JSON.stringify({ source, sections }),
    fixture,
    reasoningEffort: "medium",
  });
}

function createSourceContext(input: BuildAssetBibleInput) {
  const shortlist = [...new Set(input.shortlist)];
  if (shortlist.length < 1 || shortlist.length > 5) {
    throw new Error("Asset Bible requires between 1 and 5 shortlisted concepts.");
  }

  const conceptById = new Map(input.concepts.map((concept) => [concept.id, concept]));
  const selected = shortlist.map((id) => conceptById.get(id));
  if (selected.some((concept) => !concept)) {
    throw new Error("Shortlist contains a concept that does not exist in the current campaign.");
  }

  const territoryById = new Map(input.territories.map((territory) => [territory.id, territory]));

  return {
    product: input.product,
    campaign: {
      campaignName: input.bible.campaignName,
      campaignIdea: input.bible.campaignIdea,
      audienceSummary: input.bible.audienceSummary,
      visualWorld: input.bible.visualWorld,
      hero: input.bible.hero,
      productBehavior: input.bible.productBehavior,
      cameraLanguage: input.bible.cameraLanguage,
      lighting: input.bible.lighting,
      palette: input.bible.palette,
    },
    shortlistedConcepts: selected.map((concept) => {
      const territory = territoryById.get(concept!.territoryId);
      return {
        id: concept!.id,
        executionType: concept!.executionType,
        title: concept!.title,
        hook: concept!.hook,
        productRole: concept!.productRole,
        requirements: concept!.requirements,
        territory: territory ? { id: territory.id, title: territory.title, premise: territory.premise } : null,
      };
    }),
  };
}


function groupForSection(section: "product" | "hero" | "wardrobe" | "locations" | "props") {
  if (section === "product") return "product" as const;
  if (section === "hero" || section === "wardrobe") return "casting" as const;
  return "production" as const;
}

function repairInstructionForGroup(
  group: "product" | "casting" | "production",
  review: AssetBibleReview,
  structuralIssues: Array<{ section: string; detail: string }>,
) {
  const reviewText = review.issues
    .filter((issue) => groupForSection(issue.section) === group)
    .map((issue) => issue.repairInstruction);
  const structuralText = structuralIssues
    .filter((issue) => issue.section !== "global" && groupForSection(issue.section as "product" | "hero" | "wardrobe" | "locations" | "props") === group)
    .map((issue) => issue.detail);
  return [...new Set([...reviewText, ...structuralText])].join(" ");
}

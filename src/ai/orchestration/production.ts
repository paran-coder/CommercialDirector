import type { AIProvider } from "@/ai/provider";
import { generateObjectWithRetry } from "@/ai/orchestration/generate";
import {
  PRODUCTION_CONTINUITY_REVIEW_INSTRUCTIONS,
  SCENE_DIRECTOR_INSTRUCTIONS,
  SHOT_DIRECTOR_INSTRUCTIONS,
  TREATMENT_DIRECTOR_INSTRUCTIONS,
} from "@/ai/prompts";
import {
  productionReviewSchema,
  sceneGenerationSchema,
  shotGenerationSchema,
  treatmentGenerationSchema,
  type ProductionReview,
} from "@/domain/production/schema";
import type { AssetBible } from "@/domain/assets/schema";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import {
  normalizeProductionPlan,
  validateProductionDrafts,
  validateProductionPlan,
  type ConceptProductionDraft,
  type ProductionStructuralIssue,
} from "@/ai/orchestration/production-quality";
import { createProductionFixture } from "@/lib/fixtures/production";

export type BuildProductionPlanInput = {
  product: ProductIntelligence;
  bible: CampaignBible;
  territories: Territory[];
  concepts: Concept[];
  shortlist: string[];
  assetBible: AssetBible;
};

export async function buildProductionPlan(provider: AIProvider, input: BuildProductionPlanInput) {
  const source = createSource(input);
  let drafts = await Promise.all(source.selectedConcepts.map((concept) =>
    generateConceptDraft(provider, input.assetBible, source.campaign, concept),
  ));
  const repairedConcepts = new Set<string>();

  const draftValidation = validateProductionDrafts(drafts, input.assetBible);
  if (!draftValidation.valid) {
    const preflightRepairs = buildRepairPlans(
      { continuitySummary: defaultContinuity(input.assetBible), issues: [] },
      draftValidation.issues,
    );
    for (const key of preflightRepairs.keys()) repairedConcepts.add(key);
    drafts = await repairDrafts(provider, input.assetBible, source, drafts, preflightRepairs);
  }

  let preliminary = normalizeProductionPlan(drafts, input.assetBible, defaultContinuity(input.assetBible));
  const structuralBefore = validateProductionPlan(preliminary, input.assetBible);

  let review = await reviewProduction(provider, source, preliminary, input.assetBible);
  const repairPlans = buildRepairPlans(review, structuralBefore.issues);

  if (repairPlans.size > 0) {
    for (const key of repairPlans.keys()) repairedConcepts.add(key);
    drafts = await repairDrafts(provider, input.assetBible, source, drafts, repairPlans);
    preliminary = normalizeProductionPlan(drafts, input.assetBible, review.continuitySummary);
    review = await reviewProduction(provider, source, preliminary, input.assetBible);
  }

  const plan = normalizeProductionPlan(drafts, input.assetBible, review.continuitySummary);
  const structural = validateProductionPlan(plan, input.assetBible);
  if (!structural.valid) {
    throw new Error(
      `Production Plan remained structurally invalid: ${structural.issues.map((item) => item.detail).join(" ")}`,
    );
  }

  return {
    productionPlan: plan,
    quality: {
      passed: review.issues.length === 0,
      issues: review.issues,
      repairedConcepts: [...repairedConcepts],
    },
  };
}


async function repairDrafts(
  provider: AIProvider,
  assetBible: AssetBible,
  source: ReturnType<typeof createSource>,
  drafts: ConceptProductionDraft[],
  repairPlans: Map<string, RepairPlan>,
) {
  return Promise.all(drafts.map(async (draft) => {
    const repair = repairPlans.get(draft.conceptKey);
    if (!repair) return draft;
    const concept = source.selectedConcepts.find((item) => item.id === draft.conceptKey);
    if (!concept) throw new Error(`Concept ${draft.conceptKey} not found for production repair.`);
    return repairConceptDraft(provider, assetBible, source.campaign, concept, draft, repair);
  }));
}

async function generateConceptDraft(
  provider: AIProvider,
  assetBible: AssetBible,
  campaign: ReturnType<typeof compactCampaign>,
  concept: Concept,
): Promise<ConceptProductionDraft> {
  const fixture = createProductionFixture({ concept, assetBible });
  const common = {
    campaign,
    concept: compactConcept(concept),
    assets: compactAssets(assetBible),
  };

  const treatmentResult = await generateObjectWithRetry(provider, {
    name: `production_treatments_${concept.id}`,
    schema: treatmentGenerationSchema,
    instructions: TREATMENT_DIRECTOR_INSTRUCTIONS,
    prompt: JSON.stringify(common),
    fixture: { treatments: fixture.treatments },
    reasoningEffort: "medium",
  });

  const sceneResult = await generateObjectWithRetry(provider, {
    name: `production_scenes_${concept.id}`,
    schema: sceneGenerationSchema,
    instructions: SCENE_DIRECTOR_INSTRUCTIONS,
    prompt: JSON.stringify({ ...common, treatments: treatmentResult.treatments }),
    fixture: { variants: fixture.sceneVariants },
    reasoningEffort: "medium",
  });

  const shotResult = await generateObjectWithRetry(provider, {
    name: `production_shots_${concept.id}`,
    schema: shotGenerationSchema,
    instructions: SHOT_DIRECTOR_INSTRUCTIONS,
    prompt: JSON.stringify({
      ...common,
      treatments: treatmentResult.treatments,
      sceneVariants: sceneResult.variants,
    }),
    fixture: { variants: fixture.shotVariants },
    reasoningEffort: "medium",
  });

  return {
    conceptKey: concept.id,
    conceptTitle: concept.title,
    treatments: treatmentResult.treatments,
    sceneVariants: sceneResult.variants,
    shotVariants: shotResult.variants,
  };
}

type RepairPlan = {
  stage: "treatment" | "scenes" | "shots";
  instructions: string[];
};

async function repairConceptDraft(
  provider: AIProvider,
  assetBible: AssetBible,
  campaign: ReturnType<typeof compactCampaign>,
  concept: Concept,
  draft: ConceptProductionDraft,
  repair: RepairPlan,
): Promise<ConceptProductionDraft> {
  const fixture = createProductionFixture({ concept, assetBible });
  const common = {
    campaign,
    concept: compactConcept(concept),
    assets: compactAssets(assetBible),
    repairInstruction: repair.instructions.join(" "),
  };

  let treatments = draft.treatments;
  let sceneVariants = draft.sceneVariants;
  let shotVariants = draft.shotVariants;

  if (repair.stage === "treatment") {
    const result = await generateObjectWithRetry(provider, {
      name: `production_treatments_repair_${concept.id}`,
      schema: treatmentGenerationSchema,
      instructions: TREATMENT_DIRECTOR_INSTRUCTIONS,
      prompt: JSON.stringify({ ...common, current: treatments }),
      fixture: { treatments: fixture.treatments },
      reasoningEffort: "low",
    });
    treatments = result.treatments;
  }

  if (repair.stage === "treatment" || repair.stage === "scenes") {
    const result = await generateObjectWithRetry(provider, {
      name: `production_scenes_repair_${concept.id}`,
      schema: sceneGenerationSchema,
      instructions: SCENE_DIRECTOR_INSTRUCTIONS,
      prompt: JSON.stringify({ ...common, treatments, current: sceneVariants }),
      fixture: { variants: fixture.sceneVariants },
      reasoningEffort: "low",
    });
    sceneVariants = result.variants;
  }

  const result = await generateObjectWithRetry(provider, {
    name: `production_shots_repair_${concept.id}`,
    schema: shotGenerationSchema,
    instructions: SHOT_DIRECTOR_INSTRUCTIONS,
    prompt: JSON.stringify({ ...common, treatments, sceneVariants, current: shotVariants }),
    fixture: { variants: fixture.shotVariants },
    reasoningEffort: "low",
  });
  shotVariants = result.variants;

  return {
    conceptKey: concept.id,
    conceptTitle: concept.title,
    treatments,
    sceneVariants,
    shotVariants,
  };
}

async function reviewProduction(
  provider: AIProvider,
  source: ReturnType<typeof createSource>,
  productionPlan: ReturnType<typeof normalizeProductionPlan>,
  assetBible: AssetBible,
) {
  const fixture: ProductionReview = {
    continuitySummary: defaultContinuity(assetBible),
    issues: [],
  };
  return generateObjectWithRetry(provider, {
    name: "production_continuity_review",
    schema: productionReviewSchema,
    instructions: PRODUCTION_CONTINUITY_REVIEW_INSTRUCTIONS,
    prompt: JSON.stringify({
      campaign: source.campaign,
      selectedConcepts: source.selectedConcepts.map(compactConcept),
      assets: compactAssets(assetBible),
      productionPlan,
    }),
    fixture,
    reasoningEffort: "medium",
  });
}

function buildRepairPlans(review: ProductionReview, structural: ProductionStructuralIssue[]) {
  const map = new Map<string, RepairPlan>();
  const stageRank = { treatment: 1, scenes: 2, shots: 3 } as const;

  const add = (conceptKey: string, stage: "treatment" | "scenes" | "shots", instruction: string) => {
    const current = map.get(conceptKey);
    if (!current || stageRank[stage] < stageRank[current.stage]) {
      map.set(conceptKey, { stage, instructions: [instruction] });
    } else {
      current.instructions.push(instruction);
    }
  };

  for (const item of review.issues) add(item.conceptKey, item.level, item.repairInstruction);
  for (const item of structural) {
    if (item.level === "prompts") continue;
    add(item.conceptKey, item.level, item.detail);
  }

  for (const value of map.values()) value.instructions = [...new Set(value.instructions)];
  return map;
}

function createSource(input: BuildProductionPlanInput) {
  const shortlist = [...new Set(input.shortlist)];
  if (shortlist.length < 1 || shortlist.length > 5) {
    throw new Error("Production Planning requires between 1 and 5 shortlisted concepts.");
  }
  const conceptById = new Map(input.concepts.map((concept) => [concept.id, concept]));
  const selectedConcepts = shortlist.map((key) => conceptById.get(key));
  if (selectedConcepts.some((concept) => !concept)) {
    throw new Error("Shortlist contains a concept that does not exist in the current campaign.");
  }
  return {
    campaign: compactCampaign(input.bible, input.territories),
    selectedConcepts: selectedConcepts as Concept[],
  };
}

function compactCampaign(bible: CampaignBible, territories: Territory[]) {
  return {
    campaignName: bible.campaignName,
    campaignIdea: bible.campaignIdea,
    visualWorld: bible.visualWorld,
    cameraLanguage: bible.cameraLanguage,
    lighting: bible.lighting,
    palette: bible.palette,
    productBehavior: bible.productBehavior,
    soundLanguage: bible.soundLanguage,
    territories: territories.map((territory) => ({
      id: territory.id,
      title: territory.title,
      premise: territory.premise,
    })),
  };
}

function compactConcept(concept: Concept) {
  return {
    id: concept.id,
    territoryId: concept.territoryId,
    executionType: concept.executionType,
    title: concept.title,
    hook: concept.hook,
    idea: concept.idea,
    productRole: concept.productRole,
    audienceTakeaway: concept.audienceTakeaway,
    requirements: concept.requirements,
    pro: concept.pro,
  };
}

function compactAssets(assetBible: AssetBible) {
  return {
    product: {
      stableKey: assetBible.productSheet.stableKey,
      identityStatement: assetBible.productSheet.identityStatement,
      continuityLocks: assetBible.productSheet.continuityLocks,
      avoid: assetBible.productSheet.avoid,
    },
    hero: {
      stableKey: assetBible.hero.stableKey,
      applicability: assetBible.hero.applicability,
      continuityLocks: assetBible.hero.continuityLocks,
    },
    wardrobe: assetBible.wardrobe.map((item) => ({
      stableKey: item.stableKey,
      label: item.label,
      continuityLocks: item.continuityLocks,
      conceptRefs: item.conceptRefs,
    })),
    locations: assetBible.locations.map((item) => ({
      stableKey: item.stableKey,
      label: item.label,
      spatialDescription: item.spatialDescription,
      lightingWindow: item.lightingWindow,
      continuityLocks: item.continuityLocks,
      conceptRefs: item.conceptRefs,
    })),
    props: assetBible.props.map((item) => ({
      stableKey: item.stableKey,
      label: item.label,
      productionRole: item.productionRole,
      continuityLocks: item.continuityLocks,
      conceptRefs: item.conceptRefs,
    })),
    globalContinuity: assetBible.globalContinuity,
  };
}

function defaultContinuity(assetBible: AssetBible) {
  const rules = [
    ...assetBible.globalContinuity.rules,
    ...assetBible.productSheet.continuityLocks.map((item) => `Product lock: ${item}`),
  ].slice(0, 12);
  while (rules.length < 3) rules.push("Preserve approved Asset Bible continuity across every production variant.");
  return {
    rules,
    risks: assetBible.globalContinuity.conflicts.slice(0, 10),
  };
}

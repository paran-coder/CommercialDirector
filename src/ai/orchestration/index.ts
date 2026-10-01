import { z } from "zod";
import type { AIProvider } from "@/ai/provider";
import { generateObjectWithRetry } from "@/ai/orchestration/generate";
import {
  CAMPAIGN_BIBLE_INSTRUCTIONS,
  CONCEPT_INSTRUCTIONS,
  CONCEPT_REPAIR_INSTRUCTIONS,
  PRODUCT_ANALYST_INSTRUCTIONS,
  QUALITY_REVIEW_INSTRUCTIONS,
  TERRITORY_INSTRUCTIONS,
} from "@/ai/prompts";
import { creativeBriefSchema, type CreativeBrief } from "@/domain/brief/schema";
import { campaignBibleSchema, territoryBatchSchema, type CampaignBible, type Territory } from "@/domain/campaign/schema";
import { conceptBatchSchema, conceptSchema, type Concept } from "@/domain/concept/schema";
import { productIntelligenceSchema, type ProductIntelligence } from "@/domain/product/schema";
import { demoBible, demoBrief, demoConcepts, demoProduct, demoTerritories } from "@/lib/fixtures/demo";
import {
  conceptSimilarity,
  evaluateConcepts,
  modelQualityReviewSchema,
  requiredExecutionTypes,
  validateConceptMatrix,
  type ModelQualityIssue,
  type QualityIssue,
} from "@/ai/orchestration/quality-gate";

const conceptReplacementSchema = z.object({ concept: conceptSchema });

export async function analyzeProduct(provider: AIProvider, imageDataUrl?: string): Promise<ProductIntelligence> {
  return generateObjectWithRetry(provider, {
    name: "product_intelligence",
    schema: productIntelligenceSchema,
    instructions: PRODUCT_ANALYST_INSTRUCTIONS,
    prompt: "Analyze this product image for advertising pre-production. Describe only visible attributes and create conservative identity locks.",
    imageDataUrl,
    fixture: demoProduct,
  });
}

export async function buildCampaign(
  provider: AIProvider,
  product: ProductIntelligence,
  brief: CreativeBrief = demoBrief,
) {
  const checkedBrief = creativeBriefSchema.parse(brief);
  const bible = await generateObjectWithRetry<CampaignBible>(provider, {
    name: "campaign_bible",
    schema: campaignBibleSchema,
    instructions: CAMPAIGN_BIBLE_INSTRUCTIONS,
    prompt: `PRODUCT\n${JSON.stringify(product)}\n\nBRIEF\n${JSON.stringify(checkedBrief)}`,
    fixture: demoBible,
  });

  const territoryResult = await generateObjectWithRetry(provider, {
    name: "creative_territories",
    schema: territoryBatchSchema,
    instructions: TERRITORY_INSTRUCTIONS,
    prompt: `Create exactly four territories from this campaign bible. Assign slot 1-4 and stable kebab-case IDs.\n${JSON.stringify(bible)}`,
    fixture: { territories: demoTerritories },
  });

  const territories = normalizeTerritories(territoryResult.territories);
  let concepts = await generateConceptMatrix(provider, bible, territories);

  let matrixValidation = validateConceptMatrix(territories, concepts);
  if (!matrixValidation.valid) {
    const invalidTerritories = new Set(matrixValidation.invalidTerritoryIds);
    const repairs = await Promise.all(
      territories
        .filter((territory) => invalidTerritories.has(territory.id))
        .map((territory) => generateTerritoryConcepts(provider, bible, territory, true)),
    );

    for (const repaired of repairs) {
      concepts = concepts.filter((concept) => concept.territoryId !== repaired.territoryId).concat(repaired.concepts);
    }
    concepts = sortConceptMatrix(territories, concepts);
    matrixValidation = validateConceptMatrix(territories, concepts);
  }

  if (!matrixValidation.valid) {
    throw new Error(`Concept matrix remained structurally invalid after repair: ${matrixValidation.issues.map((issue) => issue.detail).join(" ")}`);
  }

  const heuristicIssues = evaluateConcepts(territories, concepts);
  const modelReview = await generateObjectWithRetry(provider, {
    name: "campaign_quality_review",
    schema: modelQualityReviewSchema,
    instructions: QUALITY_REVIEW_INSTRUCTIONS,
    prompt: JSON.stringify(createQualityReviewPayload(bible, territories, concepts, heuristicIssues)),
    fixture: { issues: [] },
  });

  const repairTargets = mergeRepairTargets(concepts, heuristicIssues, modelReview.issues).slice(0, 6);
  if (repairTargets.length > 0) {
    const repaired = await Promise.all(
      repairTargets.map(({ concept, instruction }) =>
        repairConcept(provider, bible, territories, concepts, concept, instruction),
      ),
    );
    const repairMap = new Map(repaired.map((concept) => [concept.id, concept]));
    concepts = concepts.map((concept) => repairMap.get(concept.id) ?? concept);
  }

  const finalMatrix = validateConceptMatrix(territories, concepts);
  if (!finalMatrix.valid) {
    throw new Error(`Concept repair broke matrix structure: ${finalMatrix.issues.map((issue) => issue.detail).join(" ")}`);
  }

  const finalIssues = evaluateConcepts(territories, concepts);
  return {
    bible,
    territories,
    concepts,
    quality: {
      passed: finalIssues.length === 0,
      issues: finalIssues,
      repairedSlots: repairTargets.map(({ concept }) => concept.id),
    },
  };
}

export async function reviseConcept(
  provider: AIProvider,
  bible: CampaignBible,
  territories: Territory[],
  concepts: Concept[],
  conceptId: string,
  instruction: string,
) {
  const concept = concepts.find((item) => item.id === conceptId);
  if (!concept) throw new Error(`Concept not found: ${conceptId}`);
  return repairConcept(provider, bible, territories, concepts, concept, instruction, createFixtureRevision(concept, instruction));
}

async function generateConceptMatrix(provider: AIProvider, bible: CampaignBible, territories: Territory[]) {
  const batches = await Promise.all(
    territories.map((territory) => generateTerritoryConcepts(provider, bible, territory, false)),
  );
  return sortConceptMatrix(territories, batches.flatMap((batch) => batch.concepts));
}

async function generateTerritoryConcepts(
  provider: AIProvider,
  bible: CampaignBible,
  territory: Territory,
  repair: boolean,
) {
  const fixtureConcepts = demoConcepts.filter((concept) => concept.territoryId === territory.id);
  const result = await generateObjectWithRetry(provider, {
    name: `${repair ? "repair" : "concepts"}_${territory.id}`,
    schema: conceptBatchSchema,
    instructions: CONCEPT_INSTRUCTIONS,
    prompt: `CAMPAIGN BIBLE\n${JSON.stringify(bible)}\n\nTERRITORY\n${JSON.stringify(territory)}\n\nCreate exactly five concepts, one per execution type: ${requiredExecutionTypes.join(", ")}. ${repair ? "This is a structural repair pass; make every slot distinct and complete." : ""}`,
    fixture: {
      concepts: fixtureConcepts.length === 5
        ? fixtureConcepts
        : demoConcepts.slice(0, 5).map((concept) => ({ ...concept, territoryId: territory.id })),
    },
  });

  return {
    territoryId: territory.id,
    concepts: result.concepts.map((concept) => ({
      ...concept,
      id: canonicalConceptId(territory.id, concept.executionType),
      territoryId: territory.id,
    })),
  };
}

async function repairConcept(
  provider: AIProvider,
  bible: CampaignBible,
  territories: Territory[],
  allConcepts: Concept[],
  concept: Concept,
  instruction: string,
  fixtureOverride?: Concept,
) {
  const territory = territories.find((item) => item.id === concept.territoryId);
  if (!territory) return concept;

  const result = await generateObjectWithRetry(provider, {
    name: `repair_${concept.id}`,
    schema: conceptReplacementSchema,
    instructions: CONCEPT_REPAIR_INSTRUCTIONS,
    prompt: `CAMPAIGN CONTEXT\n${JSON.stringify(createRepairCampaignContext(bible))}\n\nTERRITORY\n${JSON.stringify(territory)}\n\nREQUIRED EXECUTION TYPE\n${concept.executionType}\n\nREPAIR REQUEST\n${instruction}\n\nRELEVANT PEERS TO AVOID DUPLICATING\n${JSON.stringify(selectRepairPeers(concept, allConcepts))}\n\nReplace only this concept slot. Keep the exact concept id ${concept.id} and territory id ${concept.territoryId}.`,
    fixture: { concept: fixtureOverride ?? concept },
  });

  return {
    ...result.concept,
    id: concept.id,
    territoryId: concept.territoryId,
    executionType: concept.executionType,
  };
}

function createQualityReviewPayload(
  bible: CampaignBible,
  territories: Territory[],
  concepts: Concept[],
  heuristicIssues: QualityIssue[],
) {
  return {
    campaign: createRepairCampaignContext(bible),
    territories: territories.map(({ id, title, premise, description }) => ({ id, title, premise, description })),
    concepts: concepts.map((concept) => ({
      id: concept.id,
      territoryId: concept.territoryId,
      executionType: concept.executionType,
      title: concept.title,
      hook: concept.hook,
      idea: concept.idea,
      productRole: concept.productRole,
      audienceTakeaway: concept.audienceTakeaway,
      primaryDuration: concept.primaryDuration,
      requirements: concept.requirements,
    })),
    heuristicIssues,
  };
}

function createRepairCampaignContext(bible: CampaignBible) {
  return {
    campaignName: bible.campaignName,
    campaignIdea: bible.campaignIdea,
    audienceSummary: bible.audienceSummary,
    visualWorld: bible.visualWorld,
    productBehavior: bible.productBehavior,
    cameraLanguage: bible.cameraLanguage,
    lighting: bible.lighting,
    palette: bible.palette,
  };
}

function selectRepairPeers(concept: Concept, allConcepts: Concept[], limit = 8) {
  const sameTerritory = allConcepts
    .filter((item) => item.id !== concept.id && item.territoryId === concept.territoryId);

  const sameIds = new Set(sameTerritory.map((item) => item.id));
  const similarElsewhere = allConcepts
    .filter((item) => item.id !== concept.id && !sameIds.has(item.id))
    .sort((a, b) => conceptSimilarity(concept, b) - conceptSimilarity(concept, a));

  return [...sameTerritory, ...similarElsewhere]
    .slice(0, Math.max(1, limit))
    .map(({ id, territoryId, executionType, title, hook }) => ({ id, territoryId, executionType, title, hook }));
}

function mergeRepairTargets(concepts: Concept[], heuristic: QualityIssue[], model: ModelQualityIssue[]) {
  const instructions = new Map<string, string[]>();
  for (const issue of heuristic) {
    if (!concepts.some((concept) => concept.id === issue.conceptId)) continue;
    const current = instructions.get(issue.conceptId) ?? [];
    current.push(issue.detail);
    instructions.set(issue.conceptId, current);
  }
  for (const issue of model) {
    if (!concepts.some((concept) => concept.id === issue.conceptId)) continue;
    const current = instructions.get(issue.conceptId) ?? [];
    current.push(issue.repairInstruction);
    instructions.set(issue.conceptId, current);
  }
  return Array.from(instructions.entries()).map(([id, reasons]) => ({
    concept: concepts.find((concept) => concept.id === id)!,
    instruction: Array.from(new Set(reasons)).join(" "),
  }));
}

function normalizeTerritories(input: Territory[]) {
  const used = new Set<string>();
  return input.map((territory, index) => {
    const base = slugify(territory.title) || `territory-${index + 1}`;
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return { ...territory, id, slot: index + 1 };
  });
}

function sortConceptMatrix(territories: Territory[], concepts: Concept[]) {
  const territoryOrder = new Map(territories.map((territory, index) => [territory.id, index]));
  const typeOrder = new Map(requiredExecutionTypes.map((type, index) => [type, index]));
  return [...concepts].sort((a, b) => {
    const territoryDelta = (territoryOrder.get(a.territoryId) ?? 99) - (territoryOrder.get(b.territoryId) ?? 99);
    if (territoryDelta !== 0) return territoryDelta;
    return (typeOrder.get(a.executionType) ?? 99) - (typeOrder.get(b.executionType) ?? 99);
  });
}

function canonicalConceptId(territoryId: string, executionType: Concept["executionType"]) {
  return `${territoryId}-${executionType.replaceAll("_", "-")}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function createFixtureRevision(concept: Concept, instruction: string): Concept {
  const direction = instruction.trim().replace(/\s+/g, " ");
  const hook = truncate(`${direction}: ${concept.hook}`, 160);
  const idea = truncate(`${concept.idea} Revision direction: ${direction}. Increase contrast in the central visual mechanism while keeping the product causal to the idea.`, 650);
  const rationale = truncate(`${concept.pro.creativeRationale} This revision specifically responds to: ${direction}.`, 500);
  return {
    ...concept,
    hook,
    idea,
    pro: { ...concept.pro, creativeRationale: rationale },
  };
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

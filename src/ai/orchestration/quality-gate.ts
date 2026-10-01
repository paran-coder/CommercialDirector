import { z } from "zod";
import type { Concept, ExecutionType } from "@/domain/concept/schema";
import type { Territory } from "@/domain/campaign/schema";

export const requiredExecutionTypes: ExecutionType[] = ["narrative", "product_spectacle", "character", "sensory", "social"];

function tokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2));
}

function jaccard(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  const union = new Set([...left, ...right]);
  if (union.size === 0) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / union.size;
}

export function conceptSimilarity(a: Concept, b: Concept) {
  return jaccard(`${a.title} ${a.hook}`, `${b.title} ${b.hook}`);
}

export const modelQualityReviewSchema = z.object({
  issues: z.array(z.object({
    conceptId: z.string().min(1),
    reason: z.enum(["brand_relevance", "distinctiveness", "visual_hook", "product_relevance", "feasibility", "cross_concept_overlap"]),
    repairInstruction: z.string().min(12).max(320),
  })).max(6),
});

export type ModelQualityIssue = z.infer<typeof modelQualityReviewSchema>["issues"][number];

export type MatrixIssue = {
  territoryId: string;
  reason: "wrong_total_count" | "wrong_territory_count" | "missing_execution_type" | "duplicate_execution_type";
  detail: string;
};

export type MatrixValidation = {
  valid: boolean;
  issues: MatrixIssue[];
  invalidTerritoryIds: string[];
};

export type QualityIssue = {
  conceptId: string;
  reason: "duplicate" | "weak_product_role";
  detail: string;
};

export function validateConceptMatrix(territories: Territory[], concepts: Concept[]): MatrixValidation {
  const issues: MatrixIssue[] = [];
  const invalidTerritories = new Set<string>();
  const expectedTotal = territories.length * requiredExecutionTypes.length;

  if (concepts.length !== expectedTotal) {
    for (const territory of territories) invalidTerritories.add(territory.id);
    issues.push({
      territoryId: "matrix",
      reason: "wrong_total_count",
      detail: `Expected ${expectedTotal} concepts but received ${concepts.length}.`,
    });
  }

  for (const territory of territories) {
    const territoryConcepts = concepts.filter((concept) => concept.territoryId === territory.id);
    if (territoryConcepts.length !== requiredExecutionTypes.length) {
      invalidTerritories.add(territory.id);
      issues.push({
        territoryId: territory.id,
        reason: "wrong_territory_count",
        detail: `Expected ${requiredExecutionTypes.length} concepts but received ${territoryConcepts.length}.`,
      });
    }

    for (const type of requiredExecutionTypes) {
      const matches = territoryConcepts.filter((concept) => concept.executionType === type);
      if (matches.length === 0) {
        invalidTerritories.add(territory.id);
        issues.push({ territoryId: territory.id, reason: "missing_execution_type", detail: `Missing ${type} slot.` });
      } else if (matches.length > 1) {
        invalidTerritories.add(territory.id);
        issues.push({ territoryId: territory.id, reason: "duplicate_execution_type", detail: `Execution type ${type} appears ${matches.length} times.` });
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    invalidTerritoryIds: Array.from(invalidTerritories),
  };
}

export function evaluateConcepts(territories: Territory[], concepts: Concept[]): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const territoryIds = new Set(territories.map((territory) => territory.id));

  for (const concept of concepts) {
    if (!territoryIds.has(concept.territoryId)) continue;
    if (concept.productRole.length < 24) {
      issues.push({ conceptId: concept.id, reason: "weak_product_role", detail: "Product role is too weak or underspecified." });
    }
  }

  for (let i = 0; i < concepts.length; i += 1) {
    for (let j = i + 1; j < concepts.length; j += 1) {
      const similarity = conceptSimilarity(concepts[i], concepts[j]);
      if (similarity >= 0.62) {
        issues.push({ conceptId: concepts[j].id, reason: "duplicate", detail: `Too similar to ${concepts[i].id} (${similarity.toFixed(2)}).` });
      }
    }
  }

  return issues;
}

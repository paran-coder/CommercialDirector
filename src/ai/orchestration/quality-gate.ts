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

export const modelQualityReviewSchema = z.object({
  issues: z.array(z.object({
    conceptId: z.string().min(1),
    reason: z.enum(["brand_relevance", "distinctiveness", "visual_hook", "product_relevance", "feasibility", "cross_concept_overlap"]),
    repairInstruction: z.string().min(12).max(320),
  })).max(6),
});

export type ModelQualityIssue = z.infer<typeof modelQualityReviewSchema>["issues"][number];

export type QualityIssue = {
  conceptId: string;
  reason: "duplicate" | "missing_execution_type" | "weak_product_role";
  detail: string;
};

export function evaluateConcepts(territories: Territory[], concepts: Concept[]): QualityIssue[] {
  const issues: QualityIssue[] = [];

  for (const territory of territories) {
    const territoryConcepts = concepts.filter((concept) => concept.territoryId === territory.id);
    for (const type of requiredExecutionTypes) {
      if (!territoryConcepts.some((concept) => concept.executionType === type)) {
        issues.push({ conceptId: territory.id, reason: "missing_execution_type", detail: `Missing ${type} slot.` });
      }
    }
  }

  for (const concept of concepts) {
    if (concept.productRole.length < 24) {
      issues.push({ conceptId: concept.id, reason: "weak_product_role", detail: "Product role is too weak or underspecified." });
    }
  }

  for (let i = 0; i < concepts.length; i += 1) {
    for (let j = i + 1; j < concepts.length; j += 1) {
      const similarity = jaccard(`${concepts[i].title} ${concepts[i].hook}`, `${concepts[j].title} ${concepts[j].hook}`);
      if (similarity >= 0.62) {
        issues.push({ conceptId: concepts[j].id, reason: "duplicate", detail: `Too similar to ${concepts[i].id} (${similarity.toFixed(2)}).` });
      }
    }
  }

  return issues;
}

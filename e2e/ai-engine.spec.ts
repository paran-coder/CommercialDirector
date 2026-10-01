import { expect, test } from "@playwright/test";
import { z } from "zod";
import type { AIProvider, GenerateObjectRequest } from "../src/ai/provider";
import { FixtureProvider } from "../src/ai/providers/fixture-provider";
import { buildCampaign } from "../src/ai/orchestration";
import { generateObjectWithRetry } from "../src/ai/orchestration/generate";
import { requiredExecutionTypes, validateConceptMatrix } from "../src/ai/orchestration/quality-gate";
import { demoBrief, demoProduct } from "../src/lib/fixtures/demo";

test("fixture campaign preserves an exact canonical 4 x 5 matrix", async () => {
  const campaign = await buildCampaign(new FixtureProvider(), demoProduct, demoBrief);

  expect(campaign.territories).toHaveLength(4);
  expect(campaign.concepts).toHaveLength(20);
  expect(validateConceptMatrix(campaign.territories, campaign.concepts).valid).toBeTruthy();

  for (const territory of campaign.territories) {
    const concepts = campaign.concepts.filter((concept) => concept.territoryId === territory.id);
    expect(concepts).toHaveLength(5);

    for (const executionType of requiredExecutionTypes) {
      const concept = concepts.find((item) => item.executionType === executionType);
      expect(concept).toBeTruthy();
      expect(concept?.id).toBe(`${territory.id}-${executionType.replaceAll("_", "-")}`);
    }
  }
});

test("matrix validation rejects duplicate execution slots", async () => {
  const campaign = await buildCampaign(new FixtureProvider(), demoProduct, demoBrief);
  const firstTerritory = campaign.territories[0];
  const territoryConcepts = campaign.concepts.filter((concept) => concept.territoryId === firstTerritory.id);
  const corrupted = campaign.concepts.map((concept) =>
    concept.id === territoryConcepts[1].id
      ? { ...concept, executionType: territoryConcepts[0].executionType }
      : concept,
  );

  const validation = validateConceptMatrix(campaign.territories, corrupted);
  expect(validation.valid).toBeFalsy();
  expect(validation.invalidTerritoryIds).toContain(firstTerritory.id);
  expect(validation.issues.some((issue) => issue.reason === "duplicate_execution_type")).toBeTruthy();
  expect(validation.issues.some((issue) => issue.reason === "missing_execution_type")).toBeTruthy();
});

test("model-call retry retries malformed structured output once", async () => {
  let calls = 0;
  const provider: AIProvider = {
    id: "flaky-fixture",
    async generateObject<T>(request: GenerateObjectRequest<T>): Promise<T> {
      calls += 1;
      if (calls === 1) throw new SyntaxError("Malformed JSON");
      return request.schema.parse(request.fixture);
    },
  };

  const schema = z.object({ value: z.string() });
  const result = await generateObjectWithRetry(provider, {
    name: "retry_contract",
    schema,
    instructions: "Return structured output.",
    prompt: "Return the fixture.",
    fixture: { value: "ok" },
  }, { baseDelayMs: 0 });

  expect(result).toEqual({ value: "ok" });
  expect(calls).toBe(2);
});

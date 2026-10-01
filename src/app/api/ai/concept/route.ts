import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { reviseConcept } from "@/ai/orchestration";
import { campaignBibleSchema, territorySchema } from "@/domain/campaign/schema";
import { conceptSchema } from "@/domain/concept/schema";
import { getProjectRepository } from "@/repositories";
import { runTrackedGeneration, TrackedGenerationError } from "@/services/tracked-generation";

export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().min(1).optional(),
  bible: campaignBibleSchema,
  territories: z.array(territorySchema).length(4),
  concepts: z.array(conceptSchema).length(20),
  conceptId: z.string().min(1),
  instruction: z.string().min(3).max(240),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const provider = getAIProvider();
    const dbProjectId = body.projectId && z.string().uuid().safeParse(body.projectId).success ? body.projectId : undefined;
    const repository = dbProjectId ? getProjectRepository() : null;

    const generated = await runTrackedGeneration({
      projectId: repository ? dbProjectId : undefined,
      kind: "concept_refinement",
      payload: { conceptId: body.conceptId, instruction: body.instruction },
      operation: async () => {
        const concept = await reviseConcept(
          provider,
          body.bible,
          body.territories,
          body.concepts,
          body.conceptId,
          body.instruction,
        );
        if (repository && dbProjectId) await repository.saveConceptRevision(dbProjectId, concept, body.instruction);
        return concept;
      },
    });

    return Response.json({
      provider: provider.id,
      generationId: generated.generationId,
      attempts: generated.attempts,
      persisted: Boolean(repository && dbProjectId),
      concept: generated.output,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const generationId = error instanceof TrackedGenerationError ? error.generationId : null;
    return Response.json({ error: message, generationId }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { buildCampaign } from "@/ai/orchestration";
import { creativeBriefSchema } from "@/domain/brief/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";
import { getProjectRepository } from "@/repositories";
import { runTrackedGeneration, TrackedGenerationError } from "@/services/tracked-generation";

export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().min(1).optional(),
  product: productIntelligenceSchema,
  brief: creativeBriefSchema,
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const provider = getAIProvider();
    const dbProjectId = body.projectId && z.string().uuid().safeParse(body.projectId).success ? body.projectId : undefined;
    const repository = dbProjectId ? getProjectRepository() : null;

    const generated = await runTrackedGeneration({
      projectId: repository ? dbProjectId : undefined,
      kind: "campaign",
      payload: { product: body.product, brief: body.brief },
      operation: async () => {
        const campaign = await buildCampaign(provider, body.product, body.brief);
        if (repository && dbProjectId) {
          await repository.saveCampaign(dbProjectId, { brief: body.brief, ...campaign });
        }
        return campaign;
      },
    });

    return Response.json({
      provider: provider.id,
      generationId: generated.generationId,
      attempts: generated.attempts,
      persisted: Boolean(repository && dbProjectId),
      ...generated.output,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const generationId = error instanceof TrackedGenerationError ? error.generationId : null;
    return Response.json({ error: message, generationId }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

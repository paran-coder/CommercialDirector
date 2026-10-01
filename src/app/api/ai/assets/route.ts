import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { buildAssetBible } from "@/ai/orchestration/assets";
import { campaignBibleSchema, territorySchema } from "@/domain/campaign/schema";
import { conceptSchema } from "@/domain/concept/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";
import { getProjectRepository } from "@/repositories";
import { runTrackedGeneration, TrackedGenerationError } from "@/services/tracked-generation";

export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().min(1),
  product: productIntelligenceSchema,
  bible: campaignBibleSchema,
  territories: z.array(territorySchema).length(4),
  concepts: z.array(conceptSchema).length(20),
  shortlist: z.array(z.string().min(1)).min(1).max(5),
  sourceCampaignRevision: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const provider = getAIProvider();
    const isDatabaseProject = z.string().uuid().safeParse(body.projectId).success;
    const repository = isDatabaseProject ? getProjectRepository() : null;

    const serverProject = repository ? await repository.getProject(body.projectId) : null;
    if (repository && !serverProject) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    const product = serverProject?.product ?? body.product;
    const bible = serverProject?.bible ?? body.bible;
    const territories = serverProject?.territories ?? body.territories;
    const concepts = serverProject?.concepts ?? body.concepts;
    const shortlist = serverProject?.shortlist ?? body.shortlist;
    const sourceCampaignRevision = serverProject?.campaignRevisions.at(-1)?.revision ?? body.sourceCampaignRevision;

    if (!product || !bible || !territories || !concepts || !sourceCampaignRevision) {
      return Response.json({ error: "Complete the campaign before building an Asset Bible." }, { status: 409 });
    }
    if (shortlist.length < 1 || shortlist.length > 5) {
      return Response.json({ error: "Asset Bible requires between 1 and 5 shortlisted concepts." }, { status: 409 });
    }

    const generated = await runTrackedGeneration({
      projectId: repository ? body.projectId : undefined,
      kind: "asset_bible",
      payload: {
        sourceCampaignRevision,
        sourceConceptKeys: shortlist,
      },
      operation: () => buildAssetBible(provider, {
        product,
        bible,
        territories,
        concepts,
        shortlist,
      }),
      commit: repository
        ? async (result) => {
            await repository.saveAssetBible(body.projectId, {
              assetBible: result.assetBible,
              sourceCampaignRevision,
              sourceConceptKeys: shortlist,
            });
          }
        : undefined,
    });

    return Response.json({
      provider: provider.id,
      generationId: generated.generationId,
      attempts: generated.attempts,
      persisted: Boolean(repository),
      sourceCampaignRevision,
      sourceConceptKeys: shortlist,
      ...generated.output,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const generationId = error instanceof TrackedGenerationError ? error.generationId : null;
    return Response.json({ error: message, generationId }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

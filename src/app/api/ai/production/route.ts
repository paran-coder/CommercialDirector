import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { buildProductionPlan } from "@/ai/orchestration/production";
import { assetBibleSchema } from "@/domain/assets/schema";
import { campaignBibleSchema, territorySchema } from "@/domain/campaign/schema";
import { conceptSchema } from "@/domain/concept/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";
import { getConceptRevisionSnapshot, isAssetBibleCurrent } from "@/domain/project/schema";
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
  assetBible: assetBibleSchema,
  sourceCampaignRevision: z.number().int().positive(),
  sourceAssetBibleRevision: z.number().int().positive(),
  sourceConceptRevisions: z.record(z.string(), z.number().int().positive()),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const provider = getAIProvider();
    const isDatabaseProject = z.string().uuid().safeParse(body.projectId).success;
    const repository = isDatabaseProject ? getProjectRepository() : null;
    const serverProject = repository ? await repository.getProject(body.projectId) : null;

    if (repository && !serverProject) {
      return Response.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    if (serverProject && !isAssetBibleCurrent(serverProject)) {
      return Response.json({ error: "Production Planning 전에 현재 Campaign과 shortlist 기준으로 Asset Bible을 다시 생성해 주세요." }, { status: 409 });
    }

    const product = serverProject?.product ?? body.product;
    const bible = serverProject?.bible ?? body.bible;
    const territories = serverProject?.territories ?? body.territories;
    const concepts = serverProject?.concepts ?? body.concepts;
    const shortlist = serverProject?.shortlist ?? body.shortlist;
    const assetBible = serverProject?.assetBible ?? body.assetBible;
    const sourceCampaignRevision = serverProject?.campaignRevisions.at(-1)?.revision ?? body.sourceCampaignRevision;
    const sourceAssetBibleRevision = serverProject?.assetBibleRevisions.at(-1)?.revision ?? body.sourceAssetBibleRevision;
    const sourceConceptRevisions = serverProject
      ? getConceptRevisionSnapshot(serverProject, shortlist)
      : body.sourceConceptRevisions;

    if (!product || !bible || !territories || !concepts || !assetBible || !sourceCampaignRevision || !sourceAssetBibleRevision) {
      return Response.json({ error: "Production Planning 전에 Current 상태의 Asset Bible을 준비해 주세요." }, { status: 409 });
    }
    if (shortlist.length < 1 || shortlist.length > 5) {
      return Response.json({ error: "Production Planning에는 1~5개의 shortlisted Concept가 필요합니다." }, { status: 409 });
    }

    const generated = await runTrackedGeneration({
      projectId: repository ? body.projectId : undefined,
      kind: "production_plan",
      payload: {
        sourceCampaignRevision,
        sourceAssetBibleRevision,
        sourceConceptKeys: shortlist,
        sourceConceptRevisions,
      },
      operation: () => buildProductionPlan(provider, {
        product,
        bible,
        territories,
        concepts,
        shortlist,
        assetBible,
      }),
      commit: repository
        ? async (result) => {
            const current = await repository.getProject(body.projectId);
            const currentCampaignRevision = current?.campaignRevisions.at(-1)?.revision;
            const currentAssetBibleRevision = current?.assetBibleRevisions.at(-1)?.revision;
            if (
              !current ||
              !isAssetBibleCurrent(current) ||
              currentCampaignRevision !== sourceCampaignRevision ||
              currentAssetBibleRevision !== sourceAssetBibleRevision ||
              !sameSet(current.shortlist, shortlist) ||
              !sameRevisionSnapshot(getConceptRevisionSnapshot(current, shortlist), sourceConceptRevisions)
            ) {
              throw new Error("Production Plan 생성 중 Campaign, Asset Bible, shortlist 또는 Concept revision이 변경되었습니다. 현재 소스에서 다시 생성해 주세요.");
            }
            await repository.saveProductionPlan(body.projectId, {
              productionPlan: result.productionPlan,
              sourceCampaignRevision,
              sourceAssetBibleRevision,
              sourceConceptKeys: shortlist,
              sourceConceptRevisions,
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
      sourceAssetBibleRevision,
      sourceConceptKeys: shortlist,
      sourceConceptRevisions,
      ...generated.output,
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? "입력값 형식이 올바르지 않습니다." : error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    const generationId = error instanceof TrackedGenerationError ? error.generationId : null;
    return Response.json({ error: message, generationId }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

function sameSet(left: string[], right: string[]) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}


function sameRevisionSnapshot(left: Record<string, number>, right: Record<string, number>) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  return keys.every((key) => left[key] === right[key]);
}

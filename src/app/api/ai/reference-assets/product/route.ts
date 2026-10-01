import { z } from "zod";
import { getImageGenerationProvider } from "@/ai/image-generation";
import { getImageArtifactStore } from "@/ai/image-generation/store-factory";
import { buildProductReferenceRenderRequest } from "@/ai/orchestration/reference-assets";
import { isAssetBibleCurrent } from "@/domain/project/schema";
import {
  getProjectRepository,
  getReferenceAssetRepository,
} from "@/repositories";
import { runTrackedGeneration, TrackedGenerationError } from "@/services/tracked-generation";
import type { ReferenceAssetRevision } from "@/domain/reference-assets/schema";

export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const projectId = z.string().uuid().parse(new URL(request.url).searchParams.get("projectId"));
    const projectRepository = getProjectRepository();
    const referenceAssetRepository = getReferenceAssetRepository();

    if (!projectRepository || !referenceAssetRepository) {
      return Response.json(
        { error: "Reference Asset 조회에는 PostgreSQL runtime이 필요합니다." },
        { status: 503 },
      );
    }

    const project = await projectRepository.getProject(projectId);
    if (!project) {
      return Response.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    const state = await referenceAssetRepository.getLatestRevisionState(projectId, "product-main");
    const continuityChecks = await referenceAssetRepository.listContinuityChecks(projectId, "product-main");

    return Response.json({
      referenceAsset: state?.revision ?? null,
      current: state?.current ?? false,
      continuityChecks,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const projectRepository = getProjectRepository();
    const referenceAssetRepository = getReferenceAssetRepository();

    if (!projectRepository || !referenceAssetRepository) {
      return Response.json(
        { error: "Reference Asset 생성에는 PostgreSQL runtime이 필요합니다." },
        { status: 503 },
      );
    }

    const project = await projectRepository.getProject(body.projectId);
    if (!project) {
      return Response.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    const sourceAssetBibleRevision = project.assetBibleRevisions.at(-1)?.revision;
    if (
      !project.product
      || !project.assetBible
      || !sourceAssetBibleRevision
      || !isAssetBibleCurrent(project)
    ) {
      return Response.json(
        { error: "Product Reference를 만들기 전에 Current Asset Bible을 준비해 주세요." },
        { status: 409 },
      );
    }

    const renderRequest = buildProductReferenceRenderRequest({
      projectId: project.id,
      sourceAssetBibleRevision,
      product: project.product,
      assetBible: project.assetBible,
    });

    const provider = getImageGenerationProvider();
    const artifactStore = getImageArtifactStore();
    let persistedRevision: ReferenceAssetRevision | null = null;

    const generated = await runTrackedGeneration({
      projectId: project.id,
      kind: "reference_asset",
      payload: {
        sourceAssetBibleRevision,
        stableKey: renderRequest.target.stableKey,
        kind: renderRequest.target.kind,
      },
      operation: () => provider.generate(renderRequest),
      jobOutput: (result) => ({
        requestId: result.requestId,
        mimeType: result.mimeType,
        width: result.width,
        height: result.height,
        generatedAt: result.generatedAt,
      }),
      commit: async (result) => {
        const currentProject = await projectRepository.getProject(project.id);
        const currentAssetBibleRevision = currentProject?.assetBibleRevisions.at(-1)?.revision;
        if (
          !currentProject
          || !isAssetBibleCurrent(currentProject)
          || currentAssetBibleRevision !== sourceAssetBibleRevision
        ) {
          throw new Error(
            "Reference Asset 생성 중 Campaign, shortlist 또는 Asset Bible이 변경되었습니다. 현재 Asset Bible을 기준으로 다시 생성해 주세요.",
          );
        }

        await referenceAssetRepository.assertCurrentSource(
          project.id,
          sourceAssetBibleRevision,
        );

        const artifact = await artifactStore.persist({
          projectId: project.id,
          sourceAssetBibleRevision,
          target: renderRequest.target,
          result,
        });

        persistedRevision = await referenceAssetRepository.saveRevision(project.id, {
          sourceAssetBibleRevision,
          target: renderRequest.target,
          renderRequest,
          artifact,
        });
      },
    });

    if (!persistedRevision) {
      throw new Error("Reference Asset generation completed without a persisted revision.");
    }

    return Response.json({
      generationId: generated.generationId,
      attempts: generated.attempts,
      referenceAsset: persistedRevision,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown) {
  const message = error instanceof z.ZodError
    ? "입력값 형식이 올바르지 않습니다."
    : error instanceof Error
      ? error.message
      : "알 수 없는 오류가 발생했습니다.";
  const generationId = error instanceof TrackedGenerationError ? error.generationId : null;

  return Response.json({
    error: message,
    generationId,
  }, {
    status: error instanceof z.ZodError ? 400 : 500,
  });
}

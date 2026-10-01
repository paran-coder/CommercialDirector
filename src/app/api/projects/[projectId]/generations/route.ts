import { getProjectRepository } from "@/repositories";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const repository = getProjectRepository();
  if (!repository) {
    return Response.json({
      code: "PERSISTENCE_UNAVAILABLE",
      error: "DATABASE_URL is not configured.",
    }, { status: 503 });
  }

  const { projectId } = await context.params;
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(requestedLimit) ? requestedLimit : 20;
  const generations = await repository.listGenerationJobs(projectId, limit);
  return Response.json({ generations });
}

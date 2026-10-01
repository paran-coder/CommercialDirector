import { getProjectRepository } from "@/repositories";
import { projectRuntimePatchSchema } from "@/domain/project/schema";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const repository = getProjectRepository();
  if (!repository) return persistenceUnavailable();
  const { projectId } = await context.params;
  const project = await repository.getProject(projectId);
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
  return Response.json({ project });
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const repository = getProjectRepository();
  if (!repository) return persistenceUnavailable();

  try {
    const { projectId } = await context.params;
    const patch = projectRuntimePatchSchema.parse(await request.json());
    const project = await repository.updateProject(projectId, patch);
    if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
    return Response.json({ project });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}

function persistenceUnavailable() {
  return Response.json({
    code: "PERSISTENCE_UNAVAILABLE",
    error: "DATABASE_URL is not configured. Browser fallback may be used.",
  }, { status: 503 });
}

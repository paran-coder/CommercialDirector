import { z } from "zod";
import { getProjectRepository } from "@/repositories";

export const runtime = "nodejs";

const requestSchema = z.object({
  conceptIds: z.array(z.string().min(1)).max(20),
});

export async function PUT(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const repository = getProjectRepository();
  if (!repository) return persistenceUnavailable();

  try {
    const { projectId } = await context.params;
    const body = requestSchema.parse(await request.json());
    const project = await repository.setShortlist(projectId, body.conceptIds);
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

import { z } from "zod";
import { getProjectRepository } from "@/repositories";
import { productIntelligenceSchema } from "@/domain/product/schema";

export const runtime = "nodejs";

const createProjectSchema = z.object({
  product: productIntelligenceSchema,
  brandName: z.string().max(120).optional(),
  productName: z.string().max(160).optional(),
});

export async function GET() {
  const repository = getProjectRepository();
  if (!repository) return persistenceUnavailable();
  const projects = await repository.listProjects();
  return Response.json({ projects });
}

export async function POST(request: Request) {
  const repository = getProjectRepository();
  if (!repository) return persistenceUnavailable();

  try {
    const body = createProjectSchema.parse(await request.json());
    const project = await repository.createProject(body.product, {
      brandName: body.brandName,
      productName: body.productName,
    });
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return Response.json({ error: messageFrom(error) }, { status: 400 });
  }
}

function persistenceUnavailable() {
  return Response.json({
    code: "PERSISTENCE_UNAVAILABLE",
    error: "DATABASE_URL is not configured. Browser fallback may be used.",
  }, { status: 503 });
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { buildCampaign } from "@/ai/orchestration";
import { creativeBriefSchema } from "@/domain/brief/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";

export const runtime = "nodejs";

const requestSchema = z.object({
  product: productIntelligenceSchema,
  brief: creativeBriefSchema,
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const provider = getAIProvider();
    const campaign = await buildCampaign(provider, body.product, body.brief);
    return Response.json({ provider: provider.id, ...campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}

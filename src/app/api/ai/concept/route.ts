import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { reviseConcept } from "@/ai/orchestration";
import { campaignBibleSchema, territorySchema } from "@/domain/campaign/schema";
import { conceptSchema } from "@/domain/concept/schema";

export const runtime = "nodejs";

const requestSchema = z.object({
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
    const concept = await reviseConcept(provider, body.bible, body.territories, body.concepts, body.conceptId, body.instruction);
    return Response.json({ provider: provider.id, concept });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}

import { z } from "zod";
import { getAIProvider } from "@/ai/providers";
import { analyzeProduct } from "@/ai/orchestration";

export const runtime = "nodejs";

const requestSchema = z.object({
  imageDataUrl: z.string().regex(/^data:image\/(?:jpeg|png|webp);base64,/).max(12_000_000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const provider = getAIProvider();
    const product = await analyzeProduct(provider, body.imageDataUrl);
    return Response.json({ provider: provider.id, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}

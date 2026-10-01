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
    const message = error instanceof z.ZodError ? "입력값 형식이 올바르지 않습니다." : error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return Response.json({ error: message }, { status: 400 });
  }
}

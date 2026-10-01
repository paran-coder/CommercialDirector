import { renderResultSchema, type RenderRequest } from "@/domain/reference-assets/schema";
import type { ImageGenerationProvider } from "@/ai/image-generation/provider";

const ONE_PIXEL_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z1mUAAAAASUVORK5CYII=";

export class FixtureImageGenerationProvider implements ImageGenerationProvider {
  async generate(request: RenderRequest) {
    return renderResultSchema.parse({
      requestId: `fixture-${request.target.stableKey}-asset-r${request.sourceAssetBibleRevision}`,
      imageBase64: ONE_PIXEL_PNG,
      mimeType: "image/png",
      generatedAt: new Date().toISOString(),
    });
  }
}

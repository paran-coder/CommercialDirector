import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { renderResultSchema, type RenderRequest } from "@/domain/reference-assets/schema";
import type { ImageGenerationProvider } from "@/ai/image-generation/provider";

function sizeForAspectRatio(aspectRatio: RenderRequest["aspectRatio"]) {
  switch (aspectRatio) {
    case "1:1":
      return "1024x1024" as const;
    case "4:5":
    case "2:3":
      return "1024x1536" as const;
    case "3:2":
    case "16:9":
      return "1536x1024" as const;
  }
}

export class OpenAIImageGenerationProvider implements ImageGenerationProvider {
  constructor(
    private readonly client: OpenAI,
    private readonly model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
  ) {}

  async generate(request: RenderRequest) {
    const response = await this.client.images.generate({
      model: this.model,
      prompt: [
        request.prompt,
        request.negativeConstraints.length
          ? `Negative constraints: ${request.negativeConstraints.join("; ")}`
          : "",
      ].filter(Boolean).join("\n\n"),
      n: 1,
      size: sizeForAspectRatio(request.aspectRatio),
      quality: "medium",
      output_format: "png",
    });

    const image = response.data?.[0];
    if (!image) {
      throw new Error("OpenAI image generation returned no image.");
    }

    let imageBase64 = image.b64_json;
    if (!imageBase64 && image.url) {
      const downloaded = await fetch(image.url);
      if (!downloaded.ok) {
        throw new Error(`OpenAI image download failed with status ${downloaded.status}.`);
      }
      imageBase64 = Buffer.from(await downloaded.arrayBuffer()).toString("base64");
    }

    if (!imageBase64) {
      throw new Error("OpenAI image generation returned neither base64 content nor a downloadable URL.");
    }

    return renderResultSchema.parse({
      requestId: `openai-${randomUUID()}`,
      imageBase64,
      mimeType: "image/png",
      generatedAt: new Date(response.created * 1000).toISOString(),
    });
  }
}

import OpenAI from "openai";
import type { ImageGenerationProvider } from "@/ai/image-generation/provider";
import { FixtureImageGenerationProvider } from "@/ai/image-generation/fixture-provider";
import { OpenAIImageGenerationProvider } from "@/ai/image-generation/openai-provider";

export function getImageGenerationProvider(): ImageGenerationProvider {
  const provider = process.env.IMAGE_PROVIDER || "fixture";

  if (provider === "fixture") {
    return new FixtureImageGenerationProvider();
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required when IMAGE_PROVIDER=openai.");
    }

    return new OpenAIImageGenerationProvider(new OpenAI({ apiKey }));
  }

  throw new Error(`Unsupported IMAGE_PROVIDER: ${provider}`);
}

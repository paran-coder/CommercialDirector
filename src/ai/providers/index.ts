import type { AIProvider } from "@/ai/provider";
import { FixtureProvider } from "@/ai/providers/fixture-provider";
import { OpenAIProvider } from "@/ai/providers/openai-provider";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "fixture";

  if (provider === "fixture") return new FixtureProvider();

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai.");
    return new OpenAIProvider(apiKey, process.env.OPENAI_MODEL ?? "gpt-5.6-terra");
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

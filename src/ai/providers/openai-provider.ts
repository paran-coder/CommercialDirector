import OpenAI from "openai";
import { z } from "zod";
import type { AIProvider, GenerateObjectRequest } from "@/ai/provider";

export class OpenAIProvider implements AIProvider {
  readonly id = "openai";
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateObject<T>(request: GenerateObjectRequest<T>): Promise<T> {
    const schema = z.toJSONSchema(request.schema);
    const content: Array<
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string; detail: "high" }
    > = [{ type: "input_text", text: request.prompt }];

    if (request.imageDataUrl) {
      content.push({ type: "input_image", image_url: request.imageDataUrl, detail: "high" });
    }

    const response = await this.client.responses.create({
      model: this.model,
      store: false,
      reasoning: request.reasoningEffort ? { effort: request.reasoningEffort } : undefined,
      instructions: request.instructions,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: request.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64),
          schema,
          strict: true,
        },
      },
    });

    if (!response.output_text) {
      throw new Error(`OpenAI returned no structured output for ${request.name}.`);
    }

    return request.schema.parse(JSON.parse(response.output_text));
  }
}

import {
  renderRequestSchema,
  renderResultSchema,
  type RenderRequest,
  type RenderResult,
} from "@/domain/reference-assets/schema";

export interface ImageGenerationProvider {
  generate(request: RenderRequest): Promise<RenderResult>;
}

export function parseRenderRequest(input: unknown) {
  return renderRequestSchema.parse(input);
}

export function parseRenderResult(input: unknown) {
  return renderResultSchema.parse(input);
}

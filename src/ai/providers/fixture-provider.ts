import type { AIProvider, GenerateObjectRequest } from "@/ai/provider";

export class FixtureProvider implements AIProvider {
  readonly id = "fixture";

  async generateObject<T>(request: GenerateObjectRequest<T>): Promise<T> {
    return request.schema.parse(structuredClone(request.fixture));
  }
}

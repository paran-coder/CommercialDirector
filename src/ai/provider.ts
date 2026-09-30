import type { ZodType } from "zod";

export type GenerateObjectRequest<T> = {
  name: string;
  schema: ZodType<T>;
  instructions: string;
  prompt: string;
  imageDataUrl?: string;
  fixture: T;
};

export interface AIProvider {
  readonly id: string;
  generateObject<T>(request: GenerateObjectRequest<T>): Promise<T>;
}

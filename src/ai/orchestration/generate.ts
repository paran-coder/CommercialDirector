import type { AIProvider, GenerateObjectRequest } from "@/ai/provider";
import { ZodError } from "zod";

export type GenerationRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

export async function generateObjectWithRetry<T>(
  provider: AIProvider,
  request: GenerateObjectRequest<T>,
  options: GenerationRetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, Math.min(options.maxAttempts ?? 2, 3));
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 250);
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await provider.generateObject(request);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !isRetryableGenerationError(error)) throw error;
      if (baseDelayMs > 0) await delay(baseDelayMs * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI generation failed.");
}

export function isRetryableGenerationError(error: unknown) {
  if (error instanceof SyntaxError || error instanceof ZodError) return true;
  if (!error || typeof error !== "object") return true;

  const status = "status" in error && typeof error.status === "number" ? error.status : undefined;
  if (status === undefined) return true;
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

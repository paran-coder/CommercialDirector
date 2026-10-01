import { getProjectRepository } from "@/repositories";
import type { GenerationKind } from "@/repositories/project-repository";

export class TrackedGenerationError extends Error {
  constructor(message: string, readonly generationId: string | null) {
    super(message);
    this.name = "TrackedGenerationError";
  }
}

export async function runTrackedGeneration<T>(input: {
  projectId?: string;
  kind: GenerationKind;
  payload: unknown;
  maxAttempts?: number;
  operation(): Promise<T>;
}) {
  const maxAttempts = Math.max(1, Math.min(input.maxAttempts ?? 2, 3));
  const repository = input.projectId ? getProjectRepository() : null;
  const job = repository && input.projectId
    ? await repository.createGenerationJob({
        projectId: input.projectId,
        kind: input.kind,
        payload: input.payload,
        maxAttempts,
      })
    : null;

  let lastError = "Generation failed.";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (job && repository) await repository.markGenerationRunning(job.id, attempt);

    try {
      const output = await input.operation();
      if (job && repository) await repository.completeGeneration(job.id, output, attempt);
      return { output, generationId: job?.id ?? null, attempts: attempt };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Generation failed.";
      if (job && repository) {
        await repository.recordGenerationFailure(job.id, lastError, attempt, attempt === maxAttempts);
      }
      if (attempt === maxAttempts) throw new TrackedGenerationError(lastError, job?.id ?? null);
    }
  }

  throw new TrackedGenerationError(lastError, job?.id ?? null);
}

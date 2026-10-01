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
  commit?(output: T): Promise<void>;
  jobOutput?(output: T): unknown;
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

    let output: T;
    try {
      output = await input.operation();
    } catch (error) {
      lastError = messageFrom(error, "Generation failed.");
      if (job && repository) {
        await repository.recordGenerationFailure(job.id, lastError, attempt, attempt === maxAttempts);
      }
      if (attempt === maxAttempts) throw new TrackedGenerationError(lastError, job?.id ?? null);
      continue;
    }

    if (input.commit) {
      try {
        await input.commit(output);
      } catch (error) {
        lastError = `Persistence failed after successful generation: ${messageFrom(error, "Unknown persistence error")}`;
        if (job && repository) {
          await repository.recordGenerationFailure(job.id, lastError, attempt, true);
        }
        throw new TrackedGenerationError(lastError, job?.id ?? null);
      }
    }

    if (job && repository) {
      try {
        await repository.completeGeneration(
          job.id,
          input.jobOutput ? input.jobOutput(output) : output,
          attempt,
        );
      } catch {
        // Generation and persistence already succeeded. Job bookkeeping must not trigger duplicate AI work.
      }
    }

    return { output, generationId: job?.id ?? null, attempts: attempt };
  }

  throw new TrackedGenerationError(lastError, job?.id ?? null);
}

function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

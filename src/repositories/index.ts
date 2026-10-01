import { getDatabase } from "@/db/client";
import { PostgresProjectRepository } from "@/repositories/postgres-project-repository";
import { PostgresReferenceAssetRepository } from "@/repositories/postgres-reference-asset-repository";
import type { ProjectRepository } from "@/repositories/project-repository";
import type { ReferenceAssetRepository } from "@/repositories/reference-asset-repository";

let repository: ProjectRepository | null | undefined;
let referenceAssetRepository: ReferenceAssetRepository | null | undefined;

export function getProjectRepository(): ProjectRepository | null {
  if (repository !== undefined) return repository;
  const database = getDatabase();
  repository = database ? new PostgresProjectRepository(database) : null;
  return repository;
}

export function getReferenceAssetRepository(): ReferenceAssetRepository | null {
  if (referenceAssetRepository !== undefined) return referenceAssetRepository;
  const database = getDatabase();
  referenceAssetRepository = database ? new PostgresReferenceAssetRepository(database) : null;
  return referenceAssetRepository;
}

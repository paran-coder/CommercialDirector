import { getDatabase } from "@/db/client";
import { PostgresProjectRepository } from "@/repositories/postgres-project-repository";
import type { ProjectRepository } from "@/repositories/project-repository";

let repository: ProjectRepository | null | undefined;

export function getProjectRepository(): ProjectRepository | null {
  if (repository !== undefined) return repository;
  const database = getDatabase();
  repository = database ? new PostgresProjectRepository(database) : null;
  return repository;
}

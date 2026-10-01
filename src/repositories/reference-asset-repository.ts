import type {
  ContinuityCheck,
  ReferenceAssetRevision,
  ReferenceAssetTarget,
} from "@/domain/reference-assets/schema";

export type ReferenceAssetRevisionSaveInput = Omit<ReferenceAssetRevision, "revision" | "createdAt">;

export interface ReferenceAssetRevisionState {
  revision: ReferenceAssetRevision;
  current: boolean;
}

export interface ReferenceAssetRepository {
  saveRevision(projectId: string, input: ReferenceAssetRevisionSaveInput): Promise<ReferenceAssetRevision>;
  listRevisions(projectId: string, stableKey: string): Promise<ReferenceAssetRevision[]>;
  getLatestRevision(projectId: string, stableKey: string): Promise<ReferenceAssetRevision | null>;
  getLatestRevisionState(projectId: string, stableKey: string): Promise<ReferenceAssetRevisionState | null>;
  saveContinuityCheck(projectId: string, check: ContinuityCheck): Promise<ContinuityCheck>;
  listContinuityChecks(projectId: string, stableKey: string): Promise<ContinuityCheck[]>;
  getCurrentAssetBibleRevision(projectId: string): Promise<number | null>;
  assertCurrentSource(projectId: string, sourceAssetBibleRevision: number): Promise<void>;
  assertTargetExists(projectId: string, target: ReferenceAssetTarget, revision: number): Promise<void>;
}

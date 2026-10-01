import type {
  ReferenceAssetTarget,
  RenderArtifact,
  RenderResult,
} from "@/domain/reference-assets/schema";

export interface PersistRenderArtifactInput {
  projectId: string;
  sourceAssetBibleRevision: number;
  target: ReferenceAssetTarget;
  result: RenderResult;
}

export interface ImageArtifactStore {
  persist(input: PersistRenderArtifactInput): Promise<RenderArtifact>;
}

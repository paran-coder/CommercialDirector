import type { CreativeBrief } from "@/domain/brief/schema";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import type { AssetBible } from "@/domain/assets/schema";
import type { ProductionPlan } from "@/domain/production/schema";
import type { ProjectRuntimePatch, ProjectSnapshot } from "@/domain/project/schema";

export type GenerationKind =
  | "campaign"
  | "concept_refinement"
  | "asset_bible"
  | "production_plan"
  | "reference_asset"
  | "continuity_check";
export type GenerationStatus = "pending" | "running" | "succeeded" | "failed";

export interface GenerationJobRecord {
  id: string;
  projectId: string;
  kind: GenerationKind;
  status: GenerationStatus;
  attempt: number;
  maxAttempts: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CampaignSaveInput {
  brief: CreativeBrief;
  bible: CampaignBible;
  territories: Territory[];
  concepts: Concept[];
}

export interface AssetBibleSaveInput {
  assetBible: AssetBible;
  sourceCampaignRevision: number;
  sourceConceptKeys: string[];
}

export interface ProductionPlanSaveInput {
  productionPlan: ProductionPlan;
  sourceCampaignRevision: number;
  sourceAssetBibleRevision: number;
  sourceConceptKeys: string[];
  sourceConceptRevisions: Record<string, number>;
}

export interface ProjectRepository {
  createProject(product: ProductIntelligence, metadata?: { brandName?: string; productName?: string }): Promise<ProjectSnapshot>;
  listProjects(): Promise<ProjectSnapshot[]>;
  getProject(id: string): Promise<ProjectSnapshot | null>;
  updateProject(id: string, patch: ProjectRuntimePatch): Promise<ProjectSnapshot | null>;
  saveCampaign(id: string, result: CampaignSaveInput): Promise<ProjectSnapshot>;
  saveConceptRevision(id: string, concept: Concept, instruction: string): Promise<ProjectSnapshot>;
  saveAssetBible(id: string, input: AssetBibleSaveInput): Promise<ProjectSnapshot>;
  saveProductionPlan(id: string, input: ProductionPlanSaveInput): Promise<ProjectSnapshot>;
  setShortlist(id: string, conceptIds: string[]): Promise<ProjectSnapshot>;
  createGenerationJob(input: {
    projectId: string;
    kind: GenerationKind;
    payload: unknown;
    maxAttempts: number;
  }): Promise<GenerationJobRecord>;
  markGenerationRunning(id: string, attempt: number): Promise<void>;
  completeGeneration(id: string, output: unknown, attempt: number): Promise<void>;
  recordGenerationFailure(id: string, error: string, attempt: number, final: boolean): Promise<void>;
  listGenerationJobs(projectId: string, limit?: number): Promise<GenerationJobRecord[]>;
}

import { and, asc, desc, eq, inArray, max } from "drizzle-orm";
import type { AppDatabase } from "@/db/client";
import {
  assetBibleRevisions,
  campaignBibleRevisions,
  conceptRevisions,
  concepts,
  creativeBriefs,
  generationJobs,
  products,
  projects,
  shortlist,
  territories,
  workspaces,
} from "@/db/schema";
import { creativeBriefSchema } from "@/domain/brief/schema";
import { conceptSchema } from "@/domain/concept/schema";
import { productIntelligenceSchema } from "@/domain/product/schema";
import {
  assetBibleRevisionSchema,
  campaignRevisionDataSchema,
  localProjectSnapshotSchema,
  type ProjectRuntimePatch,
  type ProjectSnapshot,
} from "@/domain/project/schema";
import { territorySchema } from "@/domain/campaign/schema";
import { assetBibleSchema } from "@/domain/assets/schema";
import type {
  AssetBibleSaveInput,
  CampaignSaveInput,
  GenerationJobRecord,
  ProjectRepository,
} from "@/repositories/project-repository";

const DEFAULT_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";

export class PostgresProjectRepository implements ProjectRepository {
  constructor(private readonly db: AppDatabase) {}

  async createProject(product: Parameters<ProjectRepository["createProject"]>[0], metadata?: Parameters<ProjectRepository["createProject"]>[1]) {
    const projectId = await this.db.transaction(async (tx) => {
      await tx.insert(workspaces).values({ id: DEFAULT_WORKSPACE_ID, name: "Default Workspace" }).onConflictDoNothing();
      const [project] = await tx.insert(projects).values({
        workspaceId: DEFAULT_WORKSPACE_ID,
        brandName: metadata?.brandName?.trim() || "Untitled brand",
        productName: metadata?.productName?.trim() || product.subcategory || product.category,
      }).returning({ id: projects.id });

      await tx.insert(products).values({ projectId: project.id, intelligence: product });
      return project.id;
    });

    const snapshot = await this.getProject(projectId);
    if (!snapshot) throw new Error("Project was created but could not be loaded.");
    return snapshot;
  }

  async listProjects() {
    const rows = await this.db.select({ id: projects.id }).from(projects).orderBy(desc(projects.updatedAt));
    const snapshots = await Promise.all(rows.map((row) => this.getProject(row.id)));
    return snapshots.filter((item): item is ProjectSnapshot => Boolean(item));
  }

  async getProject(id: string): Promise<ProjectSnapshot | null> {
    const [project] = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) return null;

    const [productRows, briefRows, campaignRows, assetBibleRows, territoryRows, conceptRows, shortlistRows] = await Promise.all([
      this.db.select().from(products).where(eq(products.projectId, id)).limit(1),
      this.db.select().from(creativeBriefs).where(eq(creativeBriefs.projectId, id)).limit(1),
      this.db.select().from(campaignBibleRevisions).where(eq(campaignBibleRevisions.projectId, id)).orderBy(asc(campaignBibleRevisions.revision)),
      this.db.select().from(assetBibleRevisions).where(eq(assetBibleRevisions.projectId, id)).orderBy(asc(assetBibleRevisions.revision)),
      this.db.select().from(territories).where(eq(territories.projectId, id)).orderBy(asc(territories.slot)),
      this.db.select().from(concepts).where(eq(concepts.projectId, id)).orderBy(asc(concepts.stableKey)),
      this.db.select().from(shortlist).where(eq(shortlist.projectId, id)),
    ]);

    const conceptIds = conceptRows.map((row) => row.id);
    const revisionRows = conceptIds.length
      ? await this.db.select().from(conceptRevisions).where(inArray(conceptRevisions.conceptId, conceptIds)).orderBy(asc(conceptRevisions.revision))
      : [];

    const stableKeyByUuid = new Map(conceptRows.map((row) => [row.id, row.stableKey]));
    const latestRevisionByConcept = new Map<string, typeof revisionRows[number]>();
    for (const revision of revisionRows) latestRevisionByConcept.set(revision.conceptId, revision);

    const parsedTerritories = territoryRows.map((row) => territorySchema.parse(row.data));
    const parsedConcepts = conceptRows
      .map((row) => latestRevisionByConcept.get(row.id))
      .filter((row): row is typeof revisionRows[number] => Boolean(row))
      .map((row) => conceptSchema.parse(row.data));

    const parsedCampaignRevisions = campaignRows.map((row) => {
      const data = campaignRevisionDataSchema.parse(row.data);
      return {
        revision: row.revision,
        ...data,
        createdAt: row.createdAt.toISOString(),
      };
    });

    const latestCampaign = parsedCampaignRevisions.at(-1);
    const parsedAssetBibleRevisions = assetBibleRows.map((row) => assetBibleRevisionSchema.parse({
      revision: row.revision,
      sourceCampaignRevision: row.sourceCampaignRevision,
      sourceConceptKeys: row.sourceConceptKeys,
      data: assetBibleSchema.parse(row.data),
      createdAt: row.createdAt.toISOString(),
    }));
    const latestAssetBible = parsedAssetBibleRevisions.at(-1);

    const shortlistStableKeys = shortlistRows
      .map((row) => stableKeyByUuid.get(row.conceptId))
      .filter((key): key is string => Boolean(key));

    const parsedConceptRevisions = revisionRows.map((row) => ({
      conceptId: stableKeyByUuid.get(row.conceptId) ?? row.conceptId,
      revision: row.revision,
      instruction: row.instruction,
      data: conceptSchema.parse(row.data),
      createdAt: row.createdAt.toISOString(),
    }));

    return localProjectSnapshotSchema.parse({
      version: 1,
      id: project.id,
      brandName: project.brandName || "Untitled brand",
      productName: project.productName || "Untitled product",
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      product: productRows[0] ? productIntelligenceSchema.parse(productRows[0].intelligence) : undefined,
      brief: briefRows[0] ? creativeBriefSchema.parse(briefRows[0].data) : undefined,
      bible: latestCampaign?.bible,
      territories: parsedTerritories.length === 4 ? parsedTerritories : undefined,
      concepts: parsedConcepts.length === 20 ? parsedConcepts : undefined,
      shortlist: shortlistStableKeys,
      campaignRevisions: parsedCampaignRevisions,
      conceptRevisions: parsedConceptRevisions,
      assetBible: latestAssetBible?.data,
      assetBibleRevisions: parsedAssetBibleRevisions,
    });
  }

  async updateProject(id: string, patch: ProjectRuntimePatch) {
    const exists = await this.getProject(id);
    if (!exists) return null;

    await this.db.transaction(async (tx) => {
      const projectSet: Partial<typeof projects.$inferInsert> = { updatedAt: new Date() };
      if (patch.brandName !== undefined) projectSet.brandName = patch.brandName;
      if (patch.productName !== undefined) projectSet.productName = patch.productName;
      if (patch.brief !== undefined) projectSet.status = "briefing";

      await tx.update(projects).set(projectSet).where(eq(projects.id, id));

      if (patch.product) {
        await tx.insert(products).values({ projectId: id, intelligence: patch.product })
          .onConflictDoUpdate({ target: products.projectId, set: { intelligence: patch.product } });
      }

      if (patch.brief) {
        await tx.insert(creativeBriefs).values({ projectId: id, data: patch.brief, updatedAt: new Date() })
          .onConflictDoUpdate({ target: creativeBriefs.projectId, set: { data: patch.brief, updatedAt: new Date() } });
      }
    });

    return this.getProject(id);
  }

  async saveCampaign(id: string, result: CampaignSaveInput) {
    await this.db.transaction(async (tx) => {
      const [revisionRow] = await tx.select({ revision: max(campaignBibleRevisions.revision) })
        .from(campaignBibleRevisions)
        .where(eq(campaignBibleRevisions.projectId, id));
      const nextRevision = (revisionRow?.revision ?? 0) + 1;

      await tx.insert(creativeBriefs).values({ projectId: id, data: result.brief, updatedAt: new Date() })
        .onConflictDoUpdate({ target: creativeBriefs.projectId, set: { data: result.brief, updatedAt: new Date() } });

      await tx.insert(campaignBibleRevisions).values({
        projectId: id,
        revision: nextRevision,
        data: { bible: result.bible, territories: result.territories, concepts: result.concepts },
      });

      await tx.delete(territories).where(eq(territories.projectId, id));

      const insertedTerritories = await tx.insert(territories).values(
        result.territories.map((territory) => ({
          projectId: id,
          stableKey: territory.id,
          slot: territory.slot,
          data: territory,
        })),
      ).returning({ id: territories.id, stableKey: territories.stableKey });

      const territoryUuidByStableKey = new Map(insertedTerritories.map((row) => [row.stableKey, row.id]));
      const conceptValues = result.concepts.map((concept) => {
        const territoryId = territoryUuidByStableKey.get(concept.territoryId);
        if (!territoryId) throw new Error(`Territory not found for concept ${concept.id}.`);
        return {
          projectId: id,
          territoryId,
          stableKey: concept.id,
          type: concept.executionType,
        };
      });

      const insertedConcepts = await tx.insert(concepts).values(conceptValues)
        .returning({ id: concepts.id, stableKey: concepts.stableKey });
      const conceptUuidByStableKey = new Map(insertedConcepts.map((row) => [row.stableKey, row.id]));

      await tx.insert(conceptRevisions).values(result.concepts.map((concept) => ({
        conceptId: conceptUuidByStableKey.get(concept.id)!,
        revision: 1,
        instruction: "Initial concept",
        data: concept,
      })));

      await tx.update(projects).set({ status: "generated", updatedAt: new Date() }).where(eq(projects.id, id));
    });

    const snapshot = await this.getProject(id);
    if (!snapshot) throw new Error("Campaign was saved but project could not be loaded.");
    return snapshot;
  }

  async saveConceptRevision(id: string, concept: Parameters<ProjectRepository["saveConceptRevision"]>[1], instruction: string) {
    await this.db.transaction(async (tx) => {
      const [conceptRow] = await tx.select({ id: concepts.id }).from(concepts)
        .where(and(eq(concepts.projectId, id), eq(concepts.stableKey, concept.id))).limit(1);
      if (!conceptRow) throw new Error("Concept not found.");

      const [revisionRow] = await tx.select({ revision: max(conceptRevisions.revision) })
        .from(conceptRevisions).where(eq(conceptRevisions.conceptId, conceptRow.id));
      const nextRevision = (revisionRow?.revision ?? 0) + 1;

      await tx.insert(conceptRevisions).values({
        conceptId: conceptRow.id,
        revision: nextRevision,
        instruction,
        data: concept,
      });
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, id));
    });

    const snapshot = await this.getProject(id);
    if (!snapshot) throw new Error("Concept revision was saved but project could not be loaded.");
    return snapshot;
  }

  async saveAssetBible(id: string, input: AssetBibleSaveInput) {
    await this.db.transaction(async (tx) => {
      const [revisionRow] = await tx.select({ revision: max(assetBibleRevisions.revision) })
        .from(assetBibleRevisions)
        .where(eq(assetBibleRevisions.projectId, id));
      const nextRevision = (revisionRow?.revision ?? 0) + 1;

      await tx.insert(assetBibleRevisions).values({
        projectId: id,
        revision: nextRevision,
        sourceCampaignRevision: input.sourceCampaignRevision,
        sourceConceptKeys: [...new Set(input.sourceConceptKeys)],
        data: input.assetBible,
      });
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, id));
    });

    const snapshot = await this.getProject(id);
    if (!snapshot) throw new Error("Asset Bible was saved but project could not be loaded.");
    return snapshot;
  }

  async setShortlist(id: string, conceptIds: string[]) {
    await this.db.transaction(async (tx) => {
      await tx.delete(shortlist).where(eq(shortlist.projectId, id));
      const uniqueIds = Array.from(new Set(conceptIds));
      if (uniqueIds.length) {
        const rows = await tx.select({ id: concepts.id, stableKey: concepts.stableKey }).from(concepts)
          .where(and(eq(concepts.projectId, id), inArray(concepts.stableKey, uniqueIds)));
        if (rows.length !== uniqueIds.length) throw new Error("One or more shortlisted concepts were not found.");
        await tx.insert(shortlist).values(rows.map((row) => ({ projectId: id, conceptId: row.id })));
      }
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, id));
    });

    const snapshot = await this.getProject(id);
    if (!snapshot) throw new Error("Shortlist was saved but project could not be loaded.");
    return snapshot;
  }

  async createGenerationJob(input: Parameters<ProjectRepository["createGenerationJob"]>[0]): Promise<GenerationJobRecord> {
    const [row] = await this.db.insert(generationJobs).values({
      projectId: input.projectId,
      kind: input.kind,
      input: input.payload,
      maxAttempts: input.maxAttempts,
    }).returning();
    return mapGenerationJob(row);
  }

  async markGenerationRunning(id: string, attempt: number) {
    await this.db.update(generationJobs).set({
      status: "running",
      attempt,
      error: null,
      updatedAt: new Date(),
      completedAt: null,
    }).where(eq(generationJobs.id, id));
  }

  async completeGeneration(id: string, output: unknown, attempt: number) {
    await this.db.update(generationJobs).set({
      status: "succeeded",
      attempt,
      output,
      error: null,
      updatedAt: new Date(),
      completedAt: new Date(),
    }).where(eq(generationJobs.id, id));
  }

  async recordGenerationFailure(id: string, error: string, attempt: number, final: boolean) {
    await this.db.update(generationJobs).set({
      status: final ? "failed" : "pending",
      attempt,
      error,
      updatedAt: new Date(),
      completedAt: final ? new Date() : null,
    }).where(eq(generationJobs.id, id));
  }

  async listGenerationJobs(projectId: string, limit = 20) {
    const rows = await this.db.select().from(generationJobs)
      .where(eq(generationJobs.projectId, projectId))
      .orderBy(desc(generationJobs.createdAt))
      .limit(Math.min(Math.max(limit, 1), 100));
    return rows.map(mapGenerationJob);
  }
}

function mapGenerationJob(row: typeof generationJobs.$inferSelect): GenerationJobRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    kind: row.kind,
    status: row.status,
    attempt: row.attempt,
    maxAttempts: row.maxAttempts,
    error: row.error,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

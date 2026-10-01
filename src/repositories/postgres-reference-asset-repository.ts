import { and, asc, desc, eq, max } from "drizzle-orm";
import type { AppDatabase } from "@/db/client";
import {
  assetBibleRevisions,
  continuityChecks,
  referenceAssetRevisions,
} from "@/db/schema";
import {
  continuityCheckSchema,
  referenceAssetRevisionSchema,
  type ContinuityCheck,
  type ReferenceAssetRevision,
  type ReferenceAssetTarget,
} from "@/domain/reference-assets/schema";
import type {
  ReferenceAssetRepository,
  ReferenceAssetRevisionSaveInput,
} from "@/repositories/reference-asset-repository";

export class PostgresReferenceAssetRepository implements ReferenceAssetRepository {
  constructor(private readonly db: AppDatabase) {}

  async getCurrentAssetBibleRevision(projectId: string) {
    const [row] = await this.db
      .select({ revision: max(assetBibleRevisions.revision) })
      .from(assetBibleRevisions)
      .where(eq(assetBibleRevisions.projectId, projectId));

    return row?.revision ?? null;
  }

  async assertCurrentSource(projectId: string, sourceAssetBibleRevision: number) {
    const currentRevision = await this.getCurrentAssetBibleRevision(projectId);
    if (currentRevision === null) {
      throw new Error("Reference Asset generation requires a current Asset Bible.");
    }
    if (currentRevision !== sourceAssetBibleRevision) {
      throw new Error(
        `Reference Asset source drift detected. Expected Asset Bible r${sourceAssetBibleRevision}, current is r${currentRevision}.`,
      );
    }
  }

  async saveRevision(projectId: string, input: ReferenceAssetRevisionSaveInput) {
    if (input.renderRequest.projectId !== projectId) {
      throw new Error("Reference Asset render request belongs to a different project.");
    }

    return this.db.transaction(async (tx) => {
      const [sourceRow] = await tx
        .select({ revision: max(assetBibleRevisions.revision) })
        .from(assetBibleRevisions)
        .where(eq(assetBibleRevisions.projectId, projectId));

      const currentAssetBibleRevision = sourceRow?.revision ?? null;
      if (currentAssetBibleRevision === null) {
        throw new Error("Reference Asset generation requires a current Asset Bible.");
      }
      if (currentAssetBibleRevision !== input.sourceAssetBibleRevision) {
        throw new Error(
          `Reference Asset source drift detected. Expected Asset Bible r${input.sourceAssetBibleRevision}, current is r${currentAssetBibleRevision}.`,
        );
      }

      const [revisionRow] = await tx
        .select({ revision: max(referenceAssetRevisions.revision) })
        .from(referenceAssetRevisions)
        .where(and(
          eq(referenceAssetRevisions.projectId, projectId),
          eq(referenceAssetRevisions.stableKey, input.target.stableKey),
        ));

      const revision = (revisionRow?.revision ?? 0) + 1;
      const createdAt = new Date().toISOString();
      const parsed = referenceAssetRevisionSchema.parse({
        ...input,
        revision,
        createdAt,
      });

      await tx.insert(referenceAssetRevisions).values({
        projectId,
        stableKey: parsed.target.stableKey,
        kind: parsed.target.kind,
        revision: parsed.revision,
        sourceAssetBibleRevision: parsed.sourceAssetBibleRevision,
        data: parsed,
        createdAt: new Date(parsed.createdAt),
      });

      return parsed;
    });
  }

  async listRevisions(projectId: string, stableKey: string) {
    const rows = await this.db
      .select({ data: referenceAssetRevisions.data })
      .from(referenceAssetRevisions)
      .where(and(
        eq(referenceAssetRevisions.projectId, projectId),
        eq(referenceAssetRevisions.stableKey, stableKey),
      ))
      .orderBy(asc(referenceAssetRevisions.revision));

    return rows.map((row) => referenceAssetRevisionSchema.parse(row.data));
  }

  async getLatestRevision(projectId: string, stableKey: string) {
    const [row] = await this.db
      .select({ data: referenceAssetRevisions.data })
      .from(referenceAssetRevisions)
      .where(and(
        eq(referenceAssetRevisions.projectId, projectId),
        eq(referenceAssetRevisions.stableKey, stableKey),
      ))
      .orderBy(desc(referenceAssetRevisions.revision))
      .limit(1);

    return row ? referenceAssetRevisionSchema.parse(row.data) : null;
  }

  async assertTargetExists(projectId: string, target: ReferenceAssetTarget, revision: number) {
    const [row] = await this.db
      .select({ data: referenceAssetRevisions.data })
      .from(referenceAssetRevisions)
      .where(and(
        eq(referenceAssetRevisions.projectId, projectId),
        eq(referenceAssetRevisions.stableKey, target.stableKey),
        eq(referenceAssetRevisions.revision, revision),
      ))
      .limit(1);

    if (!row) {
      throw new Error(`Reference Asset ${target.stableKey} r${revision} does not exist.`);
    }

    const stored = referenceAssetRevisionSchema.parse(row.data);
    if (stored.target.kind !== target.kind) {
      throw new Error("Reference Asset kind does not match the requested target.");
    }
  }

  async saveContinuityCheck(projectId: string, check: ContinuityCheck) {
    const parsed = continuityCheckSchema.parse(check);

    await this.assertTargetExists(projectId, parsed.target, parsed.referenceAssetRevision);
    const revision = await this.getRevision(projectId, parsed.target.stableKey, parsed.referenceAssetRevision);
    if (!revision) {
      throw new Error("Reference Asset revision disappeared before continuity persistence.");
    }
    if (revision.sourceAssetBibleRevision !== parsed.sourceAssetBibleRevision) {
      throw new Error("Continuity Check source binding does not match the Reference Asset revision.");
    }

    await this.db.insert(continuityChecks).values({
      projectId,
      stableKey: parsed.target.stableKey,
      referenceAssetRevision: parsed.referenceAssetRevision,
      sourceAssetBibleRevision: parsed.sourceAssetBibleRevision,
      data: parsed,
      createdAt: new Date(parsed.checkedAt),
    });

    return parsed;
  }

  async listContinuityChecks(projectId: string, stableKey: string) {
    const rows = await this.db
      .select({ data: continuityChecks.data })
      .from(continuityChecks)
      .where(and(
        eq(continuityChecks.projectId, projectId),
        eq(continuityChecks.stableKey, stableKey),
      ))
      .orderBy(asc(continuityChecks.createdAt));

    return rows.map((row) => continuityCheckSchema.parse(row.data));
  }

  private async getRevision(projectId: string, stableKey: string, revision: number): Promise<ReferenceAssetRevision | null> {
    const [row] = await this.db
      .select({ data: referenceAssetRevisions.data })
      .from(referenceAssetRevisions)
      .where(and(
        eq(referenceAssetRevisions.projectId, projectId),
        eq(referenceAssetRevisions.stableKey, stableKey),
        eq(referenceAssetRevisions.revision, revision),
      ))
      .limit(1);

    return row ? referenceAssetRevisionSchema.parse(row.data) : null;
  }
}

import { index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", ["draft", "briefing", "generated", "archived"]);
export const executionType = pgEnum("execution_type", ["narrative", "product_spectacle", "character", "sensory", "social"]);
export const generationKind = pgEnum("generation_kind", [
  "campaign",
  "concept_refinement",
  "asset_bible",
  "production_plan",
  "reference_asset",
  "continuity_check",
]);
export const generationStatus = pgEnum("generation_status", ["pending", "running", "succeeded", "failed"]);
export const referenceAssetKind = pgEnum("reference_asset_kind", ["product", "hero", "wardrobe", "location", "prop"]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  brandName: text("brand_name"),
  productName: text("product_name"),
  status: projectStatus("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  sourceImageUrl: text("source_image_url"),
  intelligence: jsonb("intelligence").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("products_project_id_unique").on(table.projectId)]);

export const creativeBriefs = pgTable("creative_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("creative_briefs_project_id_unique").on(table.projectId)]);

export const campaignBibleRevisions = pgTable("campaign_bible_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  revision: integer("revision").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("campaign_bible_revision_unique").on(table.projectId, table.revision)]);

export const assetBibleRevisions = pgTable("asset_bible_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  revision: integer("revision").notNull(),
  sourceCampaignRevision: integer("source_campaign_revision").notNull(),
  sourceConceptKeys: jsonb("source_concept_keys").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("asset_bible_revision_unique").on(table.projectId, table.revision)]);

export const referenceAssetRevisions = pgTable("reference_asset_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  stableKey: text("stable_key").notNull(),
  kind: referenceAssetKind("kind").notNull(),
  revision: integer("revision").notNull(),
  sourceAssetBibleRevision: integer("source_asset_bible_revision").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("reference_asset_revision_unique").on(table.projectId, table.stableKey, table.revision),
  index("reference_asset_project_stable_key_idx").on(table.projectId, table.stableKey),
]);

export const continuityChecks = pgTable("continuity_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  stableKey: text("stable_key").notNull(),
  referenceAssetRevision: integer("reference_asset_revision").notNull(),
  sourceAssetBibleRevision: integer("source_asset_bible_revision").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("continuity_checks_project_stable_key_idx").on(table.projectId, table.stableKey),
]);

export const productionPlanRevisions = pgTable("production_plan_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  revision: integer("revision").notNull(),
  sourceCampaignRevision: integer("source_campaign_revision").notNull(),
  sourceAssetBibleRevision: integer("source_asset_bible_revision").notNull(),
  sourceConceptKeys: jsonb("source_concept_keys").notNull(),
  sourceConceptRevisions: jsonb("source_concept_revisions").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("production_plan_revision_unique").on(table.projectId, table.revision)]);

export const territories = pgTable("territories", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  stableKey: text("stable_key").notNull(),
  slot: integer("slot").notNull(),
  data: jsonb("data").notNull(),
}, (table) => [uniqueIndex("territory_project_slot_unique").on(table.projectId, table.slot)]);

export const concepts = pgTable("concepts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  territoryId: uuid("territory_id").references(() => territories.id, { onDelete: "cascade" }).notNull(),
  stableKey: text("stable_key").notNull(),
  type: executionType("execution_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("concept_project_stable_key_unique").on(table.projectId, table.stableKey)]);

export const conceptRevisions = pgTable("concept_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }).notNull(),
  revision: integer("revision").notNull(),
  instruction: text("instruction").default("Initial concept").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("concept_revision_unique").on(table.conceptId, table.revision)]);

export const shortlist = pgTable("shortlist", {
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.projectId, table.conceptId] })]);

export const generationJobs = pgTable("generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  kind: generationKind("kind").notNull(),
  status: generationStatus("status").default("pending").notNull(),
  attempt: integer("attempt").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(2).notNull(),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  index("generation_jobs_project_created_idx").on(table.projectId, table.createdAt),
  index("generation_jobs_status_idx").on(table.status),
]);

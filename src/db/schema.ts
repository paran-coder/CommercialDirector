import { integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", ["draft", "briefing", "generated", "archived"]);
export const executionType = pgEnum("execution_type", ["narrative", "product_spectacle", "character", "sensory", "social"]);

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
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("concept_revision_unique").on(table.conceptId, table.revision)]);

export const shortlist = pgTable("shortlist", {
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.projectId, table.conceptId] })]);

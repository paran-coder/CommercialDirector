"use client";

import type { CreativeBrief } from "@/domain/brief/schema";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import { localProjectSnapshotSchema, type LocalProjectSnapshot } from "@/domain/project/schema";

const PREFIX = "commercial-director:v1:project:";
const INDEX_KEY = "commercial-director:v1:projects";

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function projectKey(id: string) {
  return `${PREFIX}${id}`;
}

function safeParse(value: string | null): LocalProjectSnapshot | null {
  if (!value) return null;
  try {
    return localProjectSnapshotSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

function readIndex(): string[] {
  if (!storageAvailable()) return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(INDEX_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function listLocalProjects(): LocalProjectSnapshot[] {
  if (!storageAvailable()) return [];
  return readIndex()
    .map((id) => safeParse(window.localStorage.getItem(projectKey(id))))
    .filter((project): project is LocalProjectSnapshot => Boolean(project))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getLocalProject(id: string): LocalProjectSnapshot | null {
  if (!storageAvailable()) return null;
  return safeParse(window.localStorage.getItem(projectKey(id)));
}

export function cacheLocalProject(snapshot: LocalProjectSnapshot, notify = false) {
  if (!storageAvailable()) return snapshot;
  const parsed = localProjectSnapshotSchema.parse(snapshot);
  window.localStorage.setItem(projectKey(parsed.id), JSON.stringify(parsed));
  writeIndex([parsed.id, ...readIndex()]);
  if (notify) window.dispatchEvent(new CustomEvent("commercial-director:project-updated", { detail: { id: parsed.id } }));
  return parsed;
}

export function createLocalProject(product: ProductIntelligence, metadata?: { brandName?: string; productName?: string }) {
  if (!storageAvailable()) throw new Error("Browser storage is unavailable.");
  const now = new Date().toISOString();
  const id = `campaign-${crypto.randomUUID()}`;
  const snapshot: LocalProjectSnapshot = {
    version: 1,
    id,
    brandName: metadata?.brandName?.trim() || "Untitled brand",
    productName: metadata?.productName?.trim() || product.subcategory || product.category,
    createdAt: now,
    updatedAt: now,
    product,
    shortlist: [],
    campaignRevisions: [],
    conceptRevisions: [],
  };
  return cacheLocalProject(snapshot, true);
}

export function updateLocalProject(
  id: string,
  patch: Partial<Pick<LocalProjectSnapshot, "brandName" | "productName" | "product" | "brief" | "bible" | "territories" | "concepts" | "shortlist" | "campaignRevisions" | "conceptRevisions">>,
) {
  if (!storageAvailable()) return null;
  const current = getLocalProject(id);
  if (!current) return null;
  const next = localProjectSnapshotSchema.parse({ ...current, ...patch, updatedAt: new Date().toISOString() });
  return cacheLocalProject(next, true);
}

export function saveCampaignResult(
  id: string,
  result: { brief: CreativeBrief; bible: CampaignBible; territories: Territory[]; concepts: Concept[] },
) {
  const current = getLocalProject(id);
  const revisions = current?.campaignRevisions ?? [];
  return updateLocalProject(id, {
    brief: result.brief,
    bible: result.bible,
    territories: result.territories,
    concepts: result.concepts,
    campaignRevisions: [...revisions, { revision: revisions.length + 1, bible: result.bible, territories: result.territories, concepts: result.concepts, createdAt: new Date().toISOString() }],
  });
}

export function saveConceptRevision(id: string, concept: Concept, instruction: string) {
  const current = getLocalProject(id);
  if (!current?.concepts) return null;
  const revisions = current.conceptRevisions ?? [];
  const existingForConcept = revisions.filter((item) => item.conceptId === concept.id);
  const previous = current.concepts.find((item) => item.id === concept.id);
  const seeded = existingForConcept.length === 0 && previous
    ? [...revisions, { conceptId: concept.id, revision: 1, instruction: "Initial concept", data: previous, createdAt: new Date().toISOString() }]
    : revisions;
  const nextRevision = seeded.filter((item) => item.conceptId === concept.id).length + 1;
  return updateLocalProject(id, {
    concepts: current.concepts.map((item) => item.id === concept.id ? concept : item),
    conceptRevisions: [...seeded, { conceptId: concept.id, revision: nextRevision, instruction, data: concept, createdAt: new Date().toISOString() }],
  });
}

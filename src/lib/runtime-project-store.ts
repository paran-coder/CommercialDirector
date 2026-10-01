"use client";

import type { ProjectRuntimePatch, ProjectSnapshot } from "@/domain/project/schema";
import { localProjectSnapshotSchema } from "@/domain/project/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import {
  cacheLocalProject,
  createLocalProject,
  getLocalProject,
  listLocalProjects,
  updateLocalProject,
} from "@/lib/project-store";

export async function listRuntimeProjects(): Promise<ProjectSnapshot[]> {
  let response: Response;
  try {
    response = await fetch("/api/projects", { cache: "no-store" });
  } catch {
    return listLocalProjects();
  }

  if (response.status === 503) return listLocalProjects();
  if (!response.ok) throw new Error(await responseMessage(response));

  const body = await response.json();
  const serverProjects = localProjectSnapshotSchema.array().parse(body.projects);
  for (const project of serverProjects) cacheLocalProject(project, false);

  const ids = new Set(serverProjects.map((project) => project.id));
  const legacy = listLocalProjects().filter((project) => isLocalOnlyProject(project.id) && !ids.has(project.id));
  return [...serverProjects, ...legacy].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getRuntimeProject(id: string): Promise<ProjectSnapshot | null> {
  if (isLocalOnlyProject(id)) return getLocalProject(id);

  let response: Response;
  try {
    response = await fetch(`/api/projects/${encodeURIComponent(id)}`, { cache: "no-store" });
  } catch {
    return getLocalProject(id);
  }

  if (response.status === 503) return getLocalProject(id);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await responseMessage(response));

  const body = await response.json();
  const project = localProjectSnapshotSchema.parse(body.project);
  cacheLocalProject(project, false);
  return project;
}

export async function createRuntimeProject(
  product: ProductIntelligence,
  metadata?: { brandName?: string; productName?: string },
): Promise<ProjectSnapshot> {
  let response: Response;
  try {
    response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, ...metadata }),
    });
  } catch {
    return createLocalProject(product, metadata);
  }

  if (response.status === 503) return createLocalProject(product, metadata);
  if (!response.ok) throw new Error(await responseMessage(response));

  const body = await response.json();
  const project = localProjectSnapshotSchema.parse(body.project);
  return cacheLocalProject(project, true);
}

export async function updateRuntimeProject(id: string, patch: ProjectRuntimePatch) {
  if (isLocalOnlyProject(id)) return updateLocalProject(id, patch);

  let response: Response;
  try {
    response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  } catch {
    return updateLocalProject(id, patch);
  }

  if (response.status === 503) return updateLocalProject(id, patch);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await responseMessage(response));

  const body = await response.json();
  const project = localProjectSnapshotSchema.parse(body.project);
  return cacheLocalProject(project, true);
}

export async function setRuntimeShortlist(id: string, conceptIds: string[]) {
  if (isLocalOnlyProject(id)) return updateLocalProject(id, { shortlist: conceptIds });

  let response: Response;
  try {
    response = await fetch(`/api/projects/${encodeURIComponent(id)}/shortlist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conceptIds }),
    });
  } catch {
    return updateLocalProject(id, { shortlist: conceptIds });
  }

  if (response.status === 503) return updateLocalProject(id, { shortlist: conceptIds });
  if (!response.ok) throw new Error(await responseMessage(response));

  const body = await response.json();
  const project = localProjectSnapshotSchema.parse(body.project);
  return cacheLocalProject(project, true);
}

function isLocalOnlyProject(id: string) {
  return id === "demo-aurelia" || id.startsWith("campaign-");
}

async function responseMessage(response: Response) {
  try {
    const body = await response.json();
    return typeof body.error === "string" ? body.error : `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

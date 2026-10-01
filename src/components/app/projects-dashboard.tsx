"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { demoProject } from "@/lib/fixtures/demo";
import { listRuntimeProjects } from "@/lib/runtime-project-store";
import type { LocalProjectSnapshot } from "@/domain/project/schema";

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<LocalProjectSnapshot[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listRuntimeProjects().then((items) => {
      if (!cancelled) setProjects(items);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex items-end justify-between border-b border-[var(--line)] pb-7">
        <div><p className="eyebrow">Workspace</p><h1 className="mt-3 text-4xl font-medium tracking-[-0.04em]">Projects</h1></div>
        <Link href="/projects/new" className="hidden h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3.5 text-sm sm:inline-flex"><Plus size={15}/> New campaign</Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        {projects.map((project) => <ProjectRow key={project.id} id={project.id} brandName={project.brandName} productName={project.productName} status={project.concepts ? "20 concepts" : project.bible ? "Campaign ready" : project.brief ? "Brief complete" : "Product analyzed"} updatedAt={relativeTime(project.updatedAt)} />)}
        <ProjectRow id={demoProject.id} brandName={demoProject.brandName} productName={demoProject.productName} status={demoProject.status} updatedAt={demoProject.updatedAt} />
      </div>
    </div>
  );
}

function ProjectRow({ id, brandName, productName, status, updatedAt }: { id: string; brandName: string; productName: string; status: string; updatedAt: string }) {
  return <Link href={`/projects/${id}/campaign`} className="grid gap-4 border-b border-[var(--line)] p-5 transition last:border-b-0 hover:bg-neutral-50 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:p-6">
    <div><p className="text-sm font-semibold">{brandName}</p><p className="mt-1 text-xs text-neutral-500">{productName}</p></div>
    <div><p className="meta">Status</p><p className="mt-1.5 text-sm">{status}</p></div>
    <div><p className="meta">Updated</p><p className="mt-1.5 text-sm">{updatedAt}</p></div>
    <ArrowUpRight size={17}/>
  </Link>;
}

function relativeTime(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, ArrowUpRight } from "lucide-react";
import type { Concept } from "@/domain/concept/schema";
import type { Territory } from "@/domain/campaign/schema";
import { getRuntimeProject, setRuntimeShortlist } from "@/lib/runtime-project-store";
import { cx, executionLabel } from "@/lib/utils";

export function ConceptGrid({ projectId, concepts: fallbackConcepts, territories: fallbackTerritories }: { projectId: string; territories: Territory[]; concepts: Concept[] }) {
  const [territory, setTerritory] = useState("all");
  const [loaded, setLoaded] = useState(projectId === "demo-aurelia");
  const [ready, setReady] = useState(projectId === "demo-aurelia");
  const [concepts, setConcepts] = useState(fallbackConcepts);
  const [territories, setTerritories] = useState(fallbackTerritories);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set(projectId === "demo-aurelia" ? ["concept-07", "concept-13", "concept-17"] : []));

  useEffect(() => {
    let cancelled = false;
    void getRuntimeProject(projectId).then((local) => {
      if (cancelled) return;
      if (local?.concepts) { setConcepts(local.concepts); setReady(true); }
      else if (local) setReady(false);
      if (local?.territories) setTerritories(local.territories);
      if (local) setShortlist(new Set(local.shortlist));
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  const visible = useMemo(() => territory === "all" ? concepts : concepts.filter((concept) => concept.territoryId === territory), [territory, concepts]);
  const indexById = useMemo(() => new Map(concepts.map((concept, index) => [concept.id, index + 1])), [concepts]);

  function toggle(id: string) {
    const next = new Set(shortlist);
    if (next.has(id)) next.delete(id); else next.add(id);
    setShortlist(next);
    void setRuntimeShortlist(projectId, Array.from(next));
  }

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading concepts…</p></div>;
  if (!ready) return <div className="page-wrap max-w-3xl"><p className="eyebrow">Campaign concepts</p><h1 className="mt-4 text-4xl font-medium tracking-[-0.04em]">No concepts yet.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">Complete the creative brief and build the campaign to generate the four-territory, 20-concept matrix.</p><Link className="mt-7 inline-flex h-10 items-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white" href={`/projects/${projectId}/brief`}>Build campaign</Link></div>;

  return (
    <div className="page-wrap">
      <div className="section-heading"><div><p className="eyebrow">Campaign concepts · {concepts.length}</p><h1>Four territories. Five ways in.</h1></div><p>The matrix prevents a pile of near-duplicate ideas. Shortlist what deserves production development.</p></div>
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-5">
        <Filter active={territory === "all"} onClick={() => setTerritory("all")}>All</Filter>{territories.map((item) => <Filter key={item.id} active={territory === item.id} onClick={() => setTerritory(item.id)}>{item.title}</Filter>)}
        <span className="ml-auto text-xs text-neutral-500">{shortlist.size} shortlisted</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visible.map((concept) => {
          const itemTerritory = territories.find((item) => item.id === concept.territoryId);
          if (!itemTerritory) return null;
          const saved = shortlist.has(concept.id);
          return <article key={concept.id} data-testid="concept-card" className="group flex min-h-[270px] flex-col rounded-xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-neutral-400 motion-reduce:transform-none motion-reduce:transition-none">
            <div className="flex items-start justify-between"><span className="text-xs tabular-nums text-neutral-400">{String(indexById.get(concept.id) ?? 0).padStart(2,"0")}</span><button onClick={() => toggle(concept.id)} aria-label="Toggle shortlist" className={cx("grid size-8 place-items-center rounded-md border transition", saved ? "border-neutral-950 bg-neutral-950 text-white" : "border-[var(--line)] text-neutral-400 hover:text-neutral-950")}><Bookmark size={14} fill={saved ? "currentColor" : "none"}/></button></div>
            <div className="mt-8"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">{itemTerritory.title} · {executionLabel(concept.executionType)}</p><h2 className="mt-3 text-xl font-medium tracking-[-0.02em]">{concept.title}</h2><p className="mt-3 text-sm leading-6 text-neutral-500">{concept.hook}</p></div>
            <div className="mt-auto flex items-center justify-between pt-7"><span className="text-xs text-neutral-400">{concept.primaryDuration}s concept</span><Link className="inline-flex items-center gap-1 text-xs font-medium" href={`/projects/${projectId}/concepts/${concept.id}`}>Develop <ArrowUpRight size={13}/></Link></div>
          </article>;
        })}
      </div>
    </div>
  );
}

function Filter({ active, onClick, children }: { active: boolean; onClick(): void; children: React.ReactNode }) { return <button onClick={onClick} className={cx("rounded-full border px-3 py-1.5 text-xs transition", active ? "border-neutral-950 bg-neutral-950 text-white" : "border-[var(--line)] bg-white text-neutral-500 hover:text-neutral-950")}>{children}</button>; }

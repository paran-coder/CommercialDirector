"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { Concept } from "@/domain/concept/schema";
import type { Territory } from "@/domain/campaign/schema";
import { demoConcepts, demoTerritories } from "@/lib/fixtures/demo";
import { getLocalProject, saveConceptRevision } from "@/lib/project-store";
import { getRuntimeProject, setRuntimeShortlist } from "@/lib/runtime-project-store";
import { executionLabel } from "@/lib/utils";

export function ConceptDetail({ projectId, conceptId }: { projectId: string; conceptId: string }) {
  const [pro, setPro] = useState(false);
  const [loaded, setLoaded] = useState(projectId === "demo-aurelia");
  const [concept, setConcept] = useState<Concept | null>(() => demoConcepts.find((item) => item.id === conceptId) ?? null);
  const [territory, setTerritory] = useState<Territory | null>(() => {
    const initialConcept = demoConcepts.find((item) => item.id === conceptId);
    return initialConcept ? demoTerritories.find((item) => item.id === initialConcept.territoryId) ?? null : null;
  });
  const [saved, setSaved] = useState(false);
  const [revising, setRevising] = useState<string | null>(null);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionCount, setRevisionCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getRuntimeProject(projectId).then((local) => {
      if (cancelled) return;
      const localConcept = local?.concepts?.find((item) => item.id === conceptId);
      if (local && localConcept) {
        setConcept(localConcept);
        setTerritory(local.territories?.find((item) => item.id === localConcept.territoryId) ?? null);
        setSaved(local.shortlist.includes(conceptId));
        setRevisionCount(local.conceptRevisions.filter((item) => item.conceptId === conceptId && item.instruction !== "Initial concept").length);
      } else if (projectId === "demo-aurelia") {
        setSaved(["concept-07", "concept-13", "concept-17"].includes(conceptId));
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [conceptId, projectId]);

  async function refine(instruction: string) {
    const local = await getRuntimeProject(projectId);
    if (!local?.bible || !local.territories || !local.concepts) {
      setRevisionError("Refinement is available on campaigns generated from your own brief.");
      return;
    }
    setRevisionError(null);
    setRevising(instruction);
    try {
      const response = await fetch("/api/ai/concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, bible: local.bible, territories: local.territories, concepts: local.concepts, conceptId, instruction }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Concept revision failed");
      setConcept(data.concept);
      const updated = saveConceptRevision(projectId, data.concept, instruction);
      if (updated) setRevisionCount(updated.conceptRevisions.filter((item) => item.conceptId === conceptId && item.instruction !== "Initial concept").length);
    } catch (caught) {
      setRevisionError(caught instanceof Error ? caught.message : "Concept revision failed");
    } finally {
      setRevising(null);
    }
  }

  function toggleSaved() {
    const local = getLocalProject(projectId);
    if (!local) {
      setSaved((value) => !value);
      return;
    }
    const nextSaved = !saved;
    const next = new Set(local.shortlist);
    if (nextSaved) next.add(conceptId); else next.delete(conceptId);
    void setRuntimeShortlist(projectId, Array.from(next));
    setSaved(nextSaved);
  }

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading concept…</p></div>;

  if (!concept || !territory) {
    return <div className="page-wrap"><p className="eyebrow">Concept</p><h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">Concept not found.</h1><Link className="mt-6 inline-flex items-center gap-2 text-sm font-medium" href={`/projects/${projectId}/concepts`}><ArrowLeft size={15}/> Back to concepts</Link></div>;
  }

  return (
    <div className="page-wrap max-w-6xl">
      <div className="mb-7 flex items-center justify-between">
        <Link className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-950" href={`/projects/${projectId}/concepts`}><ArrowLeft size={14}/> All concepts</Link>
        <button onClick={toggleSaved} className={saved ? "inline-flex h-9 items-center gap-2 rounded-md bg-neutral-950 px-3 text-xs font-medium text-white" : "inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-xs font-medium"}><Bookmark size={13} fill={saved ? "currentColor" : "none"}/>{saved ? "Shortlisted" : "Shortlist"}</button>
      </div>
      <div className="flex flex-col gap-6 border-b border-neutral-950 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">{territory.title} / {executionLabel(concept.executionType)}</p><h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">{concept.title}</h1><p className="mt-4 max-w-2xl text-lg leading-7 text-neutral-500">{concept.hook}</p></div><button onClick={() => setPro((value) => !value)} className={pro ? "inline-flex h-10 items-center gap-2 rounded-md bg-neutral-950 px-3.5 text-sm text-white" : "inline-flex h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3.5 text-sm"}><SlidersHorizontal size={15}/> Pro controls</button></div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section><p className="meta">The idea</p><p className="mt-4 text-xl leading-8 tracking-[-0.015em]">{concept.idea}</p><div className="mt-9 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2"><Info title="Product role" body={concept.productRole}/><Info title="Audience takeaway" body={concept.audienceTakeaway}/></div></section>
        <section className="panel p-6 sm:p-7"><div className="flex items-center justify-between"><p className="meta">15 second film</p><span className="tag">15s</span></div><ol className="mt-5 divide-y divide-[var(--line)]">{concept.treatment15s.map((beat) => <li className="grid grid-cols-[62px_1fr] gap-4 py-4 text-sm" key={beat.time}><span className="font-mono text-xs text-neutral-400">{beat.time}</span><span className="leading-6 text-neutral-700">{beat.beat}</span></li>)}</ol></section>
      </div>
      <section className="mt-8 border-t border-[var(--line)] pt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="meta">Quick refinements</p><p className="mt-2 text-sm text-neutral-500">Revise this slot without regenerating the other 19 concepts. {revisionCount > 0 ? `${revisionCount} revision${revisionCount === 1 ? "" : "s"} saved.` : ""}</p></div>{revising ? <span className="inline-flex items-center gap-2 text-xs text-neutral-500"><Loader2 size={13} className="animate-spin motion-reduce:animate-none"/> Revising</span> : null}</div>
        <div className="mt-4 flex flex-wrap gap-2">{["Make it bolder", "Make it more luxurious", "Reduce production complexity", "Make the product more prominent"].map((instruction) => <button key={instruction} disabled={Boolean(revising)} onClick={() => refine(instruction)} className="choice disabled:cursor-not-allowed disabled:opacity-40">{instruction}</button>)}</div>
        {revisionError ? <p className="mt-3 text-sm text-red-700">{revisionError}</p> : null}
      </section>
      {pro ? <section className="mt-8 rounded-xl bg-neutral-950 p-6 text-white sm:p-8"><div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4"><DarkList title="Creative rationale" items={[concept.pro.creativeRationale]}/><DarkList title="Camera" items={concept.pro.camera}/><DarkList title="Lighting" items={concept.pro.lighting}/><DarkList title="Continuity" items={concept.pro.continuity}/></div><div className="mt-8 border-t border-white/15 pt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">Required assets</p><p className="mt-3 text-sm text-white/75">{[...concept.requirements.locations, ...concept.requirements.props, ...concept.requirements.vfx].join(" · ") || "No additional assets"}</p></div></section> : null}
    </div>
  );
}
function Info({title, body}:{title:string;body:string}) { return <div className="bg-white p-5"><p className="meta">{title}</p><p className="mt-3 text-sm leading-6 text-neutral-600">{body}</p></div>; }
function DarkList({title,items}:{title:string;items:string[]}) { return <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">{title}</p><ul className="mt-4 space-y-2 text-sm leading-6 text-white/75">{items.map((item)=><li key={item}>{item}</li>)}</ul></div>; }

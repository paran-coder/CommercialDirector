"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import { getLocalProject } from "@/lib/project-store";
import { Button } from "@/components/ui/button";

export function CampaignBibleView({ projectId, fallback, fallbackTerritories }: { projectId: string; fallback: CampaignBible; fallbackTerritories: Territory[] }) {
  const router = useRouter();
  const [full, setFull] = useState(false);
  const [bible, setBible] = useState(fallback);
  const [territories, setTerritories] = useState(fallbackTerritories);
  const [loaded, setLoaded] = useState(projectId === "demo-aurelia");
  const [ready, setReady] = useState(projectId === "demo-aurelia");

  useEffect(() => {
    let cancelled = false;
    const local = getLocalProject(projectId);
    queueMicrotask(() => {
      if (cancelled) return;
      if (local?.bible) { setBible(local.bible); setReady(true); }
      else if (local) setReady(false);
      if (local?.territories) setTerritories(local.territories);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading campaign…</p></div>;
  if (!ready) return <div className="page-wrap max-w-3xl"><p className="eyebrow">Campaign foundation</p><h1 className="mt-4 text-4xl font-medium tracking-[-0.04em]">Build the brief first.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">The campaign bible and 20 concepts are generated from the approved product intelligence and creative brief.</p><Button className="mt-7 gap-2" onClick={() => router.push(`/projects/${projectId}/brief`)}>Go to creative brief <ArrowRight size={15}/></Button></div>;

  return (
    <div className="page-wrap">
      <div className="section-heading"><div><p className="eyebrow">Campaign foundation</p><h1>{bible.campaignName}</h1></div><p>One shared creative world gives every concept a consistent strategy, visual language, and production vocabulary.</p></div>
      <section className="mt-10 border-y border-neutral-950 py-9 sm:py-12"><p className="meta">Strategic idea</p><blockquote className="mt-4 max-w-4xl text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-5xl">{bible.campaignIdea.statement}</blockquote><p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500">{bible.campaignIdea.promise}</p></section>
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 xl:grid-cols-3">
        <BibleCell title="Audience" body={bible.audienceSummary}/><BibleList title="Visual world" items={bible.visualWorld.keywords}/><BibleCell title="Hero" body={`${bible.hero.persona}. ${bible.hero.styling}.`}/><BibleList title="Environments" items={bible.locations}/><BibleList title="Product behavior" items={bible.productBehavior}/><BibleList title="Palette" items={bible.palette}/>
      </div>

      <button className="mt-6 flex items-center gap-2 text-sm font-medium" onClick={() => setFull((value) => !value)}>View full production bible <ChevronDown size={15} className={full ? "rotate-180 transition" : "transition"}/></button>
      {full ? <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 xl:grid-cols-4"><BibleList title="Props" items={bible.props}/><BibleList title="Camera" items={bible.cameraLanguage}/><BibleList title="Lighting" items={bible.lighting}/><BibleList title="Sound" items={bible.soundLanguage}/><BibleList title="Avoid" items={bible.visualWorld.avoid}/></div> : null}

      <section className="mt-10 border-t border-neutral-950 pt-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Creative territories</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">Four strategic ways into the campaign.</h2></div>
          <Button className="gap-2" onClick={() => router.push(`/projects/${projectId}/concepts`)}>View 20 concepts <ArrowRight size={15}/></Button>
        </div>
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 xl:grid-cols-4">
          {territories.map((territory) => <article key={territory.id} className="bg-white p-6"><p className="question-number">0{territory.slot}</p><h3 className="mt-3 text-lg font-medium">{territory.title}</h3><p className="mt-3 text-sm leading-6 text-neutral-500">{territory.premise}</p></article>)}
        </div>
      </section>
    </div>
  );
}

function BibleCell({ title, body }: { title: string; body: string }) { return <div className="bg-white p-6 sm:p-7"><p className="meta">{title}</p><p className="mt-4 text-sm leading-6 text-neutral-700">{body}</p></div>; }
function BibleList({ title, items }: { title: string; items: string[] }) { return <div className="bg-white p-6 sm:p-7"><p className="meta">{title}</p><ul className="mt-4 space-y-1.5 text-sm text-neutral-700">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>; }

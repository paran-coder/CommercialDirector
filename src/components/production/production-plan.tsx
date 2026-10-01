"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getConceptRevisionSnapshot,
  isAssetBibleCurrent,
  isProductionPlanCurrent,
  type ProjectSnapshot,
} from "@/domain/project/schema";
import {
  productionPlanSchema,
  type ProductionDuration,
} from "@/domain/production/schema";
import { getRuntimeProject } from "@/lib/runtime-project-store";
import { saveProductionPlanRevision } from "@/lib/project-store";

const durations: ProductionDuration[] = [15, 30, 45];

export function ProductionPlanView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conceptKey, setConceptKey] = useState<string | null>(null);
  const [duration, setDuration] = useState<ProductionDuration>(15);
  const [proOpen, setProOpen] = useState(false);
  const [provider, setProvider] = useState<"generic" | "seedance" | "kling" | "veo">("generic");
  const [openScenes, setOpenScenes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    void getRuntimeProject(projectId)
      .then((value) => {
        if (!cancelled) {
          setProject(value);
          setLoaded(true);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Project loading failed.");
          setLoaded(true);
        }
      });
    return () => { cancelled = true; };
  }, [projectId]);

  const plan = project?.productionPlan;
  const activeConcept = useMemo(() => {
    if (!plan) return null;
    return plan.concepts.find((item) => item.conceptKey === conceptKey) ?? plan.concepts[0] ?? null;
  }, [plan, conceptKey]);
  const activeVariant = activeConcept?.variants.find((item) => item.duration === duration) ?? null;

  async function generate() {
    if (
      !project?.product ||
      !project.bible ||
      !project.territories ||
      !project.concepts ||
      !project.assetBible
    ) return;

    const sourceCampaignRevision = project.campaignRevisions.at(-1)?.revision;
    const sourceAssetBibleRevision = project.assetBibleRevisions.at(-1)?.revision;
    const sourceConceptRevisions = getConceptRevisionSnapshot(project, project.shortlist);
    if (!sourceCampaignRevision || !sourceAssetBibleRevision) return;

    setError(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          product: project.product,
          bible: project.bible,
          territories: project.territories,
          concepts: project.concepts,
          shortlist: project.shortlist,
          assetBible: project.assetBible,
          sourceCampaignRevision,
          sourceAssetBibleRevision,
          sourceConceptRevisions,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Production Plan generation failed.");

      const productionPlan = productionPlanSchema.parse(body.productionPlan);
      if (body.persisted) {
        const refreshed = await getRuntimeProject(projectId);
        if (refreshed) setProject(refreshed);
      } else {
        const updated = saveProductionPlanRevision(
          projectId,
          productionPlan,
          body.sourceCampaignRevision,
          body.sourceAssetBibleRevision,
          body.sourceConceptKeys,
          body.sourceConceptRevisions,
        );
        if (updated) {
          setProject(updated);
        } else {
          const revision = project.productionPlanRevisions.length + 1;
          setProject({
            ...project,
            productionPlan,
            productionPlanRevisions: [
              ...project.productionPlanRevisions,
              {
                revision,
                sourceCampaignRevision: body.sourceCampaignRevision,
                sourceAssetBibleRevision: body.sourceAssetBibleRevision,
                sourceConceptKeys: body.sourceConceptKeys,
                sourceConceptRevisions: body.sourceConceptRevisions,
                data: productionPlan,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }
      }
      setConceptKey(productionPlan.concepts[0]?.conceptKey ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Production Plan generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  if (!loaded) {
    return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading production plan…</p></div>;
  }

  if (!project) {
    return <Prerequisite
      title="Project not found."
      body="Open an existing campaign project before Production Planning."
      href="/projects"
      action="Back to projects"
    />;
  }

  if (!project.assetBible || !project.assetBibleRevisions.length) {
    return <Prerequisite
      title="Build the Asset Bible first."
      body="Production Planning requires approved Product, Hero, Wardrobe, Location, and Prop continuity before scenes and shots are created."
      href={`/projects/${projectId}/assets`}
      action="Open Assets"
    />;
  }

  if (!isAssetBibleCurrent(project)) {
    return <Prerequisite
      title="Refresh the Asset Bible first."
      body="The Campaign Bible or shortlist changed after the current Asset Bible was generated. Production Planning only runs from a current production source."
      href={`/projects/${projectId}/assets`}
      action="Regenerate Asset Bible"
    />;
  }

  const latest = project.productionPlanRevisions.at(-1);
  const current = isProductionPlanCurrent(project);

  if (!plan || !latest) {
    return (
      <div className="page-wrap max-w-5xl">
        <p className="eyebrow">Production planning</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Turn selected concepts into executable shots.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500">
          Build 15s, 30s, and 45s treatments, scene graphs, shotlists, and model-neutral prompt packages from the current Asset Bible.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {project.shortlist.map((key) => {
            const concept = project.concepts?.find((item) => item.id === key);
            return <span key={key} className="tag">{concept?.title ?? key}</span>;
          })}
        </div>
        <Button className="mt-8 gap-2" onClick={generate} disabled={generating}>
          {generating ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none"/> : null}
          {generating ? "Building Production Plan…" : "Build Production Plan"}
        </Button>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  if (!activeConcept || !activeVariant) return null;

  return (
    <div className="page-wrap max-w-7xl">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Director document</p>
          <h1>Production Plan</h1>
        </div>
        <p>One structured source for timing, scenes, shots, and provider-ready prompt text. Canonical Asset Bible references remain authoritative throughout.</p>
      </div>

      <section className="mt-7 flex flex-col gap-5 border-b border-neutral-950 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="tag">Revision {latest.revision}</span>
          <span className="tag">Campaign r{latest.sourceCampaignRevision}</span>
          <span className="tag">Assets r{latest.sourceAssetBibleRevision}</span>
          <span className="tag">{latest.sourceConceptKeys.length} concepts</span>
          <span className={current ? "tag border-neutral-950 text-neutral-950" : "tag border-amber-400 bg-amber-50 text-amber-800"}>
            {current ? "Current" : "Out of date"}
          </span>
        </div>
        <Button className="gap-2" onClick={generate} disabled={generating}>
          {generating ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none"/> : <RefreshCw size={14}/>}
          {generating ? "Regenerating…" : "Regenerate"}
        </Button>
      </section>

      {!current ? (
        <div className="mt-6 border-l-2 border-amber-500 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          The Campaign, Asset Bible, or shortlist changed after this Production Plan was generated. This revision remains preserved for reference.
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="meta">Selected concept</p>
          <div className="mt-3 flex gap-2 overflow-x-auto lg:flex-col">
            {plan.concepts.map((concept) => (
              <button
                type="button"
                key={concept.conceptKey}
                onClick={() => setConceptKey(concept.conceptKey)}
                className={`rounded-md border px-3 py-3 text-left text-sm transition motion-reduce:transition-none ${activeConcept.conceptKey === concept.conceptKey ? "border-neutral-950 bg-neutral-950 text-white" : "border-[var(--line)] bg-white text-neutral-600 hover:border-neutral-500"}`}
              >
                <span className="block font-medium">{concept.conceptTitle}</span>
                <span className="mt-1 block font-mono text-[10px] opacity-60">{concept.conceptKey}</span>
              </button>
            ))}
          </div>

          <p className="meta mt-7">Duration</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {durations.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setDuration(value)}
                className={`rounded-md border px-3 py-2 text-sm ${duration === value ? "border-neutral-950 bg-neutral-950 text-white" : "border-[var(--line)] bg-white"}`}
              >
                {value}s
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setProOpen((value) => !value)}
            className="mt-7 flex w-full items-center justify-between border-t border-[var(--line)] pt-4 text-sm font-medium"
          >
            Pro controls
            {proOpen ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
          </button>
        </aside>

        <main className="min-w-0">
          <section className="border-t border-neutral-950 pt-7">
            <p className="eyebrow">{activeVariant.treatment.stableKey}</p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em]">{activeConcept.conceptTitle} · {duration}s</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-600">{activeVariant.treatment.logline}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-500">{activeVariant.treatment.pacing}</p>

            <div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)]">
              {activeVariant.treatment.beats.map((beat, index) => (
                <div key={`${beat.start}-${beat.end}-${index}`} className="grid gap-3 bg-white p-5 sm:grid-cols-[110px_1fr_1fr]">
                  <p className="font-mono text-xs text-neutral-400">{beat.start.toFixed(1)}–{beat.end.toFixed(1)}s</p>
                  <p className="text-sm leading-6">{beat.beat}</p>
                  <p className="text-sm leading-6 text-neutral-500">{beat.productRole}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 border-t border-neutral-950 pt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Scene graph + shotlist</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">{activeVariant.scenes.length} scenes · {activeVariant.shots.length} shots</h2>
              </div>
              <p className="text-xs text-neutral-400">{activeVariant.shots.at(-1)?.end.toFixed(2)}s total</p>
            </div>

            <div className="mt-6 space-y-4">
              {activeVariant.scenes.map((scene) => {
                const sceneShots = activeVariant.shots.filter((shot) => shot.sceneKey === scene.stableKey);
                const open = openScenes[scene.stableKey] ?? true;
                return (
                  <article key={scene.stableKey} className="panel overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenScenes((value) => ({ ...value, [scene.stableKey]: !open }))}
                      className="flex w-full items-start justify-between gap-4 p-6 text-left"
                    >
                      <div>
                        <p className="font-mono text-[11px] text-neutral-400">{scene.stableKey}</p>
                        <h3 className="mt-2 text-xl font-medium">{scene.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">{scene.storyPurpose}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs text-neutral-400">
                        <span>{scene.duration.toFixed(1)}s</span>
                        {open ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                      </div>
                    </button>

                    {open ? (
                      <div className="border-t border-[var(--line)]">
                        <div className="grid gap-px bg-[var(--line)] md:grid-cols-3">
                          <InfoCell label="Action" value={scene.action}/>
                          <InfoCell label="Product role" value={scene.productRole}/>
                          <InfoCell label="Assets" value={scene.assetRefs.join(" · ")}/>
                        </div>
                        <div className="divide-y divide-[var(--line)]">
                          {sceneShots.map((shot) => (
                            <div key={shot.stableKey} className="grid gap-4 bg-white p-6 xl:grid-cols-[120px_1.2fr_1fr_1fr]">
                              <div>
                                <p className="font-mono text-[10px] text-neutral-400">{shot.stableKey}</p>
                                <p className="mt-2 text-xs font-medium">{shot.start.toFixed(2)}–{shot.end.toFixed(2)}s</p>
                              </div>
                              <div>
                                <p className="meta">Frame / action</p>
                                <p className="mt-2 text-sm leading-6">{shot.framing}</p>
                                <p className="mt-2 text-sm leading-6 text-neutral-500">{shot.subjectAction}</p>
                              </div>
                              <div>
                                <p className="meta">Camera / light</p>
                                <p className="mt-2 text-sm leading-6 text-neutral-600">{shot.lensIntent}; {shot.cameraMovement}</p>
                                <p className="mt-2 text-xs leading-5 text-neutral-500">{shot.lightingIntent}</p>
                              </div>
                              <div>
                                <p className="meta">Continuity</p>
                                <p className="mt-2 text-xs leading-5 text-neutral-500">{shot.assetRefs.join(" · ")}</p>
                                <p className="mt-2 text-xs leading-5 text-neutral-500">{shot.continuityNotes.join(" · ")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          {proOpen ? (
            <section className="mt-12 border-t border-neutral-950 pt-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="eyebrow">Prompt compiler</p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">Model-neutral source → provider text</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["generic", "seedance", "kling", "veo"] as const).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setProvider(item)}
                      className={`choice ${provider === item ? "choice-active" : ""}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {activeVariant.promptIR.map((ir) => {
                  const compiled = activeVariant.compiledPrompts.find((item) => item.promptIRKey === ir.stableKey && item.provider === provider);
                  return (
                    <article className="panel p-6" key={ir.stableKey}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-[11px] text-neutral-400">{ir.stableKey}</p>
                        <span className="tag">{provider}</span>
                      </div>
                      <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div>
                          <p className="meta">Prompt IR</p>
                          <dl className="mt-3 space-y-2 text-xs leading-5 text-neutral-600">
                            <div><dt className="font-medium text-neutral-950">Subject</dt><dd>{ir.subject}</dd></div>
                            <div><dt className="font-medium text-neutral-950">Action</dt><dd>{ir.action}</dd></div>
                            <div><dt className="font-medium text-neutral-950">Environment</dt><dd>{ir.environment}</dd></div>
                            <div><dt className="font-medium text-neutral-950">Asset refs</dt><dd>{ir.assetRefs.join(" · ")}</dd></div>
                          </dl>
                        </div>
                        <div>
                          <p className="meta">Compiled prompt</p>
                          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{compiled?.prompt}</pre>
                          <p className="meta mt-4">Negative constraints</p>
                          <p className="mt-2 text-xs leading-5 text-neutral-500">{compiled?.negativePrompt}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Prerequisite({ title, body, href, action }: { title: string; body: string; href: string; action: string }) {
  return (
    <div className="page-wrap max-w-3xl">
      <p className="eyebrow">Production planning</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">{body}</p>
      <Link href={href} className="mt-7 inline-flex min-h-10 items-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white">
        {action} <ArrowRight size={15}/>
      </Link>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <p className="meta">{label}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{value}</p>
    </div>
  );
}

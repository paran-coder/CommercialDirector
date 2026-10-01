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
          setError(caught instanceof Error ? caught.message : "프로젝트를 불러오지 못했습니다.");
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
      if (!response.ok) throw new Error(body.error ?? "Production Plan 생성에 실패했습니다.");

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
      setError(caught instanceof Error ? caught.message : "Production Plan 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  if (!loaded) {
    return <div className="page-wrap"><p className="text-sm text-neutral-500">Production Plan을 불러오는 중…</p></div>;
  }

  if (!project) {
    return <Prerequisite
      title="프로젝트를 찾을 수 없습니다."
      body="Production Planning을 시작하려면 기존 캠페인 프로젝트를 열어 주세요."
      href="/projects"
      action="프로젝트 목록으로"
    />;
  }

  if (!project.assetBible || !project.assetBibleRevisions.length) {
    return <Prerequisite
      title="먼저 Asset Bible을 만들어 주세요."
      body="Scene과 Shot을 만들기 전에 Product, Hero, Wardrobe, Location, Prop의 continuity가 Asset Bible에 확정되어 있어야 합니다."
      href={`/projects/${projectId}/assets`}
      action="Asset Bible 열기"
    />;
  }

  if (!isAssetBibleCurrent(project)) {
    return <Prerequisite
      title="Asset Bible을 먼저 최신 상태로 맞춰 주세요."
      body="현재 Asset Bible을 만든 뒤 Campaign Bible 또는 shortlist가 변경되었습니다. Production Planning은 Current 상태의 제작 소스에서만 진행합니다."
      href={`/projects/${projectId}/assets`}
      action="Asset Bible 재생성"
    />;
  }

  const latest = project.productionPlanRevisions.at(-1);
  const current = isProductionPlanCurrent(project);

  if (!plan || !latest) {
    return (
      <div className="page-wrap max-w-5xl">
        <p className="eyebrow">Production Planning · 제작 설계</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">선택한 Concept를 실제 촬영 가능한 Shot으로 바꿉니다.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500">
          현재 Asset Bible을 기준으로 15초·30초·45초 Treatment, Scene Graph, Shotlist, 모델 중립 Prompt 패키지를 만듭니다.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {project.shortlist.map((key) => {
            const concept = project.concepts?.find((item) => item.id === key);
            return <span key={key} className="tag">{concept?.title ?? key}</span>;
          })}
        </div>
        <Button className="mt-8 gap-2" onClick={generate} disabled={generating}>
          {generating ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none"/> : null}
          {generating ? "Production Plan 생성 중…" : "Production Plan 만들기"}
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
          <p className="eyebrow">Director Document · 제작 문서</p>
          <h1>Production Plan</h1>
        </div>
        <p>타이밍, Scene, Shot, provider용 prompt를 하나의 구조화된 제작 문서로 관리합니다. 모든 제작 정보는 canonical Asset Bible reference를 기준으로 합니다.</p>
      </div>

      <section className="mt-7 flex flex-col gap-5 border-b border-neutral-950 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="tag">Revision {latest.revision}</span>
          <span className="tag">Campaign r{latest.sourceCampaignRevision}</span>
          <span className="tag">Assets r{latest.sourceAssetBibleRevision}</span>
          <span className="tag">Concept {latest.sourceConceptKeys.length}개</span>
          <span className={current ? "tag border-neutral-950 text-neutral-950" : "tag border-amber-400 bg-amber-50 text-amber-800"}>
            {current ? "Current · 최신" : "Out of date · 재생성 필요"}
          </span>
        </div>
        <Button className="gap-2" onClick={generate} disabled={generating}>
          {generating ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none"/> : <RefreshCw size={14}/>}
          {generating ? "재생성 중…" : "재생성"}
        </Button>
      </section>

      {!current ? (
        <div className="mt-6 border-l-2 border-amber-500 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          이 Production Plan 생성 후 Campaign, Asset Bible, shortlist 또는 Concept revision이 변경되었습니다. 이 revision은 기록으로 보존되며 현재 기준으로 다시 생성해야 합니다.
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="meta">선택한 Concept</p>
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

          <p className="meta mt-7">영상 길이</p>
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
            Pro Controls
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
                <p className="eyebrow">Scene Graph + Shotlist</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">Scene {activeVariant.scenes.length}개 · Shot {activeVariant.shots.length}개</h2>
              </div>
              <p className="text-xs text-neutral-400">{activeVariant.shots.at(-1)?.end.toFixed(2)}초 합계</p>
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
                          <InfoCell label="동작/상황" value={scene.action}/>
                          <InfoCell label="제품 역할" value={scene.productRole}/>
                          <InfoCell label="사용 Asset" value={scene.assetRefs.join(" · ")}/>
                        </div>
                        <div className="divide-y divide-[var(--line)]">
                          {sceneShots.map((shot) => (
                            <div key={shot.stableKey} className="grid gap-4 bg-white p-6 xl:grid-cols-[120px_1.2fr_1fr_1fr]">
                              <div>
                                <p className="font-mono text-[10px] text-neutral-400">{shot.stableKey}</p>
                                <p className="mt-2 text-xs font-medium">{shot.start.toFixed(2)}–{shot.end.toFixed(2)}s</p>
                              </div>
                              <div>
                                <p className="meta">프레이밍 / 동작</p>
                                <p className="mt-2 text-sm leading-6">{shot.framing}</p>
                                <p className="mt-2 text-sm leading-6 text-neutral-500">{shot.subjectAction}</p>
                              </div>
                              <div>
                                <p className="meta">카메라 / 조명</p>
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
                  <p className="eyebrow">Prompt Compiler</p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">모델 중립 Prompt IR → provider용 prompt</h2>
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
                            <div><dt className="font-medium text-neutral-950">피사체</dt><dd>{ir.subject}</dd></div>
                            <div><dt className="font-medium text-neutral-950">동작</dt><dd>{ir.action}</dd></div>
                            <div><dt className="font-medium text-neutral-950">환경</dt><dd>{ir.environment}</dd></div>
                            <div><dt className="font-medium text-neutral-950">Asset refs</dt><dd>{ir.assetRefs.join(" · ")}</dd></div>
                          </dl>
                        </div>
                        <div>
                          <p className="meta">Compiled prompt · 실제 provider용 영문 prompt</p>
                          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{compiled?.prompt}</pre>
                          <p className="meta mt-4">금지 조건</p>
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
      <p className="eyebrow">Production Planning · 제작 설계</p>
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

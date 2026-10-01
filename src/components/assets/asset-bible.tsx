"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assetBibleSchema } from "@/domain/assets/schema";
import {
  isAssetBibleCurrent,
  type ProjectSnapshot,
} from "@/domain/project/schema";
import {
  demoBible,
  demoConcepts,
  demoProduct,
  demoTerritories,
} from "@/lib/fixtures/demo";
import { getRuntimeProject } from "@/lib/runtime-project-store";
import { saveAssetBibleRevision } from "@/lib/project-store";

export function AssetBibleView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadProject(projectId).then((value) => {
      if (!cancelled) {
        setProject(value);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [projectId]);

  async function generate() {
    if (!project?.product || !project.bible || !project.territories || !project.concepts) return;
    const campaignRevision = project.campaignRevisions.at(-1)?.revision;
    if (!campaignRevision) return;

    setError(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          product: project.product,
          bible: project.bible,
          territories: project.territories,
          concepts: project.concepts,
          shortlist: project.shortlist,
          sourceCampaignRevision: campaignRevision,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Asset Bible generation failed.");

      const assetBible = assetBibleSchema.parse(body.assetBible);
      if (body.persisted) {
        const refreshed = await getRuntimeProject(projectId);
        if (refreshed) setProject(refreshed);
      } else {
        const updated = saveAssetBibleRevision(
          projectId,
          assetBible,
          body.sourceCampaignRevision,
          body.sourceConceptKeys,
        );
        if (updated) {
          setProject(updated);
        } else {
          const revision = project.assetBibleRevisions.length + 1;
          setProject({
            ...project,
            assetBible,
            assetBibleRevisions: [
              ...project.assetBibleRevisions,
              {
                revision,
                sourceCampaignRevision: body.sourceCampaignRevision,
                sourceConceptKeys: body.sourceConceptKeys,
                data: assetBible,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Asset Bible generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  if (!loaded) {
    return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading assets…</p></div>;
  }

  if (!project?.bible || !project.concepts || !project.territories || !project.product) {
    return <PrerequisiteState
      eyebrow="Asset Bible"
      title="Build the campaign first."
      body="Asset specifications are derived from an approved Campaign Bible and the concepts it produced."
      href={`/projects/${projectId}/brief`}
      action="Go to creative brief"
    />;
  }

  if (project.shortlist.length === 0) {
    return <PrerequisiteState
      eyebrow="Asset Bible"
      title="Choose what deserves production."
      body="Shortlist at least one concept before creating Hero, Wardrobe, Location, Prop, and Product Sheet specifications."
      href={`/projects/${projectId}/concepts`}
      action="Review 20 concepts"
    />;
  }

  if (project.shortlist.length > 5) {
    return <PrerequisiteState
      eyebrow="Asset Bible"
      title="Narrow the production set."
      body="Asset Bible supports one to five shortlisted concepts so the production world stays specific instead of averaging too many directions."
      href={`/projects/${projectId}/concepts`}
      action="Narrow shortlist"
    />;
  }

  const assetBible = project.assetBible;
  const latestRevision = project.assetBibleRevisions.at(-1);
  const current = isAssetBibleCurrent(project);

  if (!assetBible || !latestRevision) {
    return (
      <div className="page-wrap max-w-5xl">
        <p className="eyebrow">Production specification</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Build the Asset Bible.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500">
          Convert {project.shortlist.length} shortlisted concept{project.shortlist.length === 1 ? "" : "s"} into one reusable Product, Hero, Wardrobe, Location, and Prop system before scenes and shots are created.
        </p>
        <SourceConcepts concepts={project.concepts} shortlist={project.shortlist}/>
        <Button className="mt-8 gap-2" onClick={generate} disabled={generating}>
          {generating ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none"/> : null}
          {generating ? "Building Asset Bible…" : "Build Asset Bible"}
        </Button>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="page-wrap max-w-7xl">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Production specification</p>
          <h1>Asset Bible</h1>
        </div>
        <p>A reusable continuity source for the selected concepts. Future scenes and shots should reference these stable asset keys rather than reinventing production details.</p>
      </div>

      <section className="mt-7 flex flex-col gap-5 border-b border-neutral-950 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="tag">Revision {latestRevision.revision}</span>
          <span className="tag">Campaign r{latestRevision.sourceCampaignRevision}</span>
          <span className="tag">{latestRevision.sourceConceptKeys.length} selected concepts</span>
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
          The Campaign Bible or shortlist has changed since this Asset Bible was generated. The previous revision is preserved; regenerate to create a new production source.
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <SourceConcepts concepts={project.concepts} shortlist={latestRevision.sourceConceptKeys}/>

      <AssetSection number="01" title="Product Sheet" description={assetBible.productSheet.identityStatement}>
        <AssetHeader stableKey={assetBible.productSheet.stableKey}/>
        <GridLists items={[
          ["Preserve", assetBible.productSheet.preserve],
          ["Form rules", assetBible.productSheet.formRules],
          ["Materials & surface", assetBible.productSheet.materialsAndSurface],
          ["Color & markings", assetBible.productSheet.colorAndMarkingRules],
          ["Scale & handling", assetBible.productSheet.scaleAndHandling],
          ["Hero angles", assetBible.productSheet.heroAngles],
          ["Avoid", assetBible.productSheet.avoid],
          ["Continuity locks", assetBible.productSheet.continuityLocks],
        ]}/>
      </AssetSection>

      <AssetSection number="02" title="Hero" description={assetBible.hero.role}>
        <AssetHeader stableKey={assetBible.hero.stableKey} conceptRefs={assetBible.hero.conceptRefs}/>
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          <TextCell title="Applicability" body={assetBible.hero.applicability}/>
          <TextCell title="Casting" body={assetBible.hero.castingDirection}/>
          <TextCell title="Appearance & grooming" body={assetBible.hero.appearanceAndGrooming}/>
          <TextCell title="Performance" body={assetBible.hero.performanceDirection}/>
          <TextCell title="Relationship to product" body={assetBible.hero.relationshipToProduct}/>
          <ListCell title="Continuity locks" items={assetBible.hero.continuityLocks}/>
        </div>
      </AssetSection>

      <AssetSection number="03" title="Wardrobe" description={assetBible.wardrobe.length ? "Reusable looks tied to the selected Hero and concepts." : "No wardrobe system is required for this selection."}>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {assetBible.wardrobe.map((look) => (
            <article key={look.stableKey} className="panel p-6">
              <AssetHeader stableKey={look.stableKey} conceptRefs={look.conceptRefs}/>
              <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">{look.label}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{look.silhouette}</p>
              <MiniLists items={[
                ["Materials", look.materials],
                ["Palette", look.palette],
                ["Styling", look.stylingNotes],
                ["Locks", look.continuityLocks],
              ]}/>
            </article>
          ))}
        </div>
      </AssetSection>

      <AssetSection number="04" title="Locations" description="Canonical environments that selected concepts can reuse without losing their individual mechanisms.">
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {assetBible.locations.map((location) => (
            <article key={location.stableKey} className="panel p-6">
              <AssetHeader stableKey={location.stableKey} conceptRefs={location.conceptRefs}/>
              <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">{location.label}</h3>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">{location.environmentType}</p>
              <p className="mt-4 text-sm leading-6 text-neutral-600">{location.spatialDescription}</p>
              <p className="mt-4 text-sm leading-6"><span className="font-medium">Lighting window:</span> <span className="text-neutral-600">{location.lightingWindow}</span></p>
              <MiniLists items={[
                ["Materials", location.materials],
                ["Palette", location.palette],
                ["Practical cues", location.practicalCues],
                ["Locks", location.continuityLocks],
              ]}/>
            </article>
          ))}
        </div>
      </AssetSection>

      <AssetSection number="05" title="Props" description="Production objects with a defined role, finish, staging logic, and continuity contract.">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assetBible.props.map((prop) => (
            <article key={prop.stableKey} className="panel p-6">
              <AssetHeader stableKey={prop.stableKey} conceptRefs={prop.conceptRefs}/>
              <h3 className="mt-5 text-lg font-medium">{prop.label}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{prop.productionRole}</p>
              <p className="mt-4 text-xs leading-5 text-neutral-500">{prop.materialAndFinish}</p>
              <MiniLists items={[
                ["Palette", prop.palette],
                ["Locks", prop.continuityLocks],
              ]}/>
            </article>
          ))}
        </div>
      </AssetSection>

      <AssetSection number="06" title="Global Continuity" description="Rules that keep the campaign coherent without flattening intentional differences between concepts.">
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
          <ListCell title="Campaign rules" items={assetBible.globalContinuity.rules}/>
          <ListCell title="Keep distinct" items={assetBible.globalContinuity.conflicts.length ? assetBible.globalContinuity.conflicts : ["No material cross-concept conflicts identified."]}/>
          <ListCell title="Production notes" items={assetBible.globalContinuity.productionNotes}/>
        </div>
      </AssetSection>
    </div>
  );
}

async function loadProject(projectId: string): Promise<ProjectSnapshot | null> {
  const stored = await getRuntimeProject(projectId);
  if (stored) return stored;
  if (projectId !== "demo-aurelia") return null;
  const now = new Date().toISOString();
  return {
    version: 1,
    id: projectId,
    brandName: "Aurelia",
    productName: "No. 7 Eau de Parfum",
    createdAt: now,
    updatedAt: now,
    product: demoProduct,
    bible: demoBible,
    territories: demoTerritories,
    concepts: demoConcepts,
    shortlist: ["concept-06", "concept-07"],
    campaignRevisions: [{
      revision: 1,
      bible: demoBible,
      territories: demoTerritories,
      concepts: demoConcepts,
      createdAt: now,
    }],
    conceptRevisions: [],
    assetBibleRevisions: [],
    productionPlanRevisions: [],
  };
}

function PrerequisiteState({ eyebrow, title, body, href, action }: { eyebrow: string; title: string; body: string; href: string; action: string }) {
  return (
    <div className="page-wrap max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">{body}</p>
      <Link href={href} className="mt-7 inline-flex min-h-10 items-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white">
        {action} <ArrowRight size={15}/>
      </Link>
    </div>
  );
}

function SourceConcepts({ concepts, shortlist }: { concepts: ProjectSnapshot["concepts"]; shortlist: string[] }) {
  if (!concepts) return null;
  const selected = concepts.filter((concept) => shortlist.includes(concept.id));
  return (
    <div className="mt-7 flex flex-wrap gap-2">
      {selected.map((concept) => <span className="tag" key={concept.id}>{concept.title}</span>)}
    </div>
  );
}

function AssetSection({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-neutral-950 pt-7">
      <div className="grid gap-3 lg:grid-cols-[90px_280px_1fr]">
        <p className="question-number">{number}</p>
        <h2 className="text-2xl font-medium tracking-[-0.025em]">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function AssetHeader({ stableKey, conceptRefs }: { stableKey: string; conceptRefs?: string[] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] text-neutral-400">{stableKey}</span>
      {conceptRefs?.map((ref) => <span className="tag" key={ref}>{ref}</span>)}
    </div>
  );
}

function GridLists({ items }: { items: Array<[string, string[]]> }) {
  return <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 xl:grid-cols-4">{items.map(([title, values]) => <ListCell key={title} title={title} items={values}/>)}</div>;
}

function MiniLists({ items }: { items: Array<[string, string[]]> }) {
  return <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map(([title, values]) => <div key={title}><p className="meta">{title}</p><p className="mt-2 text-xs leading-5 text-neutral-500">{values.join(" · ")}</p></div>)}</div>;
}

function ListCell({ title, items }: { title: string; items: string[] }) {
  return <div className="bg-white p-5 sm:p-6"><p className="meta">{title}</p><ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function TextCell({ title, body }: { title: string; body: string }) {
  return <div className="bg-white p-5 sm:p-6"><p className="meta">{title}</p><p className="mt-3 text-sm leading-6 text-neutral-600">{body}</p></div>;
}

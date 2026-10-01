"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreativeBrief } from "@/domain/brief/schema";
import { creativeBriefSchema } from "@/domain/brief/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import { demoProduct } from "@/lib/fixtures/demo";
import { saveCampaignResult } from "@/lib/project-store";
import { getRuntimeProject, updateRuntimeProject } from "@/lib/runtime-project-store";
import { Button } from "@/components/ui/button";

const personalityOptions = ["Luxury", "Minimal", "Bold", "Youthful", "Technical", "Playful", "Natural", "Sport"];
const moodOptions = ["Mysterious", "Intimate", "Cinematic", "Provocative", "Elegant", "Energetic"];
const fragranceOccasions = ["Date night", "Party", "Private ritual", "Special occasion", "Everyday"];

export function CreativeBriefView({ projectId, initial }: { projectId: string; initial: CreativeBrief }) {
  const router = useRouter();
  const [brief, setBrief] = useState<CreativeBrief>(initial);
  const [product, setProduct] = useState<ProductIntelligence>(demoProduct);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(projectId === "demo-aurelia");
  const [error, setError] = useState<string | null>(null);
  const isFragrance = product.category.toLowerCase().includes("fragrance");
  const occasionOptions = isFragrance ? fragranceOccasions : ["Daily routine", "On the go", "At work", "At home", "Special occasion"];
  const emotionalSuggestions = isFragrance ? ["Memorable entrance", "After-dark presence", "Quiet confidence"] : ["Everyday confidence", "Effortless use", "A clear upgrade"];

  useEffect(() => {
    let cancelled = false;
    void getRuntimeProject(projectId).then((local) => {
      if (cancelled) return;
      if (local?.brief) setBrief(local.brief);
      else if (local) setBrief(emptyBrief);
      if (local?.product) setProduct(local.product);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  function toggleArray(field: "brandPersonality" | "mood", value: string, limit: number) {
    setBrief((current) => {
      const values = current[field];
      const nextValues = values.includes(value) ? values.filter((item) => item !== value) : values.length < limit ? [...values, value] : values;
      return { ...current, [field]: nextValues };
    });
  }

  function patchAudience(field: keyof CreativeBrief["audience"], value: string) {
    setBrief((current) => ({ ...current, audience: { ...current.audience, [field]: value } }));
  }

  async function buildCampaign() {
    setError(null);
    const parsed = creativeBriefSchema.safeParse(brief);
    if (!parsed.success) {
      setError("Please complete the brief before building the campaign.");
      return;
    }
    setLoading(true);
    await updateRuntimeProject(projectId, { brief: parsed.data });
    try {
      const response = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, product, brief: parsed.data }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Campaign generation failed");
      saveCampaignResult(projectId, {
        brief: parsed.data,
        bible: data.bible,
        territories: data.territories,
        concepts: data.concepts,
      });
      router.push(`/projects/${projectId}/campaign`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Campaign generation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading creative brief…</p></div>;

  return (
    <div className="page-wrap max-w-5xl">
      <div className="section-heading"><div><p className="eyebrow">Creative brief</p><h1>Tell us how this should sell.</h1></div><p>Four decisions establish the strategy. Product-specific questions are added only when they materially improve the campaign.</p></div>
      <div className="mt-10 space-y-5">
        <section className="panel p-6 sm:p-8"><p className="question-number">01</p><h2 className="question">How should this brand feel?</h2><p className="helper">Choose up to three.</p><div className="mt-5 flex flex-wrap gap-2">{personalityOptions.map((item) => <button className={brief.brandPersonality.includes(item) ? "choice choice-active" : "choice"} onClick={() => toggleArray("brandPersonality", item, 3)} key={item}>{item}</button>)}</div></section>
        <section className="panel p-6 sm:p-8"><p className="question-number">02</p><h2 className="question">Who should want this?</h2><div className="mt-6 grid gap-4 sm:grid-cols-3"><BriefField label="Age" value={brief.audience.age} onChange={(value) => patchAudience("age", value)}/><BriefField label="Audience" value={brief.audience.gender} onChange={(value) => patchAudience("gender", value)}/><BriefField label="Context" value={brief.audience.context} onChange={(value) => patchAudience("context", value)}/></div></section>
        <section className="panel p-6 sm:p-8"><p className="question-number">03</p><h2 className="question">What should people remember?</h2><label className="mt-5 block"><span className="meta">Core benefit</span><input value={brief.coreBenefit} onChange={(event) => setBrief((current) => ({ ...current, coreBenefit: event.target.value }))} placeholder="What does the product do or enable?" className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-neutral-500"/></label><label className="mt-4 block"><span className="meta">Emotional takeaway</span><textarea value={brief.emotionalBenefit} onChange={(event) => setBrief((current) => ({ ...current, emotionalBenefit: event.target.value }))} rows={3} className="mt-2 w-full resize-none rounded-lg border border-[var(--line)] bg-neutral-50 p-4 text-sm leading-6 outline-none focus:border-neutral-500"/></label><div className="mt-4 flex flex-wrap gap-2">{emotionalSuggestions.map((suggestion) => <button key={suggestion} className="tag" onClick={() => setBrief((current) => ({ ...current, emotionalBenefit: suggestion }))}>{suggestion}</button>)}</div></section>
        <section className="panel p-6 sm:p-8"><p className="question-number">04</p><h2 className="question">What should the campaign feel like?</h2><div className="mt-5 flex flex-wrap gap-2">{moodOptions.map((item) => <button className={brief.mood.includes(item) ? "choice choice-active" : "choice"} onClick={() => toggleArray("mood", item, 4)} key={item}>{item}</button>)}</div></section>
        <section className="panel border-dashed p-6 sm:p-8"><p className="question-number">Dynamic</p><h2 className="question">{isFragrance ? "When does the fragrance come alive?" : "When should the product matter most?"}</h2><p className="helper">Added from product classification.</p><div className="mt-5 flex flex-wrap gap-2">{occasionOptions.map((item) => <button onClick={() => setBrief((current) => ({ ...current, occasion: item }))} className={brief.occasion === item ? "choice choice-active" : "choice"} key={item}>{item}</button>)}</div></section>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-neutral-950 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>{loading ? <div className="flex items-center gap-3 text-sm text-neutral-600"><Loader2 size={16} className="animate-spin motion-reduce:animate-none"/><span>Building strategy → 4 territories → 20 concepts</span></div> : <p className="text-xs leading-5 text-neutral-500">One campaign bible will be shared by all 20 concepts.</p>}{error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}</div>
        <Button className="gap-2" onClick={buildCampaign} disabled={loading}>{loading ? "Building campaign" : "Build campaign"}<ArrowRight size={15}/></Button>
      </div>
    </div>
  );
}

function BriefField({ label, value, onChange }: { label: string; value: string; onChange(value: string): void }) {
  return <label><span className="meta">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-neutral-500"/></label>;
}

const emptyBrief: CreativeBrief = {
  brandPersonality: [],
  audience: { age: "", gender: "", context: "" },
  coreBenefit: "",
  emotionalBenefit: "",
  mood: [],
  occasion: "",
  constraints: [],
};

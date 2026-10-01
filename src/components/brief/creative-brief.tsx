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

const personalityOptions = ["럭셔리", "미니멀", "대담함", "젊음", "테크니컬", "유쾌함", "내추럴", "스포티"];
const moodOptions = ["신비로운", "친밀한", "시네마틱", "도발적인", "우아한", "에너지 넘치는"];
const fragranceOccasions = ["데이트/저녁 외출", "파티", "혼자만의 의식", "특별한 날", "일상"];

export function CreativeBriefView({ projectId, initial }: { projectId: string; initial: CreativeBrief }) {
  const router = useRouter();
  const [brief, setBrief] = useState<CreativeBrief>(initial);
  const [product, setProduct] = useState<ProductIntelligence>(demoProduct);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(projectId === "demo-aurelia");
  const [error, setError] = useState<string | null>(null);
  const category = product.category.toLowerCase();
  const isFragrance = category.includes("fragrance") || category.includes("향수") || category.includes("parfum");
  const occasionOptions = isFragrance ? fragranceOccasions : ["일상 루틴", "이동 중", "업무 중", "집에서", "특별한 날"];
  const emotionalSuggestions = isFragrance ? ["기억에 남는 등장", "밤의 존재감", "절제된 자신감"] : ["일상의 자신감", "자연스러운 사용감", "분명한 업그레이드"];

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
      setError("캠페인을 만들기 전에 브리프를 모두 입력해 주세요.");
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
      if (!response.ok) throw new Error(data.error ?? "캠페인 생성에 실패했습니다.");
      saveCampaignResult(projectId, {
        brief: parsed.data,
        bible: data.bible,
        territories: data.territories,
        concepts: data.concepts,
      });
      router.push(`/projects/${projectId}/campaign`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "캠페인 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">Creative Brief를 불러오는 중…</p></div>;

  return (
    <div className="page-wrap max-w-5xl">
      <div className="section-heading"><div><p className="eyebrow">Creative Brief · 크리에이티브 브리프</p><h1>이 제품을 어떤 방식으로 팔아야 하는지 알려주세요.</h1></div><p>핵심 질문 네 가지로 전략을 잡습니다. 제품 특성상 꼭 필요한 경우에만 추가 질문이 붙습니다.</p></div>
      <div className="mt-10 space-y-5">
        <section className="panel p-6 sm:p-8"><p className="question-number">01</p><h2 className="question">브랜드가 어떤 인상을 줘야 하나요?</h2><p className="helper">최대 3개까지 선택해 주세요.</p><div className="mt-5 flex flex-wrap gap-2">{personalityOptions.map((item) => <button className={brief.brandPersonality.includes(item) ? "choice choice-active" : "choice"} onClick={() => toggleArray("brandPersonality", item, 3)} key={item}>{item}</button>)}</div></section>
        <section className="panel p-6 sm:p-8"><p className="question-number">02</p><h2 className="question">누가 이 제품을 원해야 하나요?</h2><div className="mt-6 grid gap-4 sm:grid-cols-3"><BriefField label="연령" value={brief.audience.age} onChange={(value) => patchAudience("age", value)}/><BriefField label="대상" value={brief.audience.gender} onChange={(value) => patchAudience("gender", value)}/><BriefField label="상황/라이프스타일" value={brief.audience.context} onChange={(value) => patchAudience("context", value)}/></div></section>
        <section className="panel p-6 sm:p-8"><p className="question-number">03</p><h2 className="question">사람들이 무엇을 기억해야 하나요?</h2><label className="mt-5 block"><span className="meta">핵심 효익</span><input value={brief.coreBenefit} onChange={(event) => setBrief((current) => ({ ...current, coreBenefit: event.target.value }))} placeholder="이 제품이 무엇을 해주거나 가능하게 하나요?" className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-neutral-500"/></label><label className="mt-4 block"><span className="meta">감정적 인상</span><textarea value={brief.emotionalBenefit} onChange={(event) => setBrief((current) => ({ ...current, emotionalBenefit: event.target.value }))} rows={3} className="mt-2 w-full resize-none rounded-lg border border-[var(--line)] bg-neutral-50 p-4 text-sm leading-6 outline-none focus:border-neutral-500"/></label><div className="mt-4 flex flex-wrap gap-2">{emotionalSuggestions.map((suggestion) => <button key={suggestion} className="tag" onClick={() => setBrief((current) => ({ ...current, emotionalBenefit: suggestion }))}>{suggestion}</button>)}</div></section>
        <section className="panel p-6 sm:p-8"><p className="question-number">04</p><h2 className="question">캠페인의 분위기는 어때야 하나요?</h2><div className="mt-5 flex flex-wrap gap-2">{moodOptions.map((item) => <button className={brief.mood.includes(item) ? "choice choice-active" : "choice"} onClick={() => toggleArray("mood", item, 4)} key={item}>{item}</button>)}</div></section>
        <section className="panel border-dashed p-6 sm:p-8"><p className="question-number">맞춤 질문</p><h2 className="question">{isFragrance ? "향수가 가장 빛나는 순간은 언제인가요?" : "제품이 가장 중요해지는 순간은 언제인가요?"}</h2><p className="helper">제품 분류 결과에 따라 추가된 질문입니다.</p><div className="mt-5 flex flex-wrap gap-2">{occasionOptions.map((item) => <button onClick={() => setBrief((current) => ({ ...current, occasion: item }))} className={brief.occasion === item ? "choice choice-active" : "choice"} key={item}>{item}</button>)}</div></section>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-neutral-950 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>{loading ? <div className="flex items-center gap-3 text-sm text-neutral-600"><Loader2 size={16} className="animate-spin motion-reduce:animate-none"/><span>전략 → 4개 Territory → 20개 Concept 생성 중</span></div> : <p className="text-xs leading-5 text-neutral-500">하나의 Campaign Bible을 20개 Concept가 공통 기준으로 사용합니다.</p>}{error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}</div>
        <Button className="gap-2" onClick={buildCampaign} disabled={loading}>{loading ? "캠페인 생성 중" : "캠페인 만들기"}<ArrowRight size={15}/></Button>
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

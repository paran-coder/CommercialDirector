"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProductIntelligence } from "@/domain/product/schema";
import { Button } from "@/components/ui/button";
import { createRuntimeProject } from "@/lib/runtime-project-store";
import { putProductImage } from "@/lib/product-image-store";

export function ProductUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProductIntelligence | null>(null);
  const [brandName, setBrandName] = useState("");
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(nextFile: File | null) {
    setFile(nextFile);
    setAnalysis(null);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  async function analyze() {
    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setError("JPG, PNG 또는 WEBP 제품 이미지를 사용해 주세요.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("8MB보다 작은 이미지를 사용해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      const response = await fetch("/api/ai/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "제품 분석에 실패했습니다.");
      setAnalysis(data.product);
      if (!productName) setProductName(data.product.subcategory || data.product.category);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function continueToProject() {
    if (!analysis) return;
    const project = await createRuntimeProject(analysis, { brandName, productName });
    if (file) {
      try { await putProductImage(project.id, file); } catch { /* Metadata flow can continue if browser blob storage is unavailable. */ }
    }
    router.push(`/projects/${project.id}/product`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section>
        <p className="eyebrow">새 캠페인</p>
        <h1 className="mt-4 max-w-xl text-4xl font-medium tracking-[-0.035em] sm:text-5xl">제품 이미지에서 시작합니다.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-500">선명한 제품 이미지 한 장으로 제품의 시각적 정체성, 반드시 지켜야 할 제약, 첫 캠페인 세계관을 설정합니다.</p>

        <label className="mt-10 grid min-h-[360px] cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-white transition hover:border-neutral-500 motion-reduce:transition-none">
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} />
          {preview ? (
            <div className="relative h-[360px] w-full bg-neutral-100">
              <Image src={preview} alt="제품 이미지 미리보기" fill className="object-contain p-8" unoptimized />
            </div>
          ) : (
            <div className="text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full border border-neutral-200 bg-neutral-50"><ImagePlus size={18} /></span>
              <p className="mt-4 text-sm font-medium">제품 이미지를 놓거나 클릭해서 선택</p>
              <p className="mt-1 text-xs text-neutral-400">JPG, PNG or WEBP</p>
            </div>
          )}
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label><span className="meta">브랜드명 · 선택</span><input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Aurelia" className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-neutral-500" /></label>
          <label><span className="meta">제품명 · 선택</span><input value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="No. 7 Eau de Parfum" className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-neutral-500" /></label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={analyze} disabled={!file || loading}>
            {loading ? <><Loader2 className="mr-2 animate-spin motion-reduce:animate-none" size={15} />분석 중</> : analysis ? "다시 분석" : "제품 분석"}
          </Button>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </section>

      <aside className="lg:pt-28">
        <div className="rounded-xl border border-[var(--line)] bg-white p-6">
          <p className="eyebrow">Product Intelligence · 제품 분석</p>
          {analysis ? (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {[analysis.category, ...analysis.perception].map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
              <p className="mt-6 text-sm leading-6 text-neutral-600">{analysis.summary}</p>
              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <p className="text-xs font-medium text-neutral-900">Identity Locks · 정체성 고정 규칙</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">{analysis.identityLocks.join(" · ")}</p>
              </div>
              <Button className="mt-6 w-full gap-2" onClick={continueToProject}>캠페인 만들기 <ArrowRight size={15} /></Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-sm leading-6 text-neutral-500">
              <p>캠페인을 만들기 전에 제품 분석 결과가 여기에 표시됩니다.</p>
              <p>Fixture 모드는 API 키 없이 동작합니다. 실제 AI provider에서도 같은 제품 분석 계약을 사용합니다.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("이미지 파일을 읽을 수 없습니다."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

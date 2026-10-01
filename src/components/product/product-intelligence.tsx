"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProductIntelligence } from "@/domain/product/schema";
import { getRuntimeProject, updateRuntimeProject } from "@/lib/runtime-project-store";
import { getProductImage } from "@/lib/product-image-store";
import { Button } from "@/components/ui/button";

export function ProductIntelligenceView({ projectId, fallback }: { projectId: string; fallback: ProductIntelligence }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductIntelligence>(fallback);
  const [locks, setLocks] = useState(() => new Set(fallback.identityLocks));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(projectId === "demo-aurelia");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    void getRuntimeProject(projectId).then((local) => {
      if (cancelled || !local?.product) return;
      setProduct(local.product);
      setLocks(new Set(local.product.identityLocks));
    });

    getProductImage(projectId)
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoaded(true); });

    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [projectId]);

  const lockList = useMemo(() => Array.from(locks), [locks]);
  const availableLocks: ProductIntelligence["identityLocks"][number][] = ["silhouette", "cap", "label", "logo", "product_color", "material_finish"];

  function toggle(lock: ProductIntelligence["identityLocks"][number]) {
    const next = new Set(locks);
    if (next.has(lock)) next.delete(lock); else next.add(lock);
    const nextProduct = { ...product, identityLocks: Array.from(next) };
    setLocks(next);
    setProduct(nextProduct);
    void updateRuntimeProject(projectId, { product: nextProduct });
  }

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">제품 분석을 불러오는 중…</p></div>;

  return (
    <div className="page-wrap">
      <div className="section-heading">
        <div><p className="eyebrow">Product Intelligence · 제품 분석</p><h1>무엇이 달라지면 안 되는지 확인합니다.</h1></div>
        <p>여기서 제품 분석을 한 번 바로잡으면 이후 모든 Concept와 제작 단계가 이 시각적 제약을 이어받습니다.</p>
      </div>
      <div className="mt-10 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="product-stage" aria-label="업로드한 제품 이미지">
          {imageUrl ? <Image src={imageUrl} alt="업로드한 제품" fill unoptimized className="object-contain p-10" /> : <div className="bottle"><div className="bottle-cap" /><div className="bottle-label">PRODUCT<br/><span>IDENTITY</span></div></div>}
        </div>
        <div className="grid gap-6">
          <section className="panel p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">{[product.category, ...product.perception].map((item) => <span className="tag" key={item}>{item}</span>)}</div>
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600">{product.summary}</p>
            <dl className="mt-8 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
              <div><dt className="meta">주요 소재</dt><dd className="mt-2 text-sm">{product.visual.materials.join(" / ")}</dd></div>
              <div><dt className="meta">형태</dt><dd className="mt-2 text-sm">{product.visual.form}</dd></div>
              <div><dt className="meta">색상</dt><dd className="mt-2 text-sm">{product.visual.primaryColor} / {product.visual.secondaryColor}</dd></div>
              <div><dt className="meta">표면 마감</dt><dd className="mt-2 text-sm">{product.visual.finish.join(" / ")}</dd></div>
            </dl>
          </section>
          <section className="panel p-6 sm:p-8">
            <p className="eyebrow">Identity Locks · 정체성 고정 규칙</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {availableLocks.map((lock) => {
                const active = locks.has(lock);
                return <button key={lock} onClick={() => toggle(lock)} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-4 text-left text-sm hover:bg-neutral-50"><span>{LOCK_LABELS[lock]}</span><span className={active ? "grid size-5 place-items-center rounded-full bg-neutral-950 text-white" : "size-5 rounded-full border border-neutral-300"}>{active ? <Check size={12}/> : null}</span></button>;
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-neutral-500">보이지 않았던 면은 새롭게 탐색할 수 있지만, 잠근 특징은 창작 제안이 아니라 반드시 유지해야 하는 제품 정체성으로 취급합니다.</p>
            <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-6">
              <p className="text-xs text-neutral-500">정체성 고정 규칙 {lockList.length}개 적용 중</p>
              <Button className="gap-2" onClick={() => router.push(`/projects/${projectId}/brief`)}>브리프로 이동 <ArrowRight size={15}/></Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


const LOCK_LABELS: Record<ProductIntelligence["identityLocks"][number], string> = {
  silhouette: "실루엣",
  cap: "캡 형태",
  label: "라벨",
  logo: "로고",
  product_color: "제품 색상",
  material_finish: "소재/마감",
};

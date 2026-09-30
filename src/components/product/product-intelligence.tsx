"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProductIntelligence } from "@/domain/product/schema";
import { getLocalProject, updateLocalProject } from "@/lib/project-store";
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
    const local = getLocalProject(projectId);

    queueMicrotask(() => {
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
    setLocks((current) => {
      const next = new Set(current);
      if (next.has(lock)) next.delete(lock); else next.add(lock);
      const nextProduct = { ...product, identityLocks: Array.from(next) };
      setProduct(nextProduct);
      updateLocalProject(projectId, { product: nextProduct });
      return next;
    });
  }

  if (!loaded) return <div className="page-wrap"><p className="text-sm text-neutral-500">Loading product intelligence…</p></div>;

  return (
    <div className="page-wrap">
      <div className="section-heading">
        <div><p className="eyebrow">Product intelligence</p><h1>What must remain recognizable.</h1></div>
        <p>Correct the analysis once. Every downstream concept inherits these visual constraints.</p>
      </div>
      <div className="mt-10 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="product-stage" aria-label="Uploaded product image">
          {imageUrl ? <Image src={imageUrl} alt="Uploaded product" fill unoptimized className="object-contain p-10" /> : <div className="bottle"><div className="bottle-cap" /><div className="bottle-label">PRODUCT<br/><span>IDENTITY</span></div></div>}
        </div>
        <div className="grid gap-6">
          <section className="panel p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">{[product.category, ...product.perception].map((item) => <span className="tag" key={item}>{item}</span>)}</div>
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600">{product.summary}</p>
            <dl className="mt-8 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
              <div><dt className="meta">Primary material</dt><dd className="mt-2 text-sm">{product.visual.materials.join(" / ")}</dd></div>
              <div><dt className="meta">Form</dt><dd className="mt-2 text-sm">{product.visual.form}</dd></div>
              <div><dt className="meta">Palette</dt><dd className="mt-2 text-sm">{product.visual.primaryColor} / {product.visual.secondaryColor}</dd></div>
              <div><dt className="meta">Finish</dt><dd className="mt-2 text-sm">{product.visual.finish.join(" / ")}</dd></div>
            </dl>
          </section>
          <section className="panel p-6 sm:p-8">
            <p className="eyebrow">Identity locks</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {availableLocks.map((lock) => {
                const active = locks.has(lock);
                return <button key={lock} onClick={() => toggle(lock)} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-4 text-left text-sm hover:bg-neutral-50"><span className="capitalize">{lock.replace(/_/g, " ")}</span><span className={active ? "grid size-5 place-items-center rounded-full bg-neutral-950 text-white" : "size-5 rounded-full border border-neutral-300"}>{active ? <Check size={12}/> : null}</span></button>;
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-neutral-500">Generated views may explore unseen surfaces, but locked visible features are treated as identity constraints rather than creative suggestions.</p>
            <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-6">
              <p className="text-xs text-neutral-500">{lockList.length} identity constraints active</p>
              <Button className="gap-2" onClick={() => router.push(`/projects/${projectId}/brief`)}>Continue to brief <ArrowRight size={15}/></Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

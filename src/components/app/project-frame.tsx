"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { demoProject } from "@/lib/fixtures/demo";
import { getRuntimeProject } from "@/lib/runtime-project-store";
import { cx } from "@/lib/utils";

const items = [
  ["제품", "product"],
  ["브리프", "brief"],
  ["캠페인", "campaign"],
  ["콘셉트", "concepts"],
  ["Asset Bible", "assets"],
  ["프로덕션", "production"],
] as const;

export function ProjectFrame({ projectId, active, children }: { projectId: string; active: string; children: React.ReactNode }) {
  const [name, setName] = useState(() => projectId === "demo-aurelia" ? { brandName: demoProject.brandName, productName: demoProject.productName } : { brandName: "캠페인", productName: "프로젝트 불러오는 중…" });

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      void getRuntimeProject(projectId).then((project) => {
        if (!cancelled && project) setName({ brandName: project.brandName, productName: project.productName });
      });
    };
    update();
    window.addEventListener("commercial-director:project-updated", update);
    return () => {
      cancelled = true;
      window.removeEventListener("commercial-director:project-updated", update);
    };
  }, [projectId]);

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] grid-cols-1 lg:grid-cols-[228px_minmax(0,1fr)]">
      <aside className="border-b border-[var(--line)] px-5 py-6 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">현재 프로젝트</p>
        <h2 className="mt-3 text-sm font-semibold">{name.brandName}</h2>
        <p className="mt-1 text-xs text-neutral-500">{name.productName}</p>
        <nav className="mt-7 flex gap-1 overflow-x-auto lg:flex-col">
          {items.map(([label, slug]) => (
            <Link
              key={slug}
              href={`/projects/${projectId}/${slug}`}
              className={cx(
                "rounded-md px-3 py-2 text-sm transition motion-reduce:transition-none",
                active === slug ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-white hover:text-neutral-950",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 hidden border-t border-[var(--line)] pt-5 text-xs leading-5 text-neutral-500 lg:block">
          <p>Asset Bible을 기준으로 Treatment, Scene, Shot, provider용 Prompt 패키지를 구성합니다.</p>
          <Link href="/manual" className="mt-3 inline-block font-medium text-neutral-700 underline underline-offset-4">사용자 매뉴얼 보기</Link>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

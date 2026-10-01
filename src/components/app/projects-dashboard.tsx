"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { demoProject } from "@/lib/fixtures/demo";
import { listRuntimeProjects } from "@/lib/runtime-project-store";
import type { LocalProjectSnapshot } from "@/domain/project/schema";

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<LocalProjectSnapshot[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listRuntimeProjects().then((items) => {
      if (!cancelled) setProjects(items);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex items-end justify-between border-b border-[var(--line)] pb-7">
        <div><p className="eyebrow">워크스페이스</p><h1 className="mt-3 text-4xl font-medium tracking-[-0.04em]">프로젝트</h1></div>
        <Link href="/projects/new" className="hidden h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3.5 text-sm sm:inline-flex"><Plus size={15}/> 새 캠페인</Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        {projects.map((project) => <ProjectRow key={project.id} id={project.id} brandName={project.brandName} productName={project.productName} status={project.concepts ? "20개 콘셉트 생성됨" : project.bible ? "Campaign Bible 준비됨" : project.brief ? "브리프 완료" : "제품 분석 완료"} updatedAt={relativeTime(project.updatedAt)} />)}
        <ProjectRow id={demoProject.id} brandName={demoProject.brandName} productName={demoProject.productName} status={demoProject.status} updatedAt={demoProject.updatedAt} />
      </div>
    </div>
  );
}

function ProjectRow({ id, brandName, productName, status, updatedAt }: { id: string; brandName: string; productName: string; status: string; updatedAt: string }) {
  return <Link href={`/projects/${id}/campaign`} className="grid gap-4 border-b border-[var(--line)] p-5 transition last:border-b-0 hover:bg-neutral-50 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:p-6">
    <div><p className="text-sm font-semibold">{brandName}</p><p className="mt-1 text-xs text-neutral-500">{productName}</p></div>
    <div><p className="meta">상태</p><p className="mt-1.5 text-sm">{status === "20 concepts" ? "20개 콘셉트 생성됨" : status}</p></div>
    <div><p className="meta">최근 수정</p><p className="mt-1.5 text-sm">{updatedAt}</p></div>
    <ArrowUpRight size={17}/>
  </Link>;
}

function relativeTime(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "방금 전";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

import Link from "next/link";
import { Aperture, Plus } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-[var(--line)] bg-[color:var(--canvas)/0.94] backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-5 lg:px-8">
          <Link href="/projects" className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.01em]">
            <span className="grid size-7 place-items-center rounded-md border border-neutral-300 bg-white"><Aperture size={15} /></span>
            Commercial Director
          </Link>
          <Link href="/projects/new" className="inline-flex h-9 items-center gap-2 rounded-md bg-neutral-950 px-3.5 text-sm font-medium text-white hover:bg-neutral-800">
            <Plus size={15} /> New campaign
          </Link>
        </div>
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}

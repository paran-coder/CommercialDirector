import { ProjectFrame } from "@/components/app/project-frame";
import { CreativeBriefView } from "@/components/brief/creative-brief";
import { demoBrief } from "@/lib/fixtures/demo";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectFrame projectId={projectId} active="brief"><CreativeBriefView projectId={projectId} initial={demoBrief}/></ProjectFrame>;
}

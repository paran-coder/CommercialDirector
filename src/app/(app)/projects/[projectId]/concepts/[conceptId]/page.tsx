import { ProjectFrame } from "@/components/app/project-frame";
import { ConceptDetail } from "@/components/concepts/concept-detail";

export default async function Page({ params }: { params: Promise<{ projectId: string; conceptId: string }> }) {
  const { projectId, conceptId } = await params;
  return <ProjectFrame projectId={projectId} active="concepts"><ConceptDetail projectId={projectId} conceptId={conceptId}/></ProjectFrame>;
}

import { ProjectFrame } from "@/components/app/project-frame";
import { ConceptGrid } from "@/components/concepts/concept-grid";
import { demoConcepts, demoTerritories } from "@/lib/fixtures/demo";
export default async function Page({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <ProjectFrame projectId={projectId} active="concepts"><ConceptGrid projectId={projectId} concepts={demoConcepts} territories={demoTerritories}/></ProjectFrame>; }

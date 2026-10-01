import { ProjectFrame } from "@/components/app/project-frame";
import { ProductionPlanView } from "@/components/production/production-plan";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <ProjectFrame projectId={projectId} active="production">
      <ProductionPlanView projectId={projectId}/>
    </ProjectFrame>
  );
}

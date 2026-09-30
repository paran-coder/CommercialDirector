import { ProjectFrame } from "@/components/app/project-frame";
import { CampaignBibleView } from "@/components/campaign/campaign-bible";
import { demoBible, demoTerritories } from "@/lib/fixtures/demo";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectFrame projectId={projectId} active="campaign"><CampaignBibleView projectId={projectId} fallback={demoBible} fallbackTerritories={demoTerritories}/></ProjectFrame>;
}

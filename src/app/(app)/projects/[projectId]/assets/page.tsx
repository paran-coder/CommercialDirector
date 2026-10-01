import { ProjectFrame } from "@/components/app/project-frame";
import { AssetBibleView } from "@/components/assets/asset-bible";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <ProjectFrame projectId={projectId} active="assets">
      <AssetBibleView projectId={projectId}/>
    </ProjectFrame>
  );
}

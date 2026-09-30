import { ProjectFrame } from "@/components/app/project-frame";
import { ProductIntelligenceView } from "@/components/product/product-intelligence";
import { demoProduct } from "@/lib/fixtures/demo";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectFrame projectId={projectId} active="product"><ProductIntelligenceView projectId={projectId} fallback={demoProduct}/></ProjectFrame>;
}

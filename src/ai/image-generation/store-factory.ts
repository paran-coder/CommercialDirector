import type { ImageArtifactStore } from "@/ai/image-generation/artifact-store";
import { FixtureImageArtifactStore } from "@/ai/image-generation/fixture-artifact-store";
import { VercelBlobImageArtifactStore } from "@/ai/image-generation/vercel-blob-artifact-store";

export function getImageArtifactStore(): ImageArtifactStore {
  const store = process.env.IMAGE_ARTIFACT_STORE || "fixture";

  if (store === "fixture") {
    return new FixtureImageArtifactStore();
  }

  if (store === "vercel_blob") {
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN or VERCEL_OIDC_TOKEN is required when IMAGE_ARTIFACT_STORE=vercel_blob.",
      );
    }
    return new VercelBlobImageArtifactStore();
  }

  throw new Error(`Unsupported IMAGE_ARTIFACT_STORE: ${store}`);
}

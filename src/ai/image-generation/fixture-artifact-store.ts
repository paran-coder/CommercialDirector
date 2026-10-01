import { createHash } from "node:crypto";
import { renderArtifactSchema } from "@/domain/reference-assets/schema";
import type { ImageArtifactStore, PersistRenderArtifactInput } from "@/ai/image-generation/artifact-store";

export class FixtureImageArtifactStore implements ImageArtifactStore {
  async persist(input: PersistRenderArtifactInput) {
    const bytes = Buffer.from(input.result.imageBase64, "base64");
    const sha256 = createHash("sha256").update(bytes).digest("hex");

    return renderArtifactSchema.parse({
      ref: [
        "fixture://reference-assets",
        encodeURIComponent(input.projectId),
        `asset-bible-r${input.sourceAssetBibleRevision}`,
        encodeURIComponent(input.target.stableKey),
        encodeURIComponent(input.result.requestId),
      ].join("/"),
      mimeType: input.result.mimeType,
      width: input.result.width,
      height: input.result.height,
      sha256,
    });
  }
}

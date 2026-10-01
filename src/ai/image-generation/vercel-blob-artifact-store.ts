import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import { renderArtifactSchema } from "@/domain/reference-assets/schema";
import type { ImageArtifactStore, PersistRenderArtifactInput } from "@/ai/image-generation/artifact-store";

function extensionForMimeType(mimeType: PersistRenderArtifactInput["result"]["mimeType"]) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
  }
}

function safePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export class VercelBlobImageArtifactStore implements ImageArtifactStore {
  async persist(input: PersistRenderArtifactInput) {
    const bytes = Buffer.from(input.result.imageBase64, "base64");
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const extension = extensionForMimeType(input.result.mimeType);
    const pathname = [
      "commercial-director",
      safePathSegment(input.projectId),
      `asset-bible-r${input.sourceAssetBibleRevision}`,
      safePathSegment(input.target.stableKey),
      `${safePathSegment(input.result.requestId)}.${extension}`,
    ].join("/");

    const blob = await put(pathname, bytes, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: input.result.mimeType,
    });

    return renderArtifactSchema.parse({
      ref: `vercel-blob://${blob.pathname}`,
      mimeType: input.result.mimeType,
      width: input.result.width,
      height: input.result.height,
      sha256,
    });
  }
}

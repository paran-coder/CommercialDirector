import type { AssetBible } from "@/domain/assets/schema";
import type {
  CompiledPrompt,
  ProductionDuration,
  PromptIR,
} from "@/domain/production/schema";
import {
  compiledPromptSchema,
  promptIRSchema,
} from "@/domain/production/schema";

type PromptIRInput = {
  conceptKey: string;
  duration: ProductionDuration;
  shot: {
    stableKey: string;
    sceneKey: string;
    start: number;
    end: number;
    framing: string;
    cameraMovement: string;
    lensIntent: string;
    subjectAction: string;
    productVisibility: string;
    lightingIntent: string;
    assetRefs: string[];
    continuityNotes: string[];
  };
  scenes: Array<{
    stableKey: string;
    title: string;
    action: string;
    assetRefs: string[];
    continuityIn: string[];
    continuityOut: string[];
  }>;
  assetBible: AssetBible;
};

export function buildPromptIR(input: PromptIRInput): PromptIR {
  const scene = input.scenes.find((item) => item.stableKey === input.shot.sceneKey);
  if (!scene) throw new Error(`Scene not found for ${input.shot.stableKey}.`);

  const locationDescriptions = input.assetBible.locations
    .filter((item) => input.shot.assetRefs.includes(item.stableKey))
    .map((item) => `${item.label}: ${item.spatialDescription}`);

  const wardrobe = input.assetBible.wardrobe
    .filter((item) => input.shot.assetRefs.includes(item.stableKey))
    .flatMap((item) => [item.silhouette, ...item.continuityLocks]);

  const props = input.assetBible.props
    .filter((item) => input.shot.assetRefs.includes(item.stableKey))
    .flatMap((item) => [`${item.label}: ${item.materialAndFinish}`, ...item.continuityLocks]);

  const heroReferenced = input.shot.assetRefs.includes(input.assetBible.hero.stableKey);
  const characterContinuity = heroReferenced
    ? [
        input.assetBible.hero.appearanceAndGrooming,
        input.assetBible.hero.performanceDirection,
        ...input.assetBible.hero.continuityLocks,
        ...wardrobe,
      ]
    : wardrobe;

  return promptIRSchema.parse({
    stableKey: `prompt-${input.shot.stableKey}`,
    conceptKey: input.conceptKey,
    duration: input.duration,
    sceneKey: input.shot.sceneKey,
    shotKey: input.shot.stableKey,
    assetRefs: input.shot.assetRefs,
    subject: input.shot.productVisibility,
    action: input.shot.subjectAction,
    environment: locationDescriptions.length ? locationDescriptions.join(" | ") : scene.title,
    productContinuity: input.assetBible.productSheet.continuityLocks,
    characterContinuity,
    propContinuity: props,
    framing: input.shot.framing,
    lensAndCamera: `${input.shot.lensIntent}; ${input.shot.cameraMovement}`,
    lighting: input.shot.lightingIntent,
    motion: input.shot.cameraMovement,
    temporalBehavior: `${input.shot.start.toFixed(2)}s–${input.shot.end.toFixed(2)}s; preserve the described action continuously across the shot.`,
    negativeConstraints: [
      ...input.assetBible.productSheet.avoid,
      "Do not introduce unreferenced wardrobe, props, locations, packaging, logos, or product geometry.",
    ],
    continuityCarry: [
      ...scene.continuityIn,
      ...input.shot.continuityNotes,
      ...scene.continuityOut,
    ],
  });
}

export function compilePromptSet(promptIR: PromptIR): CompiledPrompt[] {
  return [
    compileGeneric(promptIR),
    compileSeedance(promptIR),
    compileKling(promptIR),
    compileVeo(promptIR),
  ];
}

function compileGeneric(ir: PromptIR) {
  return compile(ir, "generic", [
    "CINEMATIC SHOT",
    field("Subject", ir.subject),
    field("Action", ir.action),
    field("Environment", ir.environment),
    field("Framing", ir.framing),
    field("Lens / camera", ir.lensAndCamera),
    field("Lighting", ir.lighting),
    field("Motion", ir.motion),
    field("Temporal behavior", ir.temporalBehavior),
    field("Product continuity", ir.productContinuity.join("; ")),
    optionalField("Character continuity", ir.characterContinuity),
    optionalField("Prop continuity", ir.propContinuity),
    field("Continuity carry", ir.continuityCarry.join("; ")),
  ]);
}

function compileSeedance(ir: PromptIR) {
  return compile(ir, "seedance", [
    "SHOT INTENT",
    `${ir.framing}. ${ir.subject}. ${ir.action}`,
    field("World", ir.environment),
    field("Camera path", ir.lensAndCamera),
    field("Motion continuity", `${ir.motion}; ${ir.temporalBehavior}`),
    field("Light", ir.lighting),
    field("Locked product identity", ir.productContinuity.join("; ")),
    optionalField("Locked character/styling", ir.characterContinuity),
    optionalField("Locked props", ir.propContinuity),
    field("Carry from adjacent shots", ir.continuityCarry.join("; ")),
  ]);
}

function compileKling(ir: PromptIR) {
  return compile(ir, "kling", [
    "VISUAL",
    `${ir.subject} — ${ir.action}`,
    field("Setting", ir.environment),
    field("Composition", ir.framing),
    field("Camera", ir.lensAndCamera),
    field("Lighting", ir.lighting),
    field("Movement", `${ir.motion}; ${ir.temporalBehavior}`),
    field("Continuity locks", ir.productContinuity.join("; ")),
    optionalField("Character locks", ir.characterContinuity),
    optionalField("Prop locks", ir.propContinuity),
    field("Continuity", ir.continuityCarry.join("; ")),
  ]);
}

function compileVeo(ir: PromptIR) {
  return compile(ir, "veo", [
    "SCENE",
    field("Subject and action", `${ir.subject}. ${ir.action}`),
    field("Environment", ir.environment),
    field("Cinematography", `${ir.framing}; ${ir.lensAndCamera}`),
    field("Lighting", ir.lighting),
    field("Motion / timing", `${ir.motion}; ${ir.temporalBehavior}`),
    field("Product identity", ir.productContinuity.join("; ")),
    optionalField("Character / wardrobe", ir.characterContinuity),
    optionalField("Props", ir.propContinuity),
    field("Continuity state", ir.continuityCarry.join("; ")),
  ]);
}

function compile(ir: PromptIR, provider: CompiledPrompt["provider"], sections: Array<string | null>) {
  return compiledPromptSchema.parse({
    provider,
    promptIRKey: ir.stableKey,
    prompt: sections.filter((item): item is string => Boolean(item)).join("\n"),
    negativePrompt: ir.negativeConstraints.join("; "),
    parameters: {
      durationSeconds: Number((ir.end ?? 0)) || ir.duration,
    },
  });
}

function field(label: string, value: string) {
  return `${label}: ${value}`;
}

function optionalField(label: string, values: string[]) {
  return values.length ? `${label}: ${values.join("; ")}` : null;
}

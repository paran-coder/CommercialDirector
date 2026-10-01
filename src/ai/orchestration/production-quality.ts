import type { AssetBible } from "@/domain/assets/schema";
import type {
  ProductionDuration,
  ProductionPlan,
  SceneDraft,
  ShotDraft,
  TreatmentDraft,
} from "@/domain/production/schema";
import { productionPlanSchema } from "@/domain/production/schema";
import { buildPromptIR, compilePromptSet } from "@/ai/orchestration/prompt-compiler";

export type ProductionStructuralIssue = {
  conceptKey: string;
  duration: ProductionDuration;
  level: "treatment" | "scenes" | "shots" | "prompts";
  reason:
    | "duration_set"
    | "timing"
    | "asset_ref"
    | "hero_ref"
    | "scene_ref"
    | "missing_shots"
    | "duplicate_key"
    | "prompt_identity"
    | "compiler_set";
  detail: string;
};

export type ConceptProductionDraft = {
  conceptKey: string;
  conceptTitle: string;
  treatments: TreatmentDraft[];
  sceneVariants: Array<{ duration: ProductionDuration; scenes: SceneDraft[] }>;
  shotVariants: Array<{ duration: ProductionDuration; shots: ShotDraft[] }>;
};

export function normalizeProductionPlan(
  drafts: ConceptProductionDraft[],
  assetBible: AssetBible,
  continuitySummary: ProductionPlan["continuitySummary"],
): ProductionPlan {
  const concepts = drafts.map((draft) => {
    const variants = ([15, 30, 45] as const).map((duration) => {
      const treatmentDraft = findDuration(draft.treatments, duration, "treatment", draft.conceptKey);
      const sceneDrafts = findDuration(draft.sceneVariants, duration, "scenes", draft.conceptKey).scenes;
      const shotDrafts = findDuration(draft.shotVariants, duration, "shots", draft.conceptKey).shots;

      const sceneKeyBySlot = new Map<number, string>();
      const scenes = [...sceneDrafts]
        .sort((a, b) => a.slot - b.slot)
        .map((scene, index) => {
          const stableKey = sceneKey(draft.conceptKey, duration, index + 1);
          sceneKeyBySlot.set(scene.slot, stableKey);
          return {
            ...scene,
            stableKey,
            slot: undefined,
          };
        })
        .map(({ slot: _slot, ...scene }) => scene);

      const sceneShotCounters = new Map<number, number>();
      let cursor = 0;
      const shots = [...shotDrafts]
        .sort((a, b) => a.sceneSlot - b.sceneSlot || a.slot - b.slot)
        .map((shot) => {
          const sceneKeyValue = sceneKeyBySlot.get(shot.sceneSlot);
          if (!sceneKeyValue) {
            throw new Error(`Shot references missing scene slot ${shot.sceneSlot} for ${draft.conceptKey} ${duration}s.`);
          }
          const withinScene = (sceneShotCounters.get(shot.sceneSlot) ?? 0) + 1;
          sceneShotCounters.set(shot.sceneSlot, withinScene);
          const stableKey = shotKey(draft.conceptKey, duration, shot.sceneSlot, withinScene);
          const start = cursor;
          const end = cursor + shot.duration;
          cursor = end;
          return {
            duration: shot.duration,
            framing: shot.framing,
            cameraMovement: shot.cameraMovement,
            lensIntent: shot.lensIntent,
            subjectAction: shot.subjectAction,
            productVisibility: shot.productVisibility,
            lightingIntent: shot.lightingIntent,
            assetRefs: [...new Set(shot.assetRefs)],
            continuityNotes: shot.continuityNotes,
            transitionIntent: shot.transitionIntent,
            stableKey,
            sceneKey: sceneKeyValue,
            start,
            end,
          };
        });

      const promptIR = shots.map((shot) => buildPromptIR({
        conceptKey: draft.conceptKey,
        duration,
        shot,
        scenes,
        assetBible,
      }));
      const compiledPrompts = promptIR.flatMap((prompt) => compilePromptSet(prompt));

      return {
        duration,
        treatment: {
          ...treatmentDraft,
          stableKey: treatmentKey(draft.conceptKey, duration),
        },
        scenes,
        shots,
        promptIR,
        compiledPrompts,
      };
    });

    return {
      conceptKey: draft.conceptKey,
      conceptTitle: draft.conceptTitle,
      variants,
    };
  });

  return productionPlanSchema.parse({ concepts, continuitySummary });
}

export function validateProductionPlan(plan: ProductionPlan, assetBible: AssetBible) {
  const issues: ProductionStructuralIssue[] = [];
  const allAssetKeys = new Set([
    assetBible.productSheet.stableKey,
    assetBible.hero.stableKey,
    ...assetBible.wardrobe.map((item) => item.stableKey),
    ...assetBible.locations.map((item) => item.stableKey),
    ...assetBible.props.map((item) => item.stableKey),
  ]);
  const canonicalKeys: string[] = [];

  for (const concept of plan.concepts) {
    const durations = concept.variants.map((variant) => variant.duration).sort((a, b) => a - b);
    if (durations.join(",") !== "15,30,45") {
      issues.push(issue(concept.conceptKey, 15, "treatment", "duration_set", "Production variants must contain exactly 15s, 30s, and 45s."));
    }

    for (const variant of concept.variants) {
      canonicalKeys.push(
        variant.treatment.stableKey,
        ...variant.scenes.map((scene) => scene.stableKey),
        ...variant.shots.map((shot) => shot.stableKey),
        ...variant.promptIR.map((prompt) => prompt.stableKey),
      );

      validateTreatment(concept.conceptKey, variant.duration, variant.treatment, issues);

      const sceneKeys = new Set(variant.scenes.map((scene) => scene.stableKey));
      const shotsByScene = new Map<string, number>();
      let previousEnd = 0;

      for (const scene of variant.scenes) {
        validateAssetRefs(concept.conceptKey, variant.duration, "scenes", scene.assetRefs, allAssetKeys, assetBible, issues);
      }

      for (const shot of variant.shots) {
        shotsByScene.set(shot.sceneKey, (shotsByScene.get(shot.sceneKey) ?? 0) + 1);
        if (!sceneKeys.has(shot.sceneKey)) {
          issues.push(issue(concept.conceptKey, variant.duration, "shots", "scene_ref", `${shot.stableKey} references unknown scene ${shot.sceneKey}.`));
        }
        if (Math.abs(shot.start - previousEnd) > 0.001 || shot.end <= shot.start || Math.abs((shot.end - shot.start) - shot.duration) > 0.001) {
          issues.push(issue(concept.conceptKey, variant.duration, "shots", "timing", `${shot.stableKey} has non-monotonic or inconsistent timing.`));
        }
        previousEnd = shot.end;
        validateAssetRefs(concept.conceptKey, variant.duration, "shots", shot.assetRefs, allAssetKeys, assetBible, issues);
      }

      for (const scene of variant.scenes) {
        if (!shotsByScene.get(scene.stableKey)) {
          issues.push(issue(concept.conceptKey, variant.duration, "shots", "missing_shots", `${scene.stableKey} has no shots.`));
        }
      }

      if (Math.abs(previousEnd - variant.duration) > 0.75) {
        issues.push(issue(concept.conceptKey, variant.duration, "shots", "timing", `Shot durations total ${previousEnd.toFixed(2)}s instead of approximately ${variant.duration}s.`));
      }

      const promptByShot = new Map(variant.promptIR.map((prompt) => [prompt.shotKey, prompt]));
      for (const shot of variant.shots) {
        const prompt = promptByShot.get(shot.stableKey);
        if (!prompt || prompt.sceneKey !== shot.sceneKey || !sameSet(prompt.assetRefs, shot.assetRefs)) {
          issues.push(issue(concept.conceptKey, variant.duration, "prompts", "prompt_identity", `Prompt IR does not preserve source identity for ${shot.stableKey}.`));
        }
        const compiled = variant.compiledPrompts.filter((item) => item.promptIRKey === prompt?.stableKey);
        const providers = compiled.map((item) => item.provider).sort().join(",");
        if (providers !== "generic,kling,seedance,veo") {
          issues.push(issue(concept.conceptKey, variant.duration, "prompts", "compiler_set", `${shot.stableKey} must compile exactly one prompt for each provider.`));
        }
      }
    }
  }

  if (new Set(canonicalKeys).size !== canonicalKeys.length) {
    issues.push(issue(plan.concepts[0]?.conceptKey ?? "unknown", 15, "shots", "duplicate_key", "Canonical production keys must be unique across the Production Plan."));
  }

  return { valid: issues.length === 0, issues };
}

function validateTreatment(
  conceptKey: string,
  duration: ProductionDuration,
  treatment: ProductionPlan["concepts"][number]["variants"][number]["treatment"],
  issues: ProductionStructuralIssue[],
) {
  const beats = [...treatment.beats].sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const beat of beats) {
    if (beat.end <= beat.start || beat.start < cursor - 0.001 || beat.end > duration + 0.001) {
      issues.push(issue(conceptKey, duration, "treatment", "timing", `${treatment.stableKey} contains invalid beat timing.`));
      return;
    }
    cursor = beat.end;
  }
}

function validateAssetRefs(
  conceptKey: string,
  duration: ProductionDuration,
  level: "scenes" | "shots",
  refs: string[],
  allowed: Set<string>,
  assetBible: AssetBible,
  issues: ProductionStructuralIssue[],
) {
  for (const ref of refs) {
    if (!allowed.has(ref)) {
      issues.push(issue(conceptKey, duration, level, "asset_ref", `Unknown Asset Bible reference ${ref}.`));
    }
    if (assetBible.hero.applicability === "none" && (ref === "hero-primary" || ref.startsWith("wardrobe-"))) {
      issues.push(issue(conceptKey, duration, level, "hero_ref", `Human continuity reference ${ref} is not allowed when Hero applicability is none.`));
    }
  }
}

function findDuration<T extends { duration: ProductionDuration }>(
  values: T[],
  duration: ProductionDuration,
  label: string,
  conceptKey: string,
) {
  const matches = values.filter((value) => value.duration === duration);
  if (matches.length !== 1) throw new Error(`${conceptKey} must contain exactly one ${duration}s ${label} variant.`);
  return matches[0];
}

function treatmentKey(conceptKey: string, duration: ProductionDuration) {
  return `treatment-${conceptKey}-${duration}`;
}

function sceneKey(conceptKey: string, duration: ProductionDuration, index: number) {
  return `scene-${conceptKey}-${duration}-${String(index).padStart(2, "0")}`;
}

function shotKey(conceptKey: string, duration: ProductionDuration, sceneSlot: number, index: number) {
  return `shot-${conceptKey}-${duration}-${String(sceneSlot).padStart(2, "0")}-${String(index).padStart(2, "0")}`;
}

function issue(
  conceptKey: string,
  duration: ProductionDuration,
  level: ProductionStructuralIssue["level"],
  reason: ProductionStructuralIssue["reason"],
  detail: string,
): ProductionStructuralIssue {
  return { conceptKey, duration, level, reason, detail };
}

function sameSet(left: string[], right: string[]) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

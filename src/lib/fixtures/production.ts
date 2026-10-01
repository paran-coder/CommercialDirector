import type { AssetBible } from "@/domain/assets/schema";
import type { Concept } from "@/domain/concept/schema";
import type {
  ProductionReview,
  SceneDraft,
  ShotDraft,
  TreatmentDraft,
} from "@/domain/production/schema";

export function createProductionFixture(input: {
  concept: Concept;
  assetBible: AssetBible;
}) {
  const treatments = [
    createTreatment(input.concept, 15),
    createTreatment(input.concept, 30),
    createTreatment(input.concept, 45),
  ] satisfies [
    TreatmentDraft & { duration: 15 },
    TreatmentDraft & { duration: 30 },
    TreatmentDraft & { duration: 45 },
  ];
  const sceneVariants = [
    { duration: 15 as const, scenes: createScenes(input.concept, input.assetBible, 15) },
    { duration: 30 as const, scenes: createScenes(input.concept, input.assetBible, 30) },
    { duration: 45 as const, scenes: createScenes(input.concept, input.assetBible, 45) },
  ];
  const shotVariants = [
    { duration: 15 as const, shots: createShots(sceneVariants[0].scenes) },
    { duration: 30 as const, shots: createShots(sceneVariants[1].scenes) },
    { duration: 45 as const, shots: createShots(sceneVariants[2].scenes) },
  ];

  const review: ProductionReview = {
    continuitySummary: {
      rules: [
        "Product identity locks remain authoritative in every duration and shot.",
        "The core concept mechanism must remain recognizable across 15s, 30s, and 45s.",
        "Scene and shot variation may change pacing but must not introduce unapproved campaign assets.",
      ],
      risks: [],
    },
    issues: [],
  };

  return { treatments, sceneVariants, shotVariants, review };
}

function createTreatment<D extends 15 | 30 | 45>(concept: Concept, duration: D): TreatmentDraft & { duration: D } {
  const a = round(duration * 0.28);
  const b = round(duration * 0.68);
  return {
    duration,
    logline: `${concept.hook} The product drives the payoff while preserving the same core mechanism at ${duration} seconds.`,
    pacing: duration === 15
      ? "Immediate visual hook, compressed escalation, decisive product payoff."
      : duration === 30
        ? "Clear setup, controlled escalation, product-led payoff with one reaction beat."
        : "Atmospheric setup, fuller escalation, additional product detail, and a held payoff.",
    beats: [
      { start: 0, end: a, beat: `Establish the hook: ${concept.hook}`, productRole: concept.productRole },
      { start: a, end: b, beat: `Develop the mechanism: ${concept.idea.slice(0, 180)}`, productRole: concept.productRole },
      { start: b, end: duration, beat: `Resolve on the product and audience takeaway: ${concept.audienceTakeaway}`, productRole: concept.productRole },
    ],
  };
}

function createScenes(concept: Concept, assetBible: AssetBible, duration: 15 | 30 | 45): SceneDraft[] {
  const refs = assetRefsForConcept(concept, assetBible);
  const first = round(duration * 0.3);
  const second = round(duration * 0.4);
  const third = round(duration - first - second);
  return [
    {
      slot: 1,
      title: "Hook",
      duration: first,
      storyPurpose: "Establish the concept's visual rule and immediate audience curiosity.",
      action: concept.hook,
      productRole: concept.productRole,
      assetRefs: refs,
      continuityIn: ["Begin from the approved campaign world and Asset Bible state."],
      continuityOut: ["Carry the established product orientation and environmental light logic into escalation."],
      soundIntent: "A restrained opening cue that makes the visual hook feel intentional.",
    },
    {
      slot: 2,
      title: "Mechanism",
      duration: second,
      storyPurpose: "Demonstrate the concept mechanism with the product causally involved.",
      action: concept.idea,
      productRole: concept.productRole,
      assetRefs: refs,
      continuityIn: ["Preserve product geometry, hero state, wardrobe, and spatial logic from the hook."],
      continuityOut: ["End with a motivated visual state that can resolve cleanly into the payoff."],
      soundIntent: "Build texture and rhythm without overpowering product or performance cues.",
    },
    {
      slot: 3,
      title: "Payoff",
      duration: third,
      storyPurpose: "Land the audience takeaway and finish with a controlled product-led resolution.",
      action: concept.audienceTakeaway,
      productRole: concept.productRole,
      assetRefs: refs,
      continuityIn: ["Retain all established product and campaign continuity from the mechanism."],
      continuityOut: ["Finish on a stable final product identity suitable for downstream packshot logic."],
      soundIntent: "Resolve the sonic idea with a concise branded-feeling endpoint.",
    },
  ];
}

function createShots(scenes: SceneDraft[]): ShotDraft[] {
  return scenes.flatMap((scene) => {
    const firstDuration = round(scene.duration * 0.45);
    const secondDuration = round(scene.duration - firstDuration);
    return [
      {
        sceneSlot: scene.slot,
        slot: 1,
        duration: firstDuration,
        framing: scene.slot === 1 ? "Controlled medium-wide establishing frame" : "Purposeful medium or close product-led frame",
        cameraMovement: "Slow, motivated push or lateral drift with no arbitrary handheld motion",
        lensIntent: "Natural cinematic perspective with controlled compression",
        subjectAction: `${scene.action} Begin the scene action clearly and preserve spatial orientation.`,
        productVisibility: "Product remains recognizable and materially consistent with product-main.",
        lightingIntent: "Preserve the Asset Bible lighting logic and product surface response.",
        assetRefs: scene.assetRefs,
        continuityNotes: [...scene.continuityIn, "Maintain screen direction and product orientation."],
        transitionIntent: "Cut on motivated action or visual change.",
      },
      {
        sceneSlot: scene.slot,
        slot: 2,
        duration: secondDuration,
        framing: scene.slot === 3 ? "Resolved product-forward close or hero frame" : "Tighter detail or reaction frame",
        cameraMovement: "Controlled continuation of the established camera language",
        lensIntent: "Slightly tighter optical emphasis without distorting product geometry",
        subjectAction: `${scene.action} Complete the scene action and hand off the intended continuity state.`,
        productVisibility: "Product identity and label/silhouette relationship remain intact.",
        lightingIntent: "Match the established direction, contrast, practicals, and material response.",
        assetRefs: scene.assetRefs,
        continuityNotes: [...scene.continuityOut, "Do not introduce new production elements."],
        transitionIntent: scene.slot === 3 ? "Hold the resolution cleanly." : "Transition into the next causal story beat.",
      },
    ];
  });
}

function assetRefsForConcept(concept: Concept, assetBible: AssetBible) {
  const refs: string[] = [assetBible.productSheet.stableKey];
  const location = assetBible.locations.find((item) => item.conceptRefs.includes(concept.id)) ?? assetBible.locations[0];
  if (location) refs.push(location.stableKey);

  if (concept.requirements.hero && assetBible.hero.applicability !== "none") {
    refs.push(assetBible.hero.stableKey);
    const wardrobe = assetBible.wardrobe.find((item) => item.conceptRefs.includes(concept.id)) ?? assetBible.wardrobe[0];
    if (wardrobe) refs.push(wardrobe.stableKey);
  }

  const prop = assetBible.props.find((item) => item.conceptRefs.includes(concept.id)) ?? assetBible.props[0];
  if (prop) refs.push(prop.stableKey);

  return [...new Set(refs)];
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

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
        "모든 길이와 Shot에서 Product Identity Locks를 최우선 기준으로 유지합니다.",
        "15초·30초·45초 모두에서 핵심 Concept 메커니즘을 알아볼 수 있어야 합니다.",
        "Scene과 Shot의 변화는 속도감을 바꿀 수 있지만 승인되지 않은 Asset을 추가하면 안 됩니다.",
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
    logline: `${concept.hook} ${duration}초 버전에서도 같은 핵심 메커니즘을 유지하고 제품이 payoff를 이끕니다.`,
    pacing: duration === 15
      ? "즉시 이해되는 시각 Hook, 압축된 전개, 분명한 제품 payoff."
      : duration === 30
        ? "명확한 setup, 절제된 고조, 한 번의 반응 beat를 포함한 제품 중심 payoff."
        : "분위기 있는 setup, 더 충분한 전개, 추가 제품 디테일, 여유 있게 유지되는 payoff.",
    beats: [
      { start: 0, end: a, beat: `Hook 설정: ${concept.hook}`, productRole: concept.productRole },
      { start: a, end: b, beat: `메커니즘 전개: ${concept.idea.slice(0, 180)}`, productRole: concept.productRole },
      { start: b, end: duration, beat: `제품과 타깃 인상으로 마무리: ${concept.audienceTakeaway}`, productRole: concept.productRole },
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
      title: "Hook · 도입",
      duration: first,
      storyPurpose: "Concept의 시각 규칙을 제시하고 즉각적인 호기심을 만듭니다.",
      action: compactText(concept.hook, 360),
      productRole: concept.productRole,
      assetRefs: refs,
      continuityIn: ["승인된 캠페인 세계관과 Asset Bible 상태에서 시작합니다."],
      continuityOut: ["확립된 제품 방향과 환경 조명 규칙을 다음 전개로 이어갑니다."],
      soundIntent: "시각 Hook이 의도적으로 느껴지게 하는 절제된 오프닝 사운드.",
    },
    {
      slot: 2,
      title: "Mechanism · 핵심 전개",
      duration: second,
      storyPurpose: "제품이 원인으로 작동하도록 Concept 메커니즘을 보여줍니다.",
      action: compactText(concept.idea, 360),
      productRole: concept.productRole,
      assetRefs: refs,
      continuityIn: ["Hook에서 설정한 제품 기하, Hero 상태, Wardrobe, 공간 논리를 유지합니다."],
      continuityOut: ["payoff로 자연스럽게 이어질 수 있는 시각 상태로 마무리합니다."],
      soundIntent: "제품과 퍼포먼스를 덮지 않으면서 질감과 리듬을 쌓습니다.",
    },
    {
      slot: 3,
      title: "Payoff · 마무리",
      duration: third,
      storyPurpose: "타깃이 받아갈 인상을 남기고 절제된 제품 중심 마무리로 끝냅니다.",
      action: compactText(concept.audienceTakeaway, 360),
      productRole: concept.productRole,
      assetRefs: refs,
      continuityIn: ["Mechanism에서 설정한 제품과 캠페인 continuity를 모두 유지합니다."],
      continuityOut: ["이후 packshot으로 연결하기 좋은 안정된 제품 정체성으로 끝냅니다."],
      soundIntent: "브랜드감 있는 간결한 사운드 엔드포인트로 마무리합니다.",
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
        framing: scene.slot === 1 ? "절제된 미디엄 와이드 establishing frame" : "제품 중심의 의도적인 미디엄 또는 클로즈 frame",
        cameraMovement: "불필요한 핸드헬드 없이 이유 있는 느린 push 또는 lateral drift",
        lensIntent: "절제된 압축감을 가진 자연스러운 시네마틱 원근",
        subjectAction: compactText(`${scene.action} Scene의 동작을 명확하게 시작하고 공간 방향을 유지합니다.`, 320),
        productVisibility: "제품은 product-main과 소재/형태가 일치하며 알아볼 수 있게 유지합니다.",
        lightingIntent: "Asset Bible의 조명 규칙과 제품 표면 반응을 유지합니다.",
        assetRefs: scene.assetRefs,
        continuityNotes: [...scene.continuityIn, "화면 진행 방향과 제품 방향을 유지합니다."],
        transitionIntent: "이유 있는 동작 또는 시각 변화에서 컷합니다.",
      },
      {
        sceneSlot: scene.slot,
        slot: 2,
        duration: secondDuration,
        framing: scene.slot === 3 ? "제품 중심으로 해결되는 close 또는 hero frame" : "더 타이트한 detail 또는 reaction frame",
        cameraMovement: "설정된 카메라 언어를 절제되게 이어갑니다.",
        lensIntent: "제품 기하를 왜곡하지 않는 범위에서 조금 더 타이트한 optical emphasis",
        subjectAction: compactText(`${scene.action} Scene 동작을 마무리하고 의도한 continuity 상태를 다음으로 넘깁니다.`, 320),
        productVisibility: "제품 정체성과 라벨/실루엣 관계를 그대로 유지합니다.",
        lightingIntent: "설정된 광원 방향, 대비, practical light, 소재 반응을 맞춥니다.",
        assetRefs: scene.assetRefs,
        continuityNotes: [...scene.continuityOut, "새로운 제작 요소를 추가하지 않습니다."],
        transitionIntent: scene.slot === 3 ? "마무리 상태를 깔끔하게 유지합니다." : "다음 인과적 story beat로 전환합니다.",
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


function compactText(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import type {
  AssetBibleReview,
  HeroDraft,
  LocationDraft,
  ProductSheetDraft,
  PropDraft,
  WardrobeDraft,
} from "@/domain/assets/schema";

export function createAssetBibleFixture(input: {
  product: ProductIntelligence;
  bible: CampaignBible;
  territories: Territory[];
  concepts: Concept[];
  shortlist: string[];
}) {
  const selected = input.concepts.filter((concept) => input.shortlist.includes(concept.id));
  const refs = selected.map((concept) => concept.id);
  const heroRefs = selected.filter((concept) => concept.requirements.hero).map((concept) => concept.id);
  const heroNeeded = heroRefs.length > 0;
  const locationRefs = new Map<string, string[]>();
  const propRefs = new Map<string, string[]>();

  for (const concept of selected) {
    for (const location of concept.requirements.locations) {
      locationRefs.set(location, [...new Set([...(locationRefs.get(location) ?? []), concept.id])]);
    }
    for (const prop of concept.requirements.props) {
      propRefs.set(prop, [...new Set([...(propRefs.get(prop) ?? []), concept.id])]);
    }
  }

  const productSheet: ProductSheetDraft = {
    identityStatement: input.product.summary,
    preserve: [
      "승인된 실루엣과 전체 비율을 유지합니다.",
      "보이는 캡, 라벨, 로고, 제품 색상 관계를 유지합니다.",
      "모든 setup에서 Identity Lock 특징을 알아볼 수 있게 유지합니다.",
    ],
    formRules: [
      `원본 형태(\${input.product.visual.form})의 기하와 비율을 유지합니다.`,
      "Shot 사이에서 패키지 형태를 늘리거나 눌러 변형하지 않습니다.",
    ],
    materialsAndSurface: [
      ...input.product.visual.materials.map((material) => `\${material} 소재가 실제처럼 빛에 반응하도록 표현합니다.`),
      ...input.product.visual.finish.map((finish) => `조명이 바뀌어도 \${finish} 마감 특성을 유지합니다.`),
    ].slice(0, 8),
    colorAndMarkingRules: [
      `주요 제품 색상은 \${input.product.visual.primaryColor}로 유지합니다.`,
      `보조 제품 색상은 \${input.product.visual.secondaryColor}로 유지합니다.`,
      "라벨/로고 위치와 대비는 원본 제품과 일치시킵니다.",
    ],
    scaleAndHandling: [
      "손과 테이블 기준으로 보틀 크기를 일관되게 유지합니다.",
      "제품 핸들링은 가볍거나 장난감처럼 보이지 않고 프리미엄하고 의도적으로 보여야 합니다.",
    ],
    heroAngles: [
      "실루엣과 라벨 가독성을 유지하는 정면 3/4 앵글.",
      "소재와 반사 특성을 보여주는 절제된 측면 앵글.",
      "전체 제품 구조와 일치할 때만 매크로 디테일을 사용합니다.",
    ],
    avoid: [
      "보이지 않은 2차 패키지, 마개, 라벨, 액세서리를 새로 만들지 않습니다.",
      "드라마틱한 원근감을 위해 제품 비율을 바꾸지 않습니다.",
      "원본 소재를 일반 플라스틱이나 크롬으로 바꾸지 않습니다.",
    ],
    continuityLocks: [
      "Silhouette",
      "Cap geometry",
      "Label and logo placement",
      "Primary/secondary product colors",
      "Material finish",
    ],
  };

  const hero: HeroDraft = {
    applicability: heroNeeded ? "required" : "none",
    role: heroNeeded ? input.bible.hero.persona : "선택한 Concept에는 사람 Hero가 필요하지 않습니다.",
    castingDirection: heroNeeded ? `${input.bible.hero.ageRange}; ${input.bible.hero.persona}.` : "해당 없음.",
    appearanceAndGrooming: heroNeeded ? "과한 포인트 없이 절제되고 현대적인 그루밍을 유지합니다." : "Not applicable.",
    performanceDirection: heroNeeded ? "절제된 자신감과 정확한 움직임을 유지하고 전형적인 뷰티 광고 포즈는 피합니다." : "Not applicable.",
    relationshipToProduct: heroNeeded ? "Hero는 제품을 의도적인 개인 소지품처럼 다루며, 핸들링은 구체적이고 차분하며 Concept의 원인과 연결됩니다." : "사람 주인공 없이 제품이 시각적 내러티브를 이끕니다.",
    continuityLocks: heroNeeded
      ? ["캐스팅 정체성", "헤어 형태", "메이크업 마감", "주얼리 계열", "절제된 퍼포먼스"]
      : [
          "Asset Bible을 재생성하지 않는 한 사람 Hero를 새로 추가하지 않습니다.",
          "사람의 등장은 보조적으로만 사용하고 선택 Concept 전반에 반복 캐릭터로 만들지 않습니다.",
        ],
    conceptRefs: heroNeeded ? heroRefs : refs,
  };

  const wardrobe: WardrobeDraft[] = heroNeeded ? [{
    label: "메인 이브닝 룩",
    silhouette: "깔끔한 수직선과 절제된 볼륨을 가진 미니멀 테일러드 이브닝 실루엣.",
    materials: ["매트한 테일러링 소재", "실크 또는 새틴 포인트"],
    palette: input.bible.palette.slice(0, 4),
    stylingNotes: ["따뜻한 금속 포인트 하나", "눈에 띄는 로고 금지", "장식적이기보다 현대적으로 유지"],
    continuityLocks: ["Concept 안에서 핵심 룩 유지", "금속 포인트 계열 일관성 유지"],
    conceptRefs: heroRefs,
  }] : [];

  const fallbackLocations = input.bible.locations.slice(0, 3);
  const locationEntries = [...locationRefs.entries()];
  const locationNames = [...new Set([...locationEntries.map(([name]) => name), ...fallbackLocations])].slice(0, 6);
  while (locationNames.length < 3) locationNames.push(`캠페인 환경 \${locationNames.length + 1}`);

  const locations: LocationDraft[] = locationNames.map((label) => ({
    label,
    environmentType: label,
    spatialDescription: `캠페인의 \${input.bible.visualWorld.keywords.slice(0, 3).join(", ")} 세계관 안에서 \${label}을 절제되게 해석한 공간입니다.`,
    materials: ["어두운 건축 표면", "선별된 반사 디테일"],
    palette: input.bible.palette.slice(0, 5),
    lightingWindow: input.bible.lighting[0] ?? "절제된 로우키 조명",
    practicalCues: input.bible.lighting.slice(0, 3),
    continuityLocks: ["소재 계열", "팔레트", "실용광 규칙", "반사 정도"],
    conceptRefs: locationRefs.get(label) ?? refs,
  }));

  const fallbackProps = input.bible.props.slice(0, 2);
  const propEntries = [...propRefs.entries()];
  const propNames = [...new Set([...propEntries.map(([name]) => name), ...fallbackProps])].slice(0, 8);
  while (propNames.length < 2) propNames.push(`캠페인 Prop \${propNames.length + 1}`);

  const props: PropDraft[] = propNames.map((label) => ({
    label,
    productionRole: "제품보다 튀지 않으면서 선택 Concept의 메커니즘을 지원합니다.",
    materialAndFinish: "캠페인 소재 언어와 맞는 프리미엄하고 절제된 마감.",
    palette: input.bible.palette.slice(0, 3),
    handlingAndUse: "선택 Concept의 동작에 이유가 있을 때만 사용합니다.",
    placementAndStaging: "의도적인 여백을 두고 제품이 시각적으로 가장 중요하게 보이도록 배치합니다.",
    continuityLocks: ["소재 마감", "크기", "배치 규칙"],
    conceptRefs: propRefs.get(label) ?? refs,
  }));

  const review: AssetBibleReview = {
    globalContinuity: {
      rules: [
        "Product Identity Locks는 장식적인 Concept 스타일보다 우선합니다.",
        "따뜻한 금속과 버건디 단서는 반복하되 모든 Location을 똑같게 만들지 않습니다.",
        "Concept별 메커니즘은 달라도 절제된 카메라와 프리미엄 소재 반응은 일관되게 유지합니다.",
      ],
      conflicts: [],
      productionNotes: [
        "제품, Props, 환경 전반에 하나의 절제된 반사 규칙을 이어갑니다.",
        "제품과 Hero continuity를 유지하되 Territory 간 의도적인 차이를 없애지 않습니다.",
      ],
    },
    issues: [],
  };

  return { productSheet, hero, wardrobe, locations, props, review };
}

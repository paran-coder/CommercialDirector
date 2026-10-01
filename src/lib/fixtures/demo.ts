import type { CreativeBrief } from "@/domain/brief/schema";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept, ExecutionType } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";

export const demoProduct: ProductIntelligence = {
  category: "향수",
  subcategory: "오 드 퍼퓸",
  visual: {
    primaryColor: "딥 버건디",
    secondaryColor: "샴페인 골드",
    materials: ["유리", "금속"],
    form: "세로로 긴 직사각형 보틀",
    finish: ["반사", "투명"],
  },
  perception: ["프리미엄", "감각적", "야간", "미니멀"],
  identityLocks: ["silhouette", "cap", "label", "logo", "product_color"],
  summary: "짙은 반투명 유리, 절제된 직사각형 실루엣, 따뜻한 금속 디테일이 특징인 프리미엄 이브닝 향수입니다.",
  confidence: { category: 0.96, materials: 0.91 },
};

export const demoBrief: CreativeBrief = {
  brandPersonality: ["럭셔리", "미니멀", "감각적"],
  audience: { age: "20–29", gender: "여성", context: "도시의 밤 문화" },
  coreBenefit: "밤의 순간을 위해 설계된 향",
  emotionalBenefit: "자리를 떠난 뒤에도 기억에 남는 존재감",
  mood: ["신비로운", "친밀한", "시네마틱"],
  occasion: "데이트/저녁 외출",
  constraints: ["뻔한 로맨스 클리셰 피하기", "화려함보다 프리미엄 절제감 유지"],
};

export const demoBible: CampaignBible = {
  campaignName: "AURELIA / NIGHT 01",
  campaignIdea: {
    statement: "당신이 떠난 뒤에도 존재감은 남는다.",
    promise: "흔적, 반사, 기억하는 공간을 통해 밤의 향을 시각화합니다.",
  },
  audienceSummary: "절제, 패션 감각, 통제된 자신감을 현대적인 럭셔리로 받아들이는 도시의 20대 여성.",
  visualWorld: {
    keywords: ["절제된 럭셔리", "깊은 그림자", "젖은 반사", "따뜻한 금속", "건축적인 밤"],
    avoid: ["전형적인 럭셔리 호텔", "장미 꽃잎", "노골적인 유혹", "과도한 장식"],
  },
  hero: { persona: "조용한 자신감", ageRange: "24–30", styling: "미니멀한 이브닝 테일러링과 따뜻한 금속 포인트 하나" },
  locations: ["호텔 복도", "야간 택시", "루프톱", "프라이빗 리스닝 바"],
  props: ["거울", "칵테일 글라스", "블랙 레더 백", "황동 키 태그"],
  productBehavior: ["반사", "그림자", "빛 굴절", "결로", "유리 질감 매크로"],
  cameraLanguage: ["절제된 돌리", "압축감 있는 인물 렌즈", "제품 매크로 인서트", "감정 피크에서만 제한적 핸드헬드"],
  lighting: ["로우키 실용광", "따뜻한 텅스텐 포인트", "스페큘러 엣지 라이트", "젖은 표면 반사"],
  palette: ["블랙", "버건디", "샴페인 골드", "따뜻한 피부 톤", "스모크 그레이"],
  soundLanguage: ["가까운 룸톤", "낮은 펄스", "고립된 구두 소리", "부드러운 기계적 앰비언스"],
};

export const demoTerritories: Territory[] = [
  { id: "after-dark", slot: 1, title: "AFTER DARK · 밤 이후", premise: "향수가 평범한 밤의 공간을 더 선명하게 만든다.", description: "향수가 등장하는 순간 익숙한 도시 공간이 더 정교하고 긴장감 있으며 시네마틱하게 변합니다." },
  { id: "the-trace", slot: 2, title: "THE TRACE · 남겨진 흔적", premise: "그녀가 떠난 뒤에도 존재감이 남는다.", description: "반사, 빛, 소리, 주변 사람에게 잔상이 남아 부재 자체가 제품의 기억 포인트가 됩니다." },
  { id: "private-ritual", slot: 3, title: "PRIVATE RITUAL · 개인의 의식", premise: "향수를 바르는 순간 밤이 시작된다.", description: "작은 준비 동작에 의식적인 무게를 부여해 제품을 사적인 정돈과 공적인 등장 사이의 문턱으로 만듭니다." },
  { id: "magnetism", slot: 4, title: "MAGNETISM · 끌림", premise: "환경이 미묘하게 그녀를 향해 움직인다.", description: "사물, 시선, 건축, 빛이 과장된 판타지 대신 절제된 끌림으로 반응합니다." },
];

const names: Record<string, Array<[string, string]>> = {
  "after-dark": [
    ["자정 이후의 도시", "그녀가 들어서는 순간 도시가 더 정교하게 보이기 시작한다."],
    ["액체로 된 밤", "버건디 빛이 보틀을 통과하며 공간의 윤곽을 다시 그린다."],
    ["마지막 한 자리", "조용한 등장이 거의 비어 있는 바의 온도를 바꾼다."],
    ["밤의 공기", "향수를 빛, 숨, 질감의 변화로 느끼게 한다."],
    ["11:47 PM", "짧은 사회적 순간들이 자정을 그녀의 시간으로 만든다."],
  ],
  "the-trace": [
    ["마지막 엘리베이터", "엘리베이터가 그녀를 기억한다."],
    ["골드 잔상", "보틀이 지나간 자리에 따뜻한 빛의 선이 남는다."],
    ["뒤늦은 시선", "그녀가 이미 지나간 뒤에야 사람들이 돌아본다."],
    ["빈 좌석", "비어 있는 택시 좌석에 아직 그녀의 존재감이 남아 있다."],
    ["지나간 뒤", "친구들이 그녀가 막 떠난 장소를 따라 밤을 재구성한다."],
  ],
  "private-ritual": [
    ["문을 나서기 전", "결정적인 순간은 집을 나서기 전에 일어난다."],
    ["밤의 세 방울", "제품 매크로 디테일로 향수를 바르는 동작을 정교한 안무로 만든다."],
    ["관객 없이", "거울 앞 연기 없이 혼자 있는 순간에 자신감이 완성된다."],
    ["맥박 지점", "소리, 피부, 유리, 패브릭이 향수를 거의 촉각적으로 느끼게 한다."],
    ["침묵 속 준비", "익숙한 준비 몽타주 대신 조용한 세로형 영상 리듬을 만든다."],
  ],
  magnetism: [
    ["방을 가로지르는 긴 길", "그녀가 걷는 동선을 따라 공간이 미묘하게 재정렬된다."],
    ["금속이 빛을 찾을 때", "카메라보다 먼저 따뜻한 금속 표면이 보틀을 발견한다."],
    ["궤도", "사람들은 몰려들지 않고 계속 시선 안에서 그녀를 다시 발견한다."],
    ["중력 테스트", "작은 사물들이 향수 자체의 장이 있는 것처럼 반응한다."],
    ["끌림", "절제된 반응의 연쇄를 통해 매력을 하나의 시각 시스템으로 만든다."],
  ],
};

const executionTypes: ExecutionType[] = ["narrative", "product_spectacle", "character", "sensory", "social"];

export const demoConcepts: Concept[] = demoTerritories.flatMap((territory, territoryIndex) =>
  names[territory.id].map(([title, hook], index) => ({
    id: `concept-${String(territoryIndex * 5 + index + 1).padStart(2, "0")}`,
    territoryId: territory.id,
    executionType: executionTypes[index],
    title,
    hook,
    idea: index === 0 && territory.id === "the-trace"
      ? "여성이 빈 거울 엘리베이터에 들어갔다가 다른 층에서 내린다. 문이 닫히기 직전 거울 속 반사만 한 박자 더 남는다. 초자연적 효과보다 보틀의 반사 유리 언어로 잔상을 연결한다."
      : `${hook} ${territory.description} 제품은 마지막에 붙이는 소품이 아니라 이 시각적 반응을 일으키는 원인으로 등장합니다.`,
    productRole: "보틀이 캠페인 메커니즘의 시각적 원점이며, 엔딩 전에 의도적인 제품 순간을 확보합니다.",
    audienceTakeaway: territory.premise,
    primaryDuration: 15,
    treatment15s: [
      { time: "0–3s", beat: "한 가지 분명한 시각 규칙과 제품이 설명되기 전의 세계를 보여준다." },
      { time: "3–9s", beat: "Hero, 환경 또는 제품 소재를 통해 Territory의 메커니즘을 확장한다." },
      { time: "9–13s", beat: "앞서 본 시각적 반응을 향수와 명확하게 연결한다." },
      { time: "13–15s", beat: "절제된 packshot과 캠페인 라인으로 마무리한다." },
    ],
    requirements: {
      hero: index !== 1,
      locations: [demoBible.locations[territoryIndex]],
      props: index === 1 ? ["반사 표면"] : [demoBible.props[territoryIndex]],
      vfx: index === 3 ? ["미묘한 환경 반응"] : [],
    },
    pro: {
      creativeRationale: `이 Concept는 “${territory.premise}”를 설명 대사 없이도 인식할 수 있는 하나의 시각 메커니즘으로 바꿉니다.`,
      camera: demoBible.cameraLanguage.slice(0, 3),
      lighting: demoBible.lighting.slice(0, 3),
      continuity: ["보틀 실루엣과 라벨 유지", "영상 안에서 Wardrobe 유지", "따뜻한 금속 하이라이트 규칙 유지"],
    },
  })),
);

export const demoProject = {
  id: "demo-aurelia",
  brandName: "Aurelia",
  productName: "No. 7 Eau de Parfum",
  status: "20개 Concept 생성됨",
  updatedAt: "18분 전",
};

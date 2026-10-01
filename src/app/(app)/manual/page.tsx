import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, CircleAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "사용자 매뉴얼",
  description: "Commercial Director의 전체 캠페인 제작 흐름과 Asset Bible, Production Plan 사용법을 설명합니다.",
};

const toc = [
  ["quick-start", "빠른 시작"],
  ["product", "1. 제품 분석"],
  ["brief", "2. Creative Brief"],
  ["campaign", "3. Campaign Bible"],
  ["concepts", "4. 20개 Concept"],
  ["assets", "5. Asset Bible"],
  ["production", "6. Production Plan"],
  ["prompt", "7. Prompt IR"],
  ["revisions", "8. Revision / 상태"],
  ["troubleshooting", "9. 문제 해결"],
] as const;

export default function ManualPage() {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-10 lg:grid-cols-[240px_minmax(0,900px)] lg:px-8 lg:py-14 xl:gap-16">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen size={16}/> 사용자 매뉴얼
        </div>
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          처음 사용하는 순서부터 Production Plan을 읽는 법까지 정리했습니다.
        </p>
        <nav className="mt-6 border-t border-[var(--line)] pt-4">
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded-md px-2 py-2 text-sm text-neutral-500 hover:bg-white hover:text-neutral-950">
              {label}
            </a>
          ))}
        </nav>
        <Link href="/projects" className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
          프로젝트로 돌아가기 <ArrowRight size={14}/>
        </Link>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-neutral-950 pb-9">
          <p className="eyebrow">Commercial Director Guide</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">한 장의 제품 이미지에서 제작 가능한 광고 설계까지.</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-500">
            Commercial Director는 단순한 prompt 생성기가 아니라, 제품의 정체성을 고정하고 여러 광고 방향을 비교한 뒤 선택한 Concept를 실제 제작 문서로 발전시키는 Creative Director OS입니다.
          </p>
        </header>

        <ManualSection id="quick-start" eyebrow="빠른 시작" title="전체 흐름을 먼저 이해하세요.">
          <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
            {[
              ["01", "제품", "제품 이미지에서 시각적 특징과 Identity Locks를 추출합니다."],
              ["02", "Creative Brief", "브랜드 성격, 타깃, 핵심 효익, 무드를 정합니다."],
              ["03", "Campaign Bible", "모든 Concept가 공유할 캠페인 세계관을 만듭니다."],
              ["04", "Concepts", "4개 Territory × 5개 실행 방식으로 20개 아이디어를 비교합니다."],
              ["05", "Asset Bible", "선택한 Concept에 필요한 Product, Hero, Wardrobe, Location, Prop을 고정합니다."],
              ["06", "Production", "15/30/45초 Treatment, Scene Graph, Shotlist, Prompt IR을 만듭니다."],
            ].map(([no,title,body]) => (
              <div key={no} className="bg-white p-6">
                <p className="question-number">{no}</p>
                <h3 className="mt-3 text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{body}</p>
              </div>
            ))}
          </div>
          <Callout>
            중요한 원칙은 <strong>앞 단계를 바꾸면 뒤 단계가 자동으로 유효하지 않을 수 있다</strong>는 점입니다. 이때 기존 결과를 지우지 않고 <strong>Out of date</strong>로 표시해 과거 revision을 보존합니다.
          </Callout>
        </ManualSection>

        <ManualSection id="product" eyebrow="1. Product Intelligence" title="제품에서 절대 바뀌면 안 되는 것을 먼저 고정합니다.">
          <p>새 캠페인에서 제품 이미지 한 장을 업로드하고 <strong>제품 분석</strong>을 실행합니다. 시스템은 카테고리, 소재, 형태, 컬러, 표면 마감과 함께 <strong>Identity Locks</strong>를 추출합니다.</p>
          <InfoGrid items={[
            ["실루엣", "제품 전체 외형과 비율"],
            ["캡 형태", "마개/뚜껑의 구조"],
            ["라벨·로고", "위치, 방향, 대비"],
            ["제품 색상", "주요/보조 색상 관계"],
            ["소재·마감", "유리, 금속, 매트/반사 등 표면 특성"],
          ]}/>
          <p>잘못 분석된 항목이 있다면 다음 단계로 가기 전에 수정하거나 필요한 Identity Lock을 켜고 끄세요. 이후 Concept와 Asset Bible이 이 기준을 상속합니다.</p>
        </ManualSection>

        <ManualSection id="brief" eyebrow="2. Creative Brief" title="광고가 무엇을 말하고 어떤 느낌이어야 하는지 정합니다.">
          <p>브랜드 인상, 타깃, 핵심 효익, 감정적 인상, 캠페인 무드를 입력합니다. 제품 카테고리에 따라 향수의 사용 순간처럼 추가 질문이 나타날 수 있습니다.</p>
          <Callout>
            제품의 기능을 과장하거나 확인되지 않은 효능을 쓰기보다, 실제로 보여줄 수 있는 효익과 감정적 결과를 분리해서 작성하는 것이 좋습니다.
          </Callout>
        </ManualSection>

        <ManualSection id="campaign" eyebrow="3. Campaign Bible" title="20개 Concept가 공유할 하나의 세계관을 만듭니다.">
          <p><strong>Campaign Bible</strong>은 캠페인의 전략 아이디어, 타깃, 비주얼 세계관, Hero, 환경, Props, 제품 표현, 카메라, 조명, 팔레트, 사운드를 하나로 묶는 공통 기준입니다.</p>
          <p>같은 제품으로 여러 아이디어를 만들어도 Campaign Bible이 같으면 색감과 촬영 언어가 제각각 흩어지는 것을 막을 수 있습니다.</p>
          <InfoGrid items={[
            ["Strategic Idea", "캠페인의 한 문장 아이디어와 약속"],
            ["Visual World", "키워드와 피해야 할 클리셰"],
            ["Camera / Lighting", "촬영과 조명 언어"],
            ["Product Behavior", "제품이 빛, 반사, 움직임에 반응하는 방식"],
          ]}/>
        </ManualSection>

        <ManualSection id="concepts" eyebrow="4. Concepts" title="20개 중 제작할 방향 1~5개를 shortlist합니다.">
          <p>시스템은 4개의 <strong>Territory</strong>마다 Narrative, Product Spectacle, Character, Sensory, Social의 5가지 실행 타입을 만들어 총 20개 Concept를 구성합니다.</p>
          <p>Bookmark 버튼으로 <strong>shortlist</strong>할 수 있습니다. Asset Bible은 1~5개 shortlist를 전제로 하므로 실제 제작 가치가 있는 방향만 남기는 것이 좋습니다.</p>
          <Callout>
            Concept Detail의 빠른 수정은 다른 19개를 다시 만들지 않고 현재 슬롯만 revision으로 추가합니다. Concept가 수정되면 그 Concept를 기반으로 만든 Production Plan은 Out of date가 될 수 있습니다.
          </Callout>
        </ManualSection>

        <ManualSection id="assets" eyebrow="5. Asset Bible" title="선택한 아이디어를 반복 제작 가능한 Asset 시스템으로 바꿉니다.">
          <p><strong>Asset Bible</strong>은 이미지 생성 기능이 아니라 제작 사양서입니다. 이후 Scene과 Shot이 같은 제품, 인물, 스타일, 공간, 소품을 반복해서 참조할 수 있게 stable key를 부여합니다.</p>
          <InfoGrid items={[
            ["Product Sheet", "제품 형태, 소재, 색상, 금지 변형, Hero angle"],
            ["Hero", "인물 필요 여부, 캐스팅, 외형, 퍼포먼스, continuity"],
            ["Wardrobe", "반복 가능한 룩과 소재/팔레트"],
            ["Locations", "공간, 소재, 조명 조건, practical cues"],
            ["Props", "소품의 역할, 마감, 배치 규칙"],
            ["Global Continuity", "전체 캠페인에서 공통으로 유지할 규칙"],
          ]}/>
          <p><code>product-main</code>, <code>hero-primary</code>, <code>location-01</code> 같은 stable key는 이후 제작 단계가 참조하는 내부 계약이므로 영문으로 유지됩니다.</p>
        </ManualSection>

        <ManualSection id="production" eyebrow="6. Production Plan" title="Concept를 시간, Scene, Shot 단위의 제작 문서로 바꿉니다.">
          <p>Current 상태의 Asset Bible이 있으면 Production Plan을 만들 수 있습니다. 각 shortlist Concept마다 같은 아이디어를 유지한 <strong>15초, 30초, 45초</strong> Treatment가 생성됩니다.</p>
          <InfoGrid items={[
            ["Treatment", "영상 길이에 맞춘 전체 전개와 beat"],
            ["Scene Graph", "이야기의 인과적 단위와 사용 Asset"],
            ["Shotlist", "Shot별 시간, 프레이밍, 카메라, 조명, 동작"],
            ["Continuity", "앞뒤 Shot에서 유지해야 할 상태"],
          ]}/>
          <p>길이가 달라져도 완전히 다른 광고가 되는 것이 아니라 같은 핵심 메커니즘을 유지하면서 setup, 디테일, 반응, payoff 시간을 조절합니다.</p>
        </ManualSection>

        <ManualSection id="prompt" eyebrow="7. Prompt IR / Provider Prompt" title="Pro Controls는 제작 prompt의 내부 구조를 보여줍니다.">
          <p><strong>Prompt IR</strong>은 특정 영상 모델에 종속되지 않는 중간 표현입니다. subject, action, environment, camera, lighting, motion, continuity와 Asset reference를 구조적으로 보관합니다.</p>
          <p>그 다음 Generic, Seedance, Kling, Veo compiler가 같은 Prompt IR을 각 provider에 맞는 텍스트로 정리합니다. <strong>provider 이름, stable key, Prompt IR 같은 기술 용어는 영문을 유지</strong>합니다.</p>
          <Callout>
            v1.2.1은 prompt와 제작 문서를 만드는 단계입니다. 실제 이미지/영상 생성은 아직 연결하지 않습니다.
          </Callout>
        </ManualSection>

        <ManualSection id="revisions" eyebrow="8. Revision / 상태" title="AI 결과는 덮어쓰지 않고 revision으로 남깁니다.">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard icon={<CheckCircle2 size={18}/>} title="Current · 최신" body="현재 Campaign, shortlist, Asset Bible, Concept revision과 소스가 일치합니다."/>
            <StatusCard icon={<CircleAlert size={18}/>} title="Out of date · 재생성 필요" body="앞 단계가 변경되어 기존 결과가 현재 소스와 맞지 않습니다. 과거 결과는 삭제되지 않습니다."/>
          </div>
          <p>재생성하면 revision 1을 덮어쓰는 대신 revision 2, 3처럼 새 기록을 추가합니다. 따라서 어떤 소스에서 어떤 제작 문서가 나왔는지 추적할 수 있습니다.</p>
        </ManualSection>

        <ManualSection id="troubleshooting" eyebrow="9. 문제 해결" title="막혔을 때는 앞 단계의 상태를 확인하세요.">
          <div className="space-y-4">
            <Trouble q="Asset Bible을 만들 수 없어요." a="Campaign이 있고 shortlist가 1~5개인지 확인하세요. 0개 또는 6개 이상이면 먼저 Concepts에서 선택을 조정해야 합니다."/>
            <Trouble q="Production Plan이 열리지 않아요." a="Asset Bible이 Current 상태인지 확인하세요. Campaign이나 shortlist를 바꾼 뒤라면 Asset Bible을 먼저 재생성해야 합니다."/>
            <Trouble q="예전 결과가 영어로 보여요." a="기존 revision은 보존됩니다. v1.2.1 이후 새로 생성하거나 재생성한 사용자용 필드부터 한국어 규칙을 적용합니다."/>
            <Trouble q="stable key가 영어라서 이상해 보여요." a="stable key와 provider 이름은 내부 제작 계약이라 의도적으로 영문을 유지합니다. 사람이 읽는 설명 문구는 한국어를 우선합니다."/>
            <Trouble q="공유 이미지가 아직 안 보여요." a="metadata는 /og-image.png를 바라보도록 준비되어 있습니다. public/og-image.png에 1200×630 이미지를 추가하면 됩니다."/>
          </div>
        </ManualSection>
      </main>
    </div>
  );
}

function ManualSection({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-[var(--line)] py-10 last:border-b-0">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-5 text-sm leading-7 text-neutral-600">{children}</div>
    </section>
  );
}

function InfoGrid({ items }: { items: Array<[string,string]> }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
      {items.map(([title, body]) => <div key={title} className="bg-white p-5"><p className="font-medium text-neutral-950">{title}</p><p className="mt-2 text-sm leading-6 text-neutral-500">{body}</p></div>)}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return <div className="border-l-2 border-neutral-950 bg-white px-5 py-4 text-sm leading-6 text-neutral-600">{children}</div>;
}

function StatusCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-xl border border-[var(--line)] bg-white p-5"><div className="flex items-center gap-2 font-medium text-neutral-950">{icon}{title}</div><p className="mt-3 text-sm leading-6 text-neutral-500">{body}</p></div>;
}

function Trouble({ q, a }: { q: string; a: string }) {
  return <div className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="font-medium text-neutral-950">{q}</p><p className="mt-2 text-sm leading-6 text-neutral-500">{a}</p></div>;
}

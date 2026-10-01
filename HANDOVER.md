# Commercial Director — HANDOVER

> 기준 버전: **Commercial-Director-v1.2.1**  
> 작성 기준: 2026-10-01  
> 저장소: https://github.com/paran-coder/CommercialDirector  
> 현재 기준 커밋: `b6919e03154674fc19d9ecafcfdac59d34e5e7e2`

---

## 1. 현재 상태 요약

Commercial Director는 **제품 이미지 한 장을 입력으로 받아 광고 전략, 20개 Concept, 제작 Asset 기준, Scene/Shot 설계, provider용 prompt까지 연결하는 Creative Director OS**다.

현재 릴리스는 **v1.2.1**이며 다음까지 완료되어 있다.

- Product Intelligence
- Identity Locks
- Creative Brief
- Campaign Bible
- 4 Creative Territories
- Territory별 5개 실행 방식, 총 20개 Concept
- Concept shortlist 1–5개
- Concept 부분 refinement / revision
- Asset Bible
  - Product Sheet
  - Hero
  - Wardrobe
  - Locations
  - Props
  - Global Continuity
- Production Plan
  - 15s / 30s / 45s Treatment
  - Scene Graph
  - Shotlist
  - model-neutral Prompt IR
  - Generic / Seedance / Kling / Veo prompt compiler
- append-only revision 저장
- source drift / stale 판정
- PostgreSQL runtime repository
- browser fallback
- 한국어 UI
- 상세 사용자 매뉴얼 `/manual`
- Open Graph / Twitter metadata
- DB-backed Playwright E2E

**아직 실제 이미지/영상 생성은 연결하지 않았다.**

---

## 2. Git / Release 상태

### 브랜치

- `main`: 안정 릴리스
- `dev`: 통합 브랜치
- 현재 `main`과 `dev`는 완전히 동일하다.

현재 공통 SHA:

```
b6919e03154674fc19d9ecafcfdac59d34e5e7e2
```

### 최근 릴리스

PR #6:

**Commercial Director v1.2.1 — Korean UX, Manual & OG**

- PR: https://github.com/paran-coder/CommercialDirector/pull/6
- squash merge commit:
  `ebc3a50ca227597fc79f3a47df19aa990db8e5e6`
- release checklist 마감 commit:
  `b6919e03154674fc19d9ecafcfdac59d34e5e7e2`

### 최종 CI

main 최종 CI:

```
Run ID: 36823559523
Status: success
```

검증 항목:

- PostgreSQL schema push
- TypeScript typecheck
- ESLint
- Next.js production build
- Playwright 전체 E2E

v1.2.1 Playwright:

```
16 / 16 passed
```

---

## 3. 제품 핵심 개념

Commercial Director의 제품 철학은 다음 한 줄로 요약할 수 있다.

> **One Product Image → One Campaign Bible → 20 Advertising Concepts → Production Plan**

이 프로젝트는 단순 prompt generator가 아니다.

목표는 AI가 광고 아이디어를 아무렇게나 많이 생성하는 것이 아니라, 사람이 Creative Director처럼 다음 결정을 순서대로 검토하고 승인할 수 있게 만드는 것이다.

1. 제품 정체성
2. 브랜드/타깃
3. 캠페인 전략
4. Creative Territory
5. Concept
6. shortlist
7. Asset continuity
8. Scene
9. Shot
10. provider prompt
11. 향후 실제 렌더링

---

## 4. 현재 사용자 플로우

```
Product
→ Brief
→ Campaign
→ Concepts
→ Assets
→ Production
```

### Product

제품 이미지를 업로드한다.

생성:

- category
- materials
- form
- palette
- finish
- perception
- Identity Locks

Identity Locks 예:

- silhouette
- cap
- label
- logo
- product_color
- material_finish

이 값은 이후 모든 제작 단계에서 제품 continuity의 가장 강한 기준이다.

---

## 5. Creative Brief

현재 핵심 질문은 다음 구조다.

- 브랜드 성격
- 타깃
- 핵심 효익
- 감정적 takeaway
- 캠페인 mood
- 제품별 dynamic question

제품 카테고리에 따라 추가 질문을 붙일 수 있도록 설계되어 있다.

중요:

**Creative Brief는 Campaign generation의 source of truth다.**

---

## 6. Campaign 구조

Campaign generation 결과:

### Campaign Bible

포함:

- campaign idea
- audience
- visual world
- hero
- locations
- props
- product behavior
- camera language
- lighting
- palette
- sound

### Creative Territories

항상 4개.

각 Territory는 하나의 실행 아이디어가 아니라 여러 Concept가 나올 수 있는 **전략적 아이디어 공간**이다.

---

## 7. 20 Concept Matrix

현재 다양성 강제 구조:

```
4 Territories × 5 Execution Types = 20 Concepts
```

Execution Types:

1. Narrative
2. Product Spectacle
3. Character
4. Sensory
5. Social

이 구조를 둔 이유는 AI가 20개의 거의 같은 아이디어를 표현만 바꿔 생성하는 것을 막기 위해서다.

Concept는 다음 핵심 구조를 가진다.

- stable concept ID
- territory
- execution type
- title
- hook
- idea
- product role
- audience takeaway
- 15s treatment
- asset requirements
- Pro Controls
  - creative rationale
  - camera
  - lighting
  - continuity

---

## 8. Shortlist

사용자는 20개 중 **1–5개 Concept**를 shortlist한다.

Asset Bible은 shortlist 이후에 생성한다.

이 순서는 의도적이다.

Asset Bible을 20개 Concept 전에 생성하면 너무 많은 방향을 평균내게 되어 제작 세계관이 애매해질 수 있다.

따라서:

```
20 Concepts
→ shortlist 1–5
→ Asset Bible
```

---

## 9. Asset Bible

Asset Bible은 실제 이미지를 만드는 기능이 아니다.

**제작 Asset의 구조화된 사양서**다.

경로:

```
/projects/[projectId]/assets
```

구성:

### Product Sheet

stable key:

```
product-main
```

포함:

- identity statement
- preserve
- form rules
- materials / surface
- color / markings
- scale / handling
- hero angles
- avoid
- continuity locks

### Hero

stable key:

```
hero-primary
```

applicability:

- required
- optional
- none

Hero가 `none`이면 Wardrobe는 비어 있어야 한다.

### Wardrobe

stable key:

```
wardrobe-01
wardrobe-02
...
```

최대 4개.

### Locations

stable key:

```
location-01
location-02
...
```

3–6개.

### Props

stable key:

```
prop-01
prop-02
...
```

2–8개.

### Global Continuity

캠페인 전체의 공통 continuity와 intentional differences를 관리한다.

---

## 10. Asset Bible AI 구조

Asset Bible은 runtime multi-agent 시스템이 아니다.

한 orchestration 안에서 역할별 structured generation을 분리한다.

현재 역할:

1. Product Continuity Director
2. Casting & Styling Director
3. Production Designer
4. Cross-Asset Continuity Reviewer

앞의 세 생성 작업은 가능한 범위에서 병렬 실행한다.

그 뒤:

```
structured generation
→ canonical key normalization
→ deterministic validation
→ model quality review
→ targeted repair
→ final validation
```

중요:

**canonical stable key는 AI가 만들지 않는다. 애플리케이션 코드가 부여한다.**

---

## 11. Production Plan

경로:

```
/projects/[projectId]/production
```

Production Plan은 Current 상태의 Asset Bible이 있어야 생성할 수 있다.

구조:

```
Concept
→ Treatment
→ Scene
→ Shot
→ Prompt IR
→ Provider Compiler
```

### Treatment

각 shortlisted Concept마다:

- 15초
- 30초
- 45초

세 버전을 생성한다.

세 버전은 서로 다른 광고 아이디어가 아니다.

같은 Concept mechanism을 유지하고 영상 길이에 따라 setup, pacing, reaction, product detail, payoff 시간을 확장한다.

---

## 12. Scene Graph

Scene은 단순 location 변화가 아니라 **인과적 story unit**이다.

Scene 포함 정보:

- canonical scene key
- duration
- story purpose
- action
- product role
- Asset Bible refs
- continuity in
- continuity out
- sound intent

canonical key 예:

```
scene-concept-06-15-01
```

AI가 canonical ID를 결정하지 않는다.

---

## 13. Shotlist

Shot 포함:

- canonical shot key
- scene key
- start / end
- duration
- framing
- camera movement
- lens intent
- subject action
- product visibility
- lighting intent
- assetRefs
- continuity notes
- transition intent

예:

```
shot-concept-06-15-01-01
```

deterministic validation:

- shot timing monotonic
- positive duration
- scene 존재
- scene당 최소 1 shot
- shot duration sum ≈ treatment duration
- Asset Bible ref 유효성
- Hero none 상태에서 Hero/Wardrobe 참조 금지

---

## 14. Prompt IR

Prompt IR은 모델 중립 구조다.

provider-specific prompt를 source of truth로 사용하지 않는다.

Prompt IR 포함:

- subject
- action
- environment
- product continuity
- character continuity
- prop continuity
- framing
- lens / camera
- lighting
- motion
- temporal behavior
- negative constraints
- continuity carry

중요 설계:

```
Scene / Shot
→ Prompt IR
→ Provider Compiler
```

provider compiler가 새로운 creative fact를 만들면 안 된다.

---

## 15. Prompt Compilers

현재 compiler:

- Generic
- Seedance
- Kling
- Veo

위 compiler는 deterministic code다.

AI 모델을 다시 호출해서 provider prompt를 만드는 구조가 아니다.

목표:

같은 Prompt IR이 provider가 달라도 동일한 creative source를 유지하게 하는 것.

---

## 16. Revision 시스템

AI 결과는 overwrite하지 않는다.

append-only revision을 사용한다.

현재 revision 대상:

- Campaign
- Concept refinement
- Asset Bible
- Production Plan

예:

```
Asset Bible r1
Asset Bible r2
Asset Bible r3
```

이전 revision은 보존한다.

---

## 17. Current / Out of date

이 프로젝트에서 매우 중요한 상태다.

### Current

현재 source와 revision의 source binding이 일치한다.

### Out of date

상위 source가 변경된 상태다.

예:

Campaign이 바뀌면:

```
Campaign r2
Asset Bible r1 → Out of date
Production Plan r1 → Out of date
```

Shortlist가 바뀌어도 동일하다.

Production Plan은 추가로 shortlisted Concept의 refinement revision까지 추적한다.

즉 Concept만 수정해도 기존 Production Plan은 stale 처리될 수 있다.

---

## 18. Persistence

PostgreSQL 사용 시 DB가 source of truth다.

브라우저 fixture/local fallback도 같은 revision semantics를 최대한 유지한다.

중요 테이블/개념:

- projects
- product analysis
- briefs
- campaign revisions
- concepts
- concept revisions
- shortlist
- asset_bible_revisions
- production_plan_revisions
- generation jobs

---

## 19. Generation Job / Retry 경계

AI generation과 persistence commit의 retry 경계를 분리했다.

원칙:

> 성공한 AI generation 뒤 DB 저장만 실패했다고 AI를 다시 호출하지 않는다.

즉:

```
AI generation
→ success
→ DB commit
→ DB failure
```

일 경우 AI generation은 재실행하지 않는다.

이 동작은 E2E/engine test로 검증되어 있다.

---

## 20. Source Drift Protection

긴 generation 중 사용자가 다른 탭에서 source를 바꿀 수 있다.

예:

1. Asset Bible 생성 시작
2. 사용자가 shortlist 변경
3. generation 완료
4. 이전 shortlist 기준 결과가 저장됨

이 문제를 막기 위해 commit 직전에 source를 다시 읽는다.

Asset Bible:

- Campaign revision
- shortlist

Production Plan:

- Campaign revision
- Asset Bible revision
- shortlist
- shortlisted Concept revision snapshot

중 하나라도 달라지면 commit을 거부한다.

---

## 21. 한국어 정책 — v1.2.1

현재 UI는 한국어 우선이다.

한국어:

- 버튼
- 안내
- 상태
- 빈 상태
- 오류
- AI 자유 서술 필드
- fixture/demo

영문 유지 또는 병기:

- Commercial Director
- Campaign Bible
- Asset Bible
- Product Sheet
- Hero
- Wardrobe
- Scene Graph
- Shotlist
- Prompt IR
- Seedance
- Kling
- Veo
- stable key
- canonical key
- schema enum
- concept ID
- provider/model 이름

기존 저장된 영문 revision은 자동 번역하지 않는다.

재생성된 revision부터 한국어 생성 rule을 따른다.

---

## 22. 사용자 매뉴얼

앱 내부 상세 매뉴얼:

```
/manual
```

다음 내용을 설명한다.

- 전체 workflow
- Product Intelligence
- Identity Locks
- Creative Brief
- Campaign Bible
- 20 Concepts
- shortlist
- Asset Bible
- Production Plan
- Prompt IR
- revision
- Current / Out of date
- 문제 해결

Header와 Project navigation에서 접근 가능하다.

---

## 23. OG 이미지

metadata는 준비되어 있다.

예정 파일:

```
public/og-image.png
```

이미지 크기:

```
1200 × 630
```

현재 **실제 이미지 파일은 아직 추가하지 않았다.**

사용자가 OG 이미지를 준비하면 위 경로에 그대로 넣으면 된다.

metadata에는 이미:

- Open Graph image
- width 1200
- height 630
- Twitter summary_large_image

가 등록되어 있다.

배포 URL 우선순위:

1. `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_PROJECT_PRODUCTION_URL`
3. `VERCEL_URL`
4. localhost fallback

---

## 24. Tech Stack

Frontend / App:

- Next.js 16
- App Router
- React 19
- TypeScript
- Tailwind CSS
- Lucide

Domain / Validation:

- Zod

Database:

- PostgreSQL 17
- Drizzle ORM

AI:

- provider abstraction
- OpenAI adapter
- Fixture provider

Testing:

- Playwright
- GitHub Actions

Runtime target:

```
Node >= 22
```

---

## 25. 주요 디렉터리

```
src/
  app/
    api/
      ai/
    (app)/
      manual/
      projects/

  components/
    app/
    product/
    brief/
    campaign/
    concepts/
    assets/
    production/

  domain/
    product/
    brief/
    campaign/
    concept/
    assets/
    production/
    project/

  ai/
    providers/
    prompts/
    orchestration/

  repositories/

  db/

  lib/
    fixtures/
```

---

## 26. 특히 중요한 파일

### Domain contracts

```
src/domain/product/schema.ts
src/domain/brief/schema.ts
src/domain/campaign/schema.ts
src/domain/concept/schema.ts
src/domain/assets/schema.ts
src/domain/production/schema.ts
src/domain/project/schema.ts
```

### AI orchestration

```
src/ai/orchestration/assets.ts
src/ai/orchestration/asset-bible-quality.ts
src/ai/orchestration/production.ts
src/ai/orchestration/production-quality.ts
src/ai/orchestration/prompt-compiler.ts
```

### AI prompts

```
src/ai/prompts/index.ts
```

### Persistence

```
src/db/schema.ts
src/repositories/project-repository.ts
src/repositories/postgres-project-repository.ts
src/lib/project-store.ts
src/lib/runtime-project-store.ts
```

### Main UI

```
src/components/product/product-upload.tsx
src/components/product/product-intelligence.tsx
src/components/brief/creative-brief.tsx
src/components/campaign/campaign-bible.tsx
src/components/concepts/concept-grid.tsx
src/components/concepts/concept-detail.tsx
src/components/assets/asset-bible.tsx
src/components/production/production-plan.tsx
```

### User Manual

```
src/app/(app)/manual/page.tsx
```

---

## 27. Environment

예시:

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
AI_PROVIDER=fixture
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Fixture mode는 API key 없이 개발 가능해야 한다.

주의:

실제 환경 변수 이름은 항상 `.env.example`과 현재 provider 코드를 함께 확인한다.

---

## 28. Local 실행

```bash
npm install
npm run dev
```

PostgreSQL 사용:

```bash
npm run db:push
```

전체 검증:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

또는:

```bash
npm run verify
```

---

## 29. CI Gate

릴리스 완료 조건:

1. PostgreSQL schema push 성공
2. typecheck 성공
3. lint 성공
4. production build 성공
5. 전체 Playwright 성공

기능이 구현되어 보여도 위 gate가 전부 통과하기 전에는 release 완료로 보지 않는다.

---

## 30. Fixture 원칙

Fixture provider는 단순 placeholder가 아니다.

다음 용도로 사용한다.

- API key 없는 local 개발
- deterministic CI
- domain schema regression
- orchestration test
- persistence test
- UI E2E

Fixture와 real provider가 같은 domain contract를 사용해야 한다.

한국어 UI 변경 시 fixture 문자열 길이가 Zod 최소 길이를 깨뜨리지 않는지 주의한다.

v1.2.1에서 실제로 이 문제를 한 번 수정했다.

---

## 31. 다음 개발 버전

다음 큰 milestone 권장:

# Commercial-Director-v1.3.0

**Reference Asset Generation + Continuity Director**

예상 범위:

### Reference Asset Generation

Asset Bible 구조를 실제 reference image로 시각화.

- Product Sheet reference
- Hero reference
- Wardrobe reference
- Location reference
- Prop reference

### Continuity Director

reference asset 및 생성 이미지 사이에서 다음 continuity를 검사한다.

- product geometry
- product color
- logo / label
- hero identity
- wardrobe
- location material language
- prop identity
- lighting continuity

---

## 32. v1.3.0 권장 설계 순서

권장 구현 순서:

### Phase 0

- v1.3.0 context / checklist / README / manual 업데이트
- image generation provider abstraction 확정

### Phase 1

Reference Asset domain 추가.

예:

```
ReferenceAsset
ReferenceAssetRevision
RenderRequest
RenderResult
ContinuityCheck
```

### Phase 2

Asset Bible → Reference Asset generation.

처음부터 모든 이미지를 만들지 말고 최소 단위:

1. Product
2. Hero
3. Wardrobe
4. Location
5. Prop

### Phase 3

Continuity Director.

reference image와 새 이미지 간 consistency 검사.

### Phase 4

Production Shot에서 reference asset을 연결.

```
Shot
→ assetRefs
→ referenceImages
→ render prompt
```

### Phase 5

UI.

Assets 화면에서 structured spec과 reference image를 같은 stable key 아래 배치.

---

## 33. 아직 하지 말아야 할 것

v1.3.0에서 바로 영상 생성까지 한 번에 넣지 않는 것을 권장한다.

현재 roadmap:

### v1.3.0

- reference image generation
- visual continuity checking
- reference management

### v2.0.0

- video generation
- shot regeneration
- timeline assembly
- packshot
- social cutdowns

이미지 continuity가 안정되지 않은 상태에서 video rendering을 먼저 붙이면 디버깅 난이도가 급격히 올라간다.

---

## 34. 중요한 설계 원칙

### 1. Stable key는 AI가 만들지 않는다

Application code가 부여한다.

### 2. AI 결과는 overwrite하지 않는다

append-only revision.

### 3. UI는 provider를 몰라야 한다

Domain model은 model/provider neutral.

### 4. Provider prompt가 source of truth가 아니다

Prompt IR이 source of truth.

### 5. AI generation과 persistence retry를 분리한다

DB 실패 때문에 AI를 다시 호출하지 않는다.

### 6. Source drift를 항상 commit 전에 확인한다

장시간 generation에서 특히 중요.

### 7. 20 Concepts는 다양성 matrix를 유지한다

AI에게 "20개 만들어"라고 단순 요청하지 않는다.

### 8. Asset Bible은 shortlist 이후

모든 Concept를 평균내지 않는다.

### 9. Production Plan은 Current Asset Bible 이후

stale source에서 Shot을 만들지 않는다.

---

## 35. UI Design 원칙

현재 방향:

- off-white / white background
- graphite / black typography
- 1px neutral border
- small / medium radius
- 거의 없는 shadow
- generous spacing
- restrained motion
- editorial production-tool feel

피해야 할 것:

- AI purple gradient
- glassmorphism
- neon
- blob backgrounds
- 과도하게 둥근 card
- chat-style workflow
- metric-heavy dashboard

Commercial Director는 AI chatbot처럼 보이면 안 된다.

**Creative agency / production tool / luxury SaaS** 쪽이 맞다.

---

## 36. 다음 담당자가 가장 먼저 확인할 것

새 작업을 시작할 때 아래 순서 권장.

1. `main`과 `dev`가 동일한지 확인
2. 최신 CI green 확인
3. `context-notes.md`
4. `checklist.md`
5. `README.md`
6. `User manual.md`
7. domain schema
8. PostgreSQL schema
9. orchestration
10. E2E

그 다음 새 feature branch 생성.

---

## 37. 즉시 남아 있는 작은 작업

기능 버그는 현재 확인된 것이 없다.

다만 아래 운영 작업은 남아 있다.

### OG 이미지 실제 파일 추가

사용자가 준비한 1200×630 이미지를:

```
public/og-image.png
```

에 추가.

### Public production URL

배포 도메인이 확정되면:

```
NEXT_PUBLIC_SITE_URL=https://...
```

설정 권장.

### Live AI smoke test

CI는 fixture provider 중심이다.

실제 OpenAI credential을 사용한 production smoke test는 별도 수행 권장.

단, secret은 repository 코드에 넣지 않는다.

---

## 38. 현재 완료 판단

현재 기준:

**Commercial-Director-v1.2.1은 release 완료 상태다.**

- main/dev sync
- CI green
- Korean UX
- manual
- OG metadata
- Campaign → Asset Bible → Production 구조
- PostgreSQL revision persistence
- deterministic test coverage

다음 작업은 기능 수정이 아니라면 **v1.3.0 Reference Asset Generation**에서 시작하는 것이 가장 자연스럽다.

---

## 39. Handover 체크리스트

다음 담당자는 작업 시작 전 아래를 확인한다.

- [ ] main 최신 pull
- [ ] dev와 main sync
- [ ] Node 22+
- [ ] `npm install`
- [ ] `.env.example` 확인
- [ ] 필요 시 PostgreSQL 준비
- [ ] `npm run db:push`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] v1.3.0 feature branch 생성
- [ ] v1.3.0 계획 문서 먼저 갱신
- [ ] 실제 render 기능 전 stable key / revision / continuity contract 먼저 확정

---

## 40. 핵심 한 줄

> **Commercial Director의 경쟁력은 이미지를 많이 생성하는 것이 아니라, 제품 정체성·Creative Decision·Asset Continuity·Production Plan을 하나의 revisioned system으로 연결하는 데 있다.**

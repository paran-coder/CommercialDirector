# Commercial Director v1.3.0 — Context Notes

## 목적
v1.3.0은 기존 Asset Bible의 구조화된 제작 사양을 실제 reference image revision으로 연결하고, 이후 생성물의 visual continuity를 검증할 수 있는 기반을 만든다.

## 기준선
- 기준 브랜치: `dev`
- 시작 SHA: `ca396a7bc3ea803dedb42a48d9f41bdf85f2658a`
- v1.2.1 기능과 revision semantics를 보존한다.
- main/dev는 v1.3.0 착수 시점에 동일하다.

## 핵심 목표
첫 vertical slice는 다음 한 줄이다.

> Asset Bible의 `product-main`을 실제 reference image revision으로 생성·저장·조회할 수 있다.

이 경로가 안정된 뒤 같은 패턴을 Hero → Wardrobe → Location → Prop 순서로 확장한다.

## v1.3.0 범위

### 1. Reference Asset domain
다음 계약을 추가한다.
- ReferenceAsset
- ReferenceAssetRevision
- RenderRequest
- RenderResult
- ContinuityCheck

Reference Asset은 별도의 임의 creative ID 체계를 만들지 않는다. Asset Bible의 기존 stable key를 canonical ownership key로 사용한다.

예:
- product-main
- hero-primary
- wardrobe-01
- location-01
- prop-01

### 2. Revision / source binding
Reference Asset은 overwrite하지 않고 append-only revision으로 저장한다.

최소 source binding:
- project
- source Asset Bible revision
- asset stable key
- render revision

Asset Bible source가 바뀌면 이전 Reference Asset revision은 기록으로 남지만 Current가 아니며 Out of date로 판정할 수 있어야 한다.

### 3. Image generation provider abstraction
기존 structured text generation용 AIProvider와 image rendering 계약을 분리한다.

원칙:
- Domain/UI는 provider 이름을 몰라야 한다.
- ImageGenerationProvider가 provider-specific request/response를 캡슐화한다.
- Fixture image provider를 유지해 API key 없이 deterministic CI/E2E가 가능해야 한다.
- 실제 provider 실패와 persistence 실패의 retry 경계를 분리한다.

### 4. Product reference vertical slice
첫 구현 대상은 `product-main` 하나다.

흐름:
```
Current Asset Bible
→ product-main RenderRequest
→ ImageGenerationProvider
→ RenderResult
→ ReferenceAssetRevision
→ persistence
→ read model
```

Product reference prompt는 Product Sheet, Product Intelligence, Identity Locks를 기반으로 하며 새로운 제품 정체성을 임의로 만들지 않는다.

### 5. Continuity Director
첫 단계는 Product continuity부터 구조화한다.

검사 대상:
- product geometry
- product color
- logo / label
- material / finish

후속 확장:
- hero identity
- wardrobe
- location material language
- prop identity
- lighting continuity

ContinuityCheck는 생성물의 상태를 기록하며 원본 Reference Asset revision을 덮어쓰지 않는다.

### 6. 후속 확장
Product vertical slice 이후:
1. Hero
2. Wardrobe
3. Location
4. Prop
5. Production Shot reference 연결

Production 연동 목표:
```
Shot
→ assetRefs
→ referenceImages
→ render prompt
```

## 비범위
v1.3.0에서는 다음을 구현하지 않는다.
- video generation
- shot video regeneration
- timeline assembly
- final packshot assembly
- social cutdowns

위 항목은 image continuity가 안정된 이후 v2.0.0 범위로 유지한다.

## 보존해야 할 기존 원칙
1. Stable key는 AI가 만들지 않는다.
2. AI/renderer 결과는 overwrite하지 않는다.
3. UI/domain은 provider-neutral이어야 한다.
4. Prompt/Render provider output은 source of truth가 아니다.
5. generation과 persistence retry를 분리한다.
6. commit 직전 source drift를 다시 검증한다.
7. stale source에서는 downstream render를 만들지 않는다.
8. Fixture와 real provider는 같은 domain contract를 사용한다.

## 구현 순서
### Phase 0 — 계획
- feature branch 생성
- context-notes.md / checklist.md / README.md / User manual.md 갱신
- package version 1.3.0
- domain/provider/persistence 경계 확정

### Phase 1 — Domain
- Reference Asset schema
- stable key mapping
- render request/result schema
- continuity check schema

### Phase 2 — Persistence
- reference asset revision table
- repository save/read contract
- source binding / stale 판정
- generation job kind 확장

### Phase 3 — Provider
- ImageGenerationProvider interface
- fixture implementation
- real image provider adapter
- retry boundary

### Phase 4 — Product vertical slice
- product-main render orchestration
- API route
- revision 저장/조회
- source drift protection

### Phase 5 — Continuity
- Product continuity check
- structured result 저장
- retry/repair 정책

### Phase 6 — UI / Production link
- Assets 화면 reference image
- stable key별 revision/current 상태
- Shot referenceImages 연결

### Phase 7 — Verification
- db:push
- typecheck
- lint
- build
- Playwright
- live provider smoke test

## 변경 최소화 원칙
v1.3.0 구현 중에는 필요한 파일만 읽고 수정한다. 기능과 직접 관련 없는 디렉터리 전체 탐색이나 무관한 파일 변경은 하지 않는다.

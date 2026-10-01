# Commercial Director v1.3.0 — Reference Asset Generation

Commercial Director는 제품 이미지 한 장에서 Product Intelligence, Creative Brief, Campaign Bible, 20개 Concept, Asset Bible, Production Plan까지 연결하는 Creative Director OS다.

v1.3.0은 기존의 구조화된 제작 사양을 **실제 reference image revision**으로 연결하고, 이후 생성물의 visual continuity를 검증할 수 있는 기반을 추가한다.

## 현재 개발 목표

첫 vertical slice:

```
Current Asset Bible
→ product-main
→ RenderRequest
→ ImageGenerationProvider
→ RenderResult
→ ReferenceAssetRevision
→ 저장 / 조회
```

Product 경로가 안정된 뒤 Hero → Wardrobe → Location → Prop 순서로 확장한다.

## 핵심 설계

### Asset Bible stable key 재사용
Reference Asset은 새 임의 식별자를 만들지 않고 기존 stable key를 기준으로 귀속한다.

- `product-main`
- `hero-primary`
- `wardrobe-01`
- `location-01`
- `prop-01`

Stable key는 AI나 image provider가 만들지 않는다.

### Append-only revision
생성 이미지는 overwrite하지 않는다. 같은 stable key를 다시 생성하면 새 Reference Asset revision을 추가한다.

Reference Asset revision은 최소한 다음 source에 묶인다.
- project
- source Asset Bible revision
- asset stable key
- render revision

상위 Asset Bible이 바뀌면 과거 reference image는 보존하되 Out of date로 판정할 수 있어야 한다.

### Provider-neutral image rendering
기존 structured text generation용 AIProvider와 별도로 image generation contract를 둔다.

UI와 domain은 특정 image provider를 알지 않는다. Fixture와 real provider는 동일한 RenderRequest / RenderResult 계약을 사용한다.

### Continuity Director
v1.3.0의 첫 continuity 범위는 Product다.

- geometry
- color
- logo / label
- material / finish

이후 Hero identity, Wardrobe, Location, Prop, Lighting으로 확장한다.

## 기존 workflow

`Product → Brief → Campaign → Concepts → Assets → Production`

v1.3.0에서는 Assets 단계가 다음처럼 확장된다.

```
Asset Bible structured spec
→ Reference Asset
→ Continuity Check
```

향후 Production에서는:

```
Shot
→ assetRefs
→ referenceImages
→ render prompt
```

으로 연결한다.

## 비범위
v1.3.0에서는 영상 생성을 붙이지 않는다.

다음은 v2.0.0 범위다.
- video generation
- shot regeneration
- timeline assembly
- packshot
- social cutdowns

## 개발 원칙
- stable key는 application code가 관리한다.
- generation 결과는 append-only revision으로 보존한다.
- provider output은 source of truth가 아니다.
- UI/domain은 provider-neutral이다.
- generation 성공 뒤 DB 저장만 실패했을 때 generation을 다시 실행하지 않는다.
- 장시간 generation은 commit 직전 source drift를 다시 확인한다.
- Fixture provider는 deterministic CI의 핵심 계약이다.
- 변경과 직접 관련 없는 파일은 읽거나 수정하지 않는다.

## Quality gate
릴리스 전 다음이 모두 통과해야 한다.
- PostgreSQL schema push
- TypeScript typecheck
- ESLint
- Next.js production build
- Playwright 전체 suite
- live image provider smoke test

## Version

Commercial-Director-v1.3.0

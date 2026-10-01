# Commercial Director v1.3.0 — Reference Asset Generation Checklist

## Phase 0 — 계획 / 기준선
- [x] v1.3.0 feature branch 생성
- [x] 시작 SHA 확인 — `ca396a7bc3ea803dedb42a48d9f41bdf85f2658a`
- [x] main/dev 동일 상태 확인
- [x] 최신 main CI green 확인
- [x] context-notes.md 갱신
- [x] checklist.md 갱신
- [x] README.md 갱신
- [x] User manual.md 갱신
- [x] package version 1.3.0
- [x] 첫 vertical slice를 product-main으로 제한
- [x] 영상 생성은 v1.3.0 비범위로 유지

## Phase 1 — Reference Asset Domain
- [ ] `src/domain/reference-assets/schema.ts` 추가
- [ ] ReferenceAsset schema
- [ ] ReferenceAssetRevision schema
- [ ] RenderRequest schema
- [ ] RenderResult schema
- [ ] ContinuityCheck schema
- [ ] Asset Bible stable key 재사용 규칙
- [ ] Product/Hero/Wardrobe/Location/Prop asset kind mapping
- [ ] schema-level invalid-state validation

## Phase 2 — Persistence / Revision
- [ ] PostgreSQL reference asset revision table
- [ ] source Asset Bible revision binding
- [ ] stable key + revision uniqueness
- [ ] repository save contract
- [ ] repository read contract
- [ ] append-only 보장
- [ ] Current / Out of date 판정
- [ ] source drift commit guard
- [ ] generation job kind 확장

## Phase 3 — Image Provider
- [ ] ImageGenerationProvider interface
- [ ] provider-neutral RenderRequest
- [ ] provider-neutral RenderResult
- [ ] fixture image provider
- [ ] real image provider adapter
- [ ] provider error normalization
- [ ] generation retry와 persistence retry 분리

## Phase 4 — Product reference vertical slice
- [ ] Current Asset Bible 요구
- [ ] product-main만 렌더 가능
- [ ] Product Sheet 기반 render prompt
- [ ] Product Intelligence / Identity Locks 반영
- [ ] image generation orchestration
- [ ] revision 저장
- [ ] revision 조회
- [ ] stale Asset Bible commit 거부
- [ ] API route
- [ ] fixture integration test

## Phase 5 — Continuity Director
- [ ] product geometry check
- [ ] product color check
- [ ] logo / label check
- [ ] material / finish check
- [ ] ContinuityCheck persistence
- [ ] failed check를 원본 render overwrite 없이 기록

## Phase 6 — Asset expansion / UI
- [ ] Hero reference
- [ ] Wardrobe reference
- [ ] Location reference
- [ ] Prop reference
- [ ] Assets 화면에 structured spec + reference image 결합
- [ ] stable key별 revision 표시
- [ ] Current / Out of date 표시
- [ ] Production Shot referenceImages 연결

## Phase 7 — 검증 / 릴리스
- [ ] PostgreSQL db:push
- [ ] TypeScript typecheck
- [ ] ESLint
- [ ] Next.js production build
- [ ] Playwright 전체 suite
- [ ] fixture deterministic CI
- [ ] live image provider smoke test
- [ ] source drift E2E
- [ ] persistence retry E2E
- [ ] 자체 점검
- [ ] PR
- [ ] main merge
- [ ] dev/main 동기화

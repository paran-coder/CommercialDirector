# Commercial Director v1.3.0 — Reference Asset Generation Checklist

## 현재 상태
- 개발 브랜치: `feature/v1.3.0-reference-assets`
- 기준 시작 SHA: `ca396a7bc3ea803dedb42a48d9f41bdf85f2658a`
- 검증 완료 코드 HEAD: `c575abdd21afbbfa752e19d10267469724dcd1fa`
- CI Run: `36851620176` — success
- 현재 완료 범위: Phase 0–4 Product Reference vertical slice
- 다음 단계: Phase 5 Continuity Director

## Phase 0 — 계획 / 기준선
- [x] v1.3.0 feature branch 생성
- [x] 시작 SHA 확인
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
- [x] `src/domain/reference-assets/schema.ts` 추가
- [x] ReferenceAsset schema
- [x] ReferenceAssetRevision schema
- [x] RenderRequest schema
- [x] RenderResult schema
- [x] ContinuityCheck schema
- [x] Asset Bible stable key 재사용 규칙
- [x] Product/Hero/Wardrobe/Location/Prop asset kind mapping
- [x] schema-level invalid-state validation
- [x] transient RenderResult와 persisted artifact 분리

### Phase 1 자체 점검
- 결과: 통과
- 평가: 9.6 / 10
- 보완: provider 결과의 base64를 revision에 직접 저장하지 않고 durable artifact ref로 분리

## Phase 2 — Persistence / Revision
- [x] PostgreSQL reference asset revision table
- [x] continuity check table
- [x] source Asset Bible revision binding
- [x] stable key + revision uniqueness
- [x] repository save contract
- [x] repository read contract
- [x] append-only 보장
- [x] Reference Asset Current / Out of date 판정에 필요한 source binding
- [x] source drift commit guard
- [x] generation job kind 확장
- [x] project/render request 교차 저장 방지

### Phase 2 자체 점검
- 결과: 통과
- 평가: 9.7 / 10
- 보완: revision 번호뿐 아니라 Campaign/shortlist 변경으로 Asset Bible 자체가 stale인 경우도 API boundary에서 재검증

## Phase 3 — Image Provider / Artifact Storage
- [x] ImageGenerationProvider interface
- [x] provider-neutral RenderRequest
- [x] transient RenderResult
- [x] fixture image provider
- [x] OpenAI image provider adapter
- [x] ImageArtifactStore interface
- [x] fixture artifact store
- [x] Vercel Blob private artifact store
- [x] image generation과 artifact/DB persistence retry 분리
- [x] generation_jobs에 대용량 base64 저장 방지
- [ ] provider error normalization 전용 계층

### Phase 3 자체 점검
- 결과: 통과
- 평가: 9.5 / 10
- 보완: live provider smoke test와 provider error normalization은 아직 남아 있음

## Phase 4 — Product Reference vertical slice
- [x] Current Asset Bible 요구
- [x] product-main target 고정
- [x] Product Sheet 기반 deterministic render prompt
- [x] Product Intelligence / Identity Locks 반영
- [x] image generation orchestration
- [x] artifact persistence
- [x] Reference Asset revision 저장
- [x] latest revision 조회 API
- [x] Current / Out of date 응답
- [x] Campaign / shortlist / Asset Bible source drift commit 거부
- [x] generation job tracking
- [x] persistence 실패 시 성공한 image generation 재실행 금지
- [x] fixture engine integration test

### Phase 4 자체 점검
- 결과: 통과
- 평가: 9.7 / 10
- 검증: CI `36851620176` 전체 성공

## Phase 5 — Continuity Director
- [ ] generated reference image 판독 경계
- [ ] product geometry check
- [ ] product color check
- [ ] logo / label check
- [ ] material / finish check
- [ ] ContinuityCheck persistence
- [ ] failed check를 원본 render overwrite 없이 기록
- [ ] repair/regeneration 정책

## Phase 6 — Asset expansion / UI
- [ ] Hero reference
- [ ] Wardrobe reference
- [ ] Location reference
- [ ] Prop reference
- [ ] private artifact read/presign 경계
- [ ] Assets 화면에 structured spec + reference image 결합
- [ ] stable key별 revision 표시
- [ ] Current / Out of date 표시
- [ ] Production Shot referenceImages 연결

## Phase 7 — 검증 / 릴리스
- [x] PostgreSQL db:push — Product vertical slice 기준
- [x] TypeScript typecheck — Product vertical slice 기준
- [x] ESLint — Product vertical slice 기준
- [x] Next.js production build — Product vertical slice 기준
- [x] Playwright 전체 suite — Product vertical slice 기준
- [x] fixture deterministic CI — Product vertical slice 기준
- [ ] live image provider smoke test
- [ ] source drift DB E2E
- [x] persistence retry engine E2E
- [x] Phase 0–4 자체 점검
- [ ] v1.3.0 전체 기능 완료
- [ ] PR
- [ ] main merge
- [ ] dev/main 동기화

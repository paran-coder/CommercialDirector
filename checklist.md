# Commercial Director v1.2.1 — Korean UX / Manual / OG Checklist

## Phase 0 — 계획
- [x] v1.2.1 feature branch 생성
- [x] context-notes.md 갱신
- [x] checklist.md 갱신
- [x] README.md 갱신
- [x] User manual.md 갱신
- [x] 한국어 UX / 상세 매뉴얼 / OG metadata 범위 승인

## Phase 1 — 한국어 UI
- [x] Root html lang을 ko로 변경
- [x] Header / 프로젝트 목록 한국어화
- [x] Product 업로드/분석 화면 한국어화
- [x] Creative Brief 화면 한국어화
- [x] Campaign Bible 화면 한국어화
- [x] Concepts / Concept Detail 화면 한국어화
- [x] Asset Bible 화면 한국어화
- [x] Production 화면 한국어화
- [x] 일반 상태/오류/빈 상태 한국어화
- [x] 핵심 제작 용어 영문 유지/병기

## Phase 2 — AI 사용자 결과 언어
- [x] Product Analyst 사용자 필드 한국어 지시
- [x] Campaign / Territory / Concept 사용자 필드 한국어 지시
- [x] Asset Bible 사용자 필드 한국어 지시
- [x] Treatment / Scene / Shot 사용자 필드 한국어 지시
- [x] provider/model/stable key 등 기술 식별자 영문 유지
- [x] fixture/demo 핵심 콘텐츠 한국어화
- [x] 기존 저장 revision 자동 덮어쓰기 금지

## Phase 3 — 상세 사용자 매뉴얼 페이지
- [x] /manual route 추가
- [x] 전체 워크플로 설명
- [x] 단계별 화면 설명
- [x] shortlist / revision / stale 설명
- [x] Asset Bible 상세 설명
- [x] Production Plan 상세 설명
- [x] Prompt IR / provider prompt 설명
- [x] 문제 해결 섹션
- [x] Header에서 접근 링크
- [x] 프로젝트 navigation에서 접근 링크

## Phase 4 — OG metadata
- [x] title/description 한국어 보정
- [x] Open Graph image /og-image.png 등록
- [x] 1200×630 dimensions 등록
- [x] Twitter summary_large_image 등록
- [x] NEXT_PUBLIC_SITE_URL / Vercel URL metadataBase 대응
- [x] 실제 이미지 미존재 상태에서도 build 가능 확인

## Phase 5 — 검증
- [x] PostgreSQL db:push
- [x] TypeScript typecheck
- [x] ESLint
- [x] Production build
- [x] Playwright 전체 suite — 16/16
- [x] 매뉴얼 route E2E
- [x] 핵심 한국어 UI E2E
- [x] OG metadata E2E
- [x] 자체 점검 — 9.7/10
- [ ] Release-prep commit CI
- [ ] PR / squash merge
- [ ] main CI
- [ ] dev/main 동기화

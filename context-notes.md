# Commercial Director v1.2.1 — Context Notes

## 목적
v1.2.1은 기능 확장보다 사용성 보정에 집중하는 한국어 UX 핫픽스다.

## 완료 범위
1. 사용자에게 노출되는 고정 UI 문구를 한국어로 전환했다.
2. Campaign, Concept, Asset Bible, Production Plan 등 새로 생성되는 사용자용 AI 자유 서술 필드는 한국어로 생성하도록 role prompt를 변경했다.
3. 제작 파이프라인에서 의미가 고정된 핵심 용어와 식별자는 영문을 유지한다.
4. 앱 내부에 상세 사용자 매뉴얼 페이지를 추가했다.
5. 향후 1200×630 OG 이미지를 넣을 수 있도록 metadata에 `/og-image.png`를 예약했다.
6. 사용자에게 노출되는 주요 API 오류 문구를 한국어로 바꿨다.

## 언어 정책

### 한국어 우선
다음은 한국어를 우선한다.
- 버튼
- 설명
- 상태
- 에러
- 빈 상태
- 도움말
- 섹션 설명
- AI가 생성하는 제목/아이디어/제작 지시 등 사용자용 자유 서술

### 영문 유지/병기
다음은 원문 또는 표준 식별자를 유지한다.
- Commercial Director
- Campaign Bible
- Asset Bible
- Product Sheet
- Hero
- Wardrobe
- Scene Graph
- Shotlist
- Prompt IR
- Seedance / Kling / Veo
- stable key / canonical key
- schema enum
- concept ID
- provider/model 이름

Provider compiler는 Prompt IR을 provider용 형식으로 정리할 뿐 새로운 창작 사실을 추가하지 않는다. 따라서 compiled prompt에는 영문 기술 구문과 한국어 사용자 서술이 함께 포함될 수 있다.

## 기존 데이터
기존 프로젝트에 이미 저장된 영문 revision은 데이터 보존 원칙상 자동 번역하거나 덮어쓰지 않는다. 재생성되는 revision부터 새 한국어 생성 계약을 따른다.

## 사용자 매뉴얼
앱 경로: `/manual`

포함 내용:
- 전체 작업 흐름
- Product → Brief → Campaign → Concepts → Assets → Production 단계 설명
- Product Intelligence / Identity Locks
- shortlist와 revision
- Current / Out of date
- Campaign Bible / Asset Bible
- 15/30/45초 Production Plan
- Scene Graph / Shotlist
- Prompt IR / provider prompt
- 재생성 시 주의점
- 현재 버전의 범위
- 문제 해결

Header와 프로젝트 navigation 모두에서 접근할 수 있다.

## OG metadata
예약 파일:
- public path: `/og-image.png`
- 권장 크기: 1200×630

등록:
- Open Graph image
- og:image width 1200
- og:image height 630
- Twitter summary_large_image
- locale ko_KR

metadataBase 우선순위:
1. `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_PROJECT_PRODUCTION_URL`
3. `VERCEL_URL`
4. localhost fallback

실제 이미지 파일은 사용자가 나중에 `public/og-image.png`로 추가한다.

## 검증
Feature implementation head에서 다음 gate가 모두 통과했다.
- PostgreSQL db:push
- TypeScript
- ESLint
- Next.js production build
- Playwright 16/16

Playwright에는 한국어 핵심 흐름, /manual route, OG/Twitter metadata 검증이 포함된다.

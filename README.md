# Commercial Director v1.2.1 — Korean UX Hotfix

Commercial Director v1.2.1은 v1.2.0 Production Planning 기능은 그대로 유지하면서 한국어 사용성과 온보딩을 보강한다.

## 변경 사항

- 일반 UI 문구 한국어화
- 새로 생성되는 사용자용 AI 결과를 한국어 우선으로 변경
- 핵심 제작 용어(Asset Bible, Shotlist, Prompt IR, Seedance/Kling/Veo 등)는 영문 유지/병기
- 앱 내부 상세 사용자 매뉴얼 `/manual` 추가
- Header / 프로젝트 navigation에 매뉴얼 진입점 추가
- Open Graph / Twitter metadata에 `/og-image.png` 예약
- OG 이미지 권장 크기 1200×630
- `html lang="ko"` 적용
- 주요 API 사용자 오류 문구 한국어화

## 언어 원칙

사용자가 판단하고 읽어야 하는 버튼, 설명, 상태, AI 자유 서술 필드는 한국어를 우선한다.

다음 제작 계약은 영문 또는 원래 식별자를 유지한다.
- Commercial Director
- Campaign Bible / Asset Bible / Product Sheet
- Hero / Wardrobe / Scene Graph / Shotlist / Prompt IR
- Seedance / Kling / Veo
- canonical key / stable key
- schema enum, concept ID, provider/model 이름

Provider용 compiled prompt는 같은 Prompt IR의 내용을 그대로 보존하므로 한국어 서술과 영문 기술 구문이 함께 포함될 수 있다. Compiler는 새로운 창작 사실을 추가하지 않는다.

기존 저장 revision은 보존한다. 이미 생성된 영문 Campaign/Concept/Asset Bible/Production Plan을 자동 변환하지 않으며 재생성되는 결과부터 한국어 생성 지시를 적용한다.

## 사용자 매뉴얼

앱에서 `/manual`을 열면 다음을 확인할 수 있다.
- Product → Brief → Campaign → Concepts → Assets → Production 전체 흐름
- Identity Locks
- shortlist
- Campaign Bible / Asset Bible
- 15/30/45초 Treatment
- Scene Graph / Shotlist
- Prompt IR / provider prompt
- revision
- Current / Out of date
- 문제 해결

## OG 이미지

추후 다음 파일을 추가하면 된다.

`public/og-image.png`

권장 크기: **1200×630**

v1.2.1 metadata에는 이미 다음이 등록되어 있다.
- Open Graph image: `/og-image.png`
- width: `1200`
- height: `630`
- Twitter card: `summary_large_image`

실제 배포 도메인은 `NEXT_PUBLIC_SITE_URL`을 권장하며, 없으면 Vercel production/preview URL을 사용하고 로컬에서는 `http://localhost:3000`으로 fallback한다.

## Quality gate

Feature implementation 기준:
- PostgreSQL schema push — 성공
- TypeScript — 성공
- ESLint — 성공
- Next.js production build — 성공
- Playwright — **16/16 성공**

## Version

Commercial-Director-v1.2.1

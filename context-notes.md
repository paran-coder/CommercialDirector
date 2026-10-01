# Commercial Director v1.2.1 — Context Notes

## 목적
v1.2.1은 기능 확장보다 사용성 보정에 집중하는 한국어 UX 핫픽스다.

## 변경 범위
1. 사용자에게 노출되는 고정 UI 문구를 한국어로 전환한다.
2. Campaign, Concept, Asset Bible, Production Plan 등 새로 생성되는 사용자용 AI 결과는 한국어로 생성한다.
3. 제작 파이프라인에서 의미가 고정된 핵심 용어와 식별자는 영문을 유지한다.
4. 앱 내부에 상세 사용자 매뉴얼 페이지를 추가한다.
5. 향후 1200×630 OG 이미지를 넣을 수 있도록 metadata에 `/og-image.png`를 예약한다.

## 언어 정책

### 한국어 우선
버튼, 설명, 상태, 에러, 빈 상태, 도움말, 섹션 설명 등 일반 UI는 한국어로 표시한다.

### 영문 유지
다음은 원문/표준 용어를 유지한다.
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
- 실제 provider용 compiled prompt

필요할 때 첫 노출에서는 한국어 설명을 함께 붙인다.

### AI 결과
Product Intelligence, Campaign Bible, Territory, Concept, Asset Bible, Treatment/Scene/Shot의 사용자 가독성 필드는 한국어로 생성하도록 role prompt를 변경한다.
Prompt IR의 compiled provider prompt는 모델 호환성을 위해 영문 중심으로 유지한다.

기존 프로젝트에 이미 저장된 영문 revision은 데이터 보존 원칙상 자동 번역/덮어쓰기하지 않는다. 재생성되는 revision부터 새 언어 계약을 따른다.

## 사용자 매뉴얼
앱 경로: `/manual`

포함 내용:
- 전체 작업 흐름
- Product → Brief → Campaign → Concepts → Assets → Production 단계 설명
- shortlist와 revision 개념
- Current / Out of date 의미
- Asset Bible의 각 섹션
- 15/30/45s Production Plan 읽는 법
- Prompt IR / provider prompt 설명
- 재생성 시 주의점
- 현재 버전에서 가능한 것 / 아직 안 되는 것
- 문제 해결 항목

Header와 프로젝트 navigation에서 접근 가능해야 한다.

## OG metadata
예약 파일:
- public path: `/og-image.png`
- 권장 크기: 1200×630

Next Metadata에 Open Graph와 Twitter summary_large_image를 같이 설정한다.
실제 이미지 파일은 사용자가 나중에 추가할 수 있으므로 이번 변경에서는 태그만 선반영한다.

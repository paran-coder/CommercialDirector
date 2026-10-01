# Commercial Director v1.2.1 — 사용자 매뉴얼

앱 내부 상세 매뉴얼은 `/manual`에서 제공한다.

## 빠른 흐름

`Product → Brief → Campaign → Concepts → Assets → Production`

1. 제품 이미지를 업로드하고 Product Intelligence를 확인한다.
2. Creative Brief에 브랜드 성격, 타깃, 핵심 효익, 무드를 입력한다.
3. Campaign Bible과 4개 Territory, 20개 Concept를 생성한다.
4. 실제로 제작할 Concept 1–5개를 shortlist한다.
5. Asset Bible을 생성해 Product Sheet, Hero, Wardrobe, Locations, Props의 연속성을 고정한다.
6. Production Plan을 생성해 15/30/45초 Treatment, Scene Graph, Shotlist, Prompt IR을 만든다.

## 언어
일반 설명과 새 AI 결과는 한국어를 우선한다. Asset Bible, Prompt IR, Seedance/Kling/Veo, stable key 같은 제작 표준 용어와 식별자는 영문을 유지한다. Provider용 compiled prompt는 Prompt IR의 내용을 보존하므로 한국어 서술과 영문 기술 구문이 함께 나타날 수 있다.

기존 저장 revision은 자동 번역하지 않는다. 재생성하는 새 revision부터 한국어 생성 규칙을 적용한다.

## Revision
AI 결과를 다시 생성하면 기존 결과를 덮어쓰지 않고 새 revision을 추가한다.

## Current / Out of date
- Current · 최신: 현재 상위 소스와 일치하는 최신 결과
- Out of date · 재생성 필요: Campaign, shortlist, Asset Bible 또는 Concept revision이 바뀌어 이전 결과가 현재 소스와 맞지 않는 상태

Out of date 결과는 기록으로 남고, 현재 소스를 기준으로 다시 생성하면 새 revision이 추가된다.

## 상세 설명
앱의 `/manual` 페이지에는 Product부터 Production까지 단계별 사용법, Campaign Bible/Asset Bible 구성, Production Plan과 Prompt IR 읽는 법, 문제 해결 방법을 상세하게 제공한다.

## OG 이미지
추후 `public/og-image.png`에 **1200×630** 이미지를 넣으면 Open Graph와 Twitter 공유 이미지로 사용된다.

배포 도메인이 확정되면 환경변수에 다음을 넣는 것을 권장한다.

```
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

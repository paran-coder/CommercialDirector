# Commercial Director v1.3.0 — 사용자 매뉴얼

앱 내부 상세 매뉴얼은 `/manual`에서 제공한다.

이 문서는 v1.3.0 개발 범위를 설명한다. Reference Asset 기능은 구현 단계에 따라 순차적으로 노출된다.

## 기본 흐름

`Product → Brief → Campaign → Concepts → Assets → Production`

1. 제품 이미지를 업로드하고 Product Intelligence와 Identity Locks를 확인한다.
2. Creative Brief를 작성한다.
3. Campaign Bible, 4개 Territory, 20개 Concept를 생성한다.
4. 제작할 Concept 1–5개를 shortlist한다.
5. Asset Bible을 생성해 Product Sheet, Hero, Wardrobe, Locations, Props의 제작 사양을 고정한다.
6. v1.3.0에서는 Asset Bible의 stable key를 기준으로 Reference Asset을 생성한다.
7. Reference Asset의 continuity를 검사한다.
8. Current Reference Asset을 이후 Production Shot의 reference로 연결한다.

## Reference Asset

Reference Asset은 Asset Bible의 구조화된 사양을 시각적으로 고정하기 위한 이미지다.

예:
- `product-main` → Product reference
- `hero-primary` → Hero reference
- `wardrobe-01` → Wardrobe reference
- `location-01` → Location reference
- `prop-01` → Prop reference

Reference Asset의 stable key는 생성 모델이 정하지 않는다. 기존 Asset Bible의 stable key를 그대로 사용한다.

## 첫 구현 범위

v1.3.0의 첫 vertical slice는 `product-main`이다.

```
Asset Bible Product Sheet
→ Product reference 생성
→ Reference Asset revision 저장
→ Current / Out of date 판정
→ continuity 검사
```

Product 경로가 안정된 뒤 Hero, Wardrobe, Location, Prop으로 확장한다.

## Revision

Reference image를 다시 생성해도 기존 이미지를 덮어쓰지 않는다.

예:
```
product-main r1
product-main r2
product-main r3
```

과거 revision은 기록으로 보존한다.

## Current / Out of date

Reference Asset은 자신이 생성될 때 사용한 Asset Bible revision에 묶인다.

- **Current · 최신**: 현재 Asset Bible revision과 source binding이 일치한다.
- **Out of date · 재생성 필요**: 상위 Asset Bible이 변경되어 기존 reference image가 현재 사양과 일치한다고 보장할 수 없다.

Out of date 이미지는 삭제하지 않는다.

## Continuity Check

첫 Product continuity 검사는 다음을 대상으로 한다.
- 제품 형상 / geometry
- 제품 색상
- logo / label
- material / finish

ContinuityCheck 역시 생성 이미지 자체를 덮어쓰지 않고 별도 결과로 기록한다.

후속 단계에서 다음을 추가한다.
- Hero identity
- Wardrobe
- Location material language
- Prop identity
- Lighting continuity

## Production 연결

Reference Asset이 안정되면 Production Shot에서 기존 `assetRefs`를 실제 reference image로 해석한다.

목표 구조:

```
Shot
→ assetRefs
→ referenceImages
→ render prompt
```

## 현재 비범위

v1.3.0에서는 video generation을 제공하지 않는다.

영상 생성, shot regeneration, timeline assembly, packshot, social cutdowns는 image continuity가 안정된 이후 v2.0.0에서 다룬다.

## 기존 Revision 정책

Campaign, Concept, Asset Bible, Production Plan과 마찬가지로 Reference Asset도 append-only 원칙을 따른다. 상위 source가 바뀌어 Out of date가 되더라도 이전 결과는 기록으로 남는다.

## 문제 해결

### Reference Asset을 만들 수 없음
Current Asset Bible이 있는지 먼저 확인한다.

### 생성 중 Asset Bible을 수정함
완료 시점에 source가 달라졌다면 저장을 거부하고 현재 Asset Bible 기준으로 다시 생성해야 한다.

### 생성은 성공했는데 저장 실패
이미지 generation과 persistence retry는 분리한다. 저장 실패만으로 provider generation을 자동 재실행하지 않는 것이 원칙이다.

### 이전 reference image가 Out of date로 표시됨
오류가 아니라 상위 Asset Bible이 변경됐다는 뜻이다. 과거 revision은 보존되고 새 source 기준으로 새 revision을 만들 수 있다.

## 목적
- "예시 데이터 불러오기"로 구성된 스터디 상세 페이지(동적 섹션 기반)가 하드코딩 테코테코 페이지(`/study/1-tecoteco`)와 콘텐츠/DOM/CSS/UI까지 1:1로 동일하게 보이도록 정합성을 확보한다.
- 본 문서는 하드코딩 페이지와 동적 섹션 렌더러 간의 모든 미세 차이를 누락 없이 기록하고, 각각의 해결 방안을 제시한다. 코드 수정은 본 문서의 범위를 벗어나며, 이 파일은 분석 및 TODO 정리용이다.

## 범위
- 전역/레이아웃 영향 요소
- Hero 섹션
- Reviews 섹션
- Members 섹션
- Experience 섹션
- FAQ(+ Join CTA) 섹션
- Journey 섹션
- 데이터 시딩/예시 데이터 적용 방식

## 핵심 요구사항
- 하드코딩 페이지(`/study/1-tecoteco`)와 동적 상세 페이지(섹션 조합 + 예시 데이터)가 픽셀 및 동작 수준에서 동일해야 한다.
- 콘텐츠(문구), DOM 구조(class 구조 포함), CSS 스타일(컬러/폰트/여백/라인), UI 동작(정렬/로딩/상호작용)까지 포함한다.

---

## 상세 비교 및 차이점

### 1) 전역/레이아웃 레벨
- 섹션 래퍼 배경색 충돌 가능성
  - 동적 렌더러에서 섹션 컨테이너에 기본 배경색을 강제 적용하는 규칙 존재.
    ```
    web/src/components/studyDetailPage/StudyDetailPageRenderer.css
    .section-wrapper > div[class*="study-detail-"] { background-color: #1a1a1a; }
    ```
  - 하드코딩 Hero는 배경 `#0d0d0d`. 우선순위/로딩 순서에 따라 동적 Hero가 `#1a1a1a`처럼 보일 가능성.
  - 대책: 해당 규칙의 스코프를 일반 섹션으로 한정하거나, Hero 섹션에는 적용되지 않도록 선택자 정제/우선순위 조정.

- 랜딩 글로벌 스타일 잔존으로 인한 타이틀 글로우 이슈
  - 문서화된 기존 이슈: 랜딩 전용 `.section-title` 글로우가 상세 페이지로 전파됨.
    - 참고: `web/docs/todo/STUDY_DETAIL_SECTION_TITLE_GLOW_TODO.md`
  - 대책: 상세 페이지 진입 시 해당 전역 규칙을 리셋하거나, 랜딩 전용 범위로 스코프 다운.

### 2) Hero 섹션
- DOM 태그/클래스
  - 하드코딩: `<section class="tecoteco-hero-section">`
  - 동적: `<div class="study-detail-hero-section">`
  - 영향: 기본 리셋 스타일/섹션 간 여백이 달라질 수 있음.

- 하이라이트 색상 차이(노랑 → 연두로 변질 가능)
  - 동적 Hero에서 `richtext-highlight`가 별도 색으로 지정되어 노랑(#ffea00)이 연두(#c3e88d)로 바뀌는 케이스 존재.
    ```
    web/src/components/studyDetailPage/sections/HeroSection.css
    .hero-subtitle .richtext-highlight { color: #c3e88d; }
    ```
  - 하드코딩 Hero는 기본 `.highlight` 노랑(#ffea00) 사용.
    ```
    web/src/pages/TecoTecoPage/TecoTecoPage.css
    .highlight { color: #ffea00; }
    ```
  - 대책: Hero 섹션 내 하이라이트는 노랑(#ffea00)로 고정. RichText 렌더러 테마/클래스 충돌 제거.

- InfoBox 폰트 지정 차이(경미)
  - 동적 InfoBox 일부에 `font-family: 'PretendardVariable'` 지정. 하드코딩은 폰트 미지정.
  - 대책: 테코테코 Hero InfoBox 폰트 지정 통일.

### 3) Reviews(후기) 섹션
- 키워드 노출 로직 차이(핵심)
  - 동적 렌더러는 항상 “리뷰 데이터에서 추출”한 키워드만 사용하도록 고정.
    ```
    web/src/components/studyDetailPage/sections/ReviewsSection.tsx
    // const displayKeywords = extractedKeywords; // 수동 키워드 무시
    ```
  - 하드코딩은 고정 키워드 배열을 항상 노출.
    ```
    web/src/pages/TecoTecoPage/sections/ReviewsSection.tsx
    tecotecoKeywords.map(...)
    ```
  - 대책: 표시 모드 옵션화(자동/수동/혼합) 또는 최소 수동 키워드 fallback 허용. 테코테코 모드는 수동 키워드를 우선 사용하도록.

- 섹션 서브타이틀 하이라이트 색상 차이
  - 동적 리뷰 CSS는 `.highlight`를 연두로 고정.
    ```
    web/src/components/studyDetailPage/sections/ReviewsSection.css
    .tecoteco-reviews-section .highlight { color: var(--color-primary, #c3e88d); }
    ```
  - 하드코딩은 전역 `.highlight` 노랑(#ffea00) 사용.
  - 대책: 테코테코 리뷰 섹션 하이라이트는 노랑으로 통일.

- 데이터 매핑 차이(이모지/좋아요 표기)
  - 하드코딩: `emojis`/`likes`를 카드에 그대로 사용.
  - 동적: API의 `tags[].emoji`가 없으면 기본 이모지 배열로 대체, `helpfulCount` 사용.
  - 대책: 표기 라벨/이모지 정책을 하드코딩 기준으로 맞추는 가이드 정립(아이콘, 용어 "좋아요"/"도움됐어요" 등).

- 시간 표기 포맷
  - 하드코딩: `timeAgo`(예: "6달 전") 고정 문자열.
  - 동적: `createdAt`만 있으면 `toLocaleDateString()` 표시.
  - 대책: 상대시간 포맷터 도입으로 “~전” 표기 일치.

- 데이터/문구 동일성
  - 에디터 예시(`sampleTecotecoReviews`)의 제목/본문은 하드코딩과 동일하게 구성되어 있음.
  - 단, 렌더러가 API 우선으로 가져오므로 실제 표시가 DB 상태에 종속.

### 4) Members(함께하는 사람들) 섹션
- 섹션 제목 예시 불일치
  - 하드코딩: "더 멋진 여정이 펼쳐질 거예요, (줄바꿈) 함께라면."
  - 동적 예시 로더: "함께하는 사람들"
  - 대책: 예시 데이터의 타이틀/부제목을 하드코딩과 동일 문구로 일치.

- 통계 섹션 표시 여부 디폴트
  - 하드코딩: 내부 상수 기반 통계 UI 항상 표시.
  - 동적: `showStats && stats`일 때만 표시.
  - 대책: 예시 데이터 로드시 `showStats=true` + `stats` 기본값(하드코딩 수치와 동일) 제공.

- UI 디테일
  - MVP 배지/호버 오버레이/무한 캐러셀 등 핵심 구조는 거의 동일하게 이식됨. 큰 차이 없음.

### 5) Experience(“테코테코 모임을 한다는 건”) 섹션
- 네비게이션 클래스명 차이
  - 하드코딩: `.tecoteco-steps-nav`
  - 동적: `.steps-nav` (CSS는 `.tecoteco-experience-section .steps-nav`로 커버)
  - 대책: 클래스 네이밍 통일 또는 선택자 보강(기능상 유사하나 유지보수 관점에서 통일 권장).

- 최소 높이/여백 차이
  - 하드코딩 CSS: `min-height: 50vh` 지정.
  - 동적 CSS: 최소 높이 미지정.
  - 대책: 동적에도 동일 최소 높이 적용.

- 부제 하이라이트 색상
  - 본 섹션은 하드/동적 모두 `.highlight` 연두(#C3E88D)로 일치.

### 6) FAQ(+ Join CTA) 섹션
- 제목/태그헤더 기본값 차이
  - 하드코딩: 태그헤더 "궁금증 해결", 제목 "FAQ".
  - 동적 기본: 제목 "자주 묻는 질문" 등.
  - 대책: 예시 데이터 로드시 태그헤더/제목을 하드코딩과 동일 문구로 셋업.

- Join CTA 블록
  - 동적 컴포넌트가 테코테코 테마일 때 CTA 텍스트/버튼 문구 기본 설정이 하드코딩과 거의 동일하나, 기본값과 실제 예시 주입 값의 일치 확인 필요.

### 7) Journey(우리의 여정) 섹션
- 동적 쪽은 `{days}` 치환/통계 카드 등 옵션이 더 풍부하여 기본값에 따라 시각 차이가 발생 가능.
- 대책: 예시 데이터로 레이아웃/옵션을 하드코딩 상태에 맞추기(아이콘/배지/강조색 포함).

### 8) 예시 데이터/시딩 스크립트 관련
- 예시 리뷰/문구는 하드코딩과 일치하도록 준비되어 있음.
  - `web/src/components/studyDetailPage/types/reviewTypes.ts`의 `sampleTecotecoReviewData`, `sampleTecotecoReviews` 확인.
- 실제 렌더는 API 데이터 우선 사용 → 하드코딩과 동일한 표시를 위해서는 대상 스터디에 리뷰 시딩 필요.
  - 스크립트 참고: `web/scripts/add-tecoteco-reviews.sh`, `web/scripts/add-backend-deep-dive-reviews*.sh`

---

## 해결 과제(TODO)
- 전역/레이아웃
  - [ ] 상세 페이지에서 랜딩 전역 `.section-title` 글로우 미적용 보장(스코프 축소/리셋)
  - [ ] `.section-wrapper > div[class*="study-detail-"]` 배경 규칙이 Hero를 덮지 않도록 선택자 조정

- Hero
  - [ ] `richtext-highlight`가 Hero에서 노랑(#ffea00)로 렌더링되도록 테마/클래스 충돌 제거
  - [ ] InfoBox 폰트/여백/라인 스타일을 하드코딩과 1:1 매칭(폰트 지정 포함)
  - [ ] DOM 구조 차이로 인한 여백/섹션 간 간격 불일치 확인 및 교정

- Reviews
  - [ ] 키워드 표시 로직: 자동/수동/혼합 모드 지원 또는 최소 수동 키워드 fallback 허용(테코테코는 수동 우선)
  - [ ] 하이라이트 색상 노랑(#ffea00)로 통일
  - [ ] 시간 표기 상대시간("~전") 포맷 적용
  - [ ] 이모지/좋아요 라벨 표기 정책을 하드코딩과 동일하게 정리

- Members
  - [ ] 예시 데이터 타이틀/부제목을 하드코딩 문구로 일치시킴
  - [ ] 예시 데이터 로드시 `showStats=true` + 동일 통계값 기본 제공

- Experience
  - [ ] 동적 CSS에 `min-height: 50vh` 적용
  - [ ] 네비게이션 클래스/스타일 네이밍 통일 및 연결선/hover 효과 동일화

- FAQ(+ Join CTA)
  - [ ] 태그헤더/제목/CTA 문구를 하드코딩과 동일 문구로 기본 세팅(예시 버튼 액션 문구 포함)

- Journey
  - [ ] 레이아웃/옵션(아이콘/배지/강조색/통계 카드)을 하드코딩 상태로 고정하는 예시 프리셋 제공

- 데이터/시딩
  - [ ] 대상 스터디에 테코테코 리뷰 시딩(문구/점수/이모지/참석 수/timestamp 포함)
  - [ ] 예시 데이터가 저장되었을 때 API 우선 로딩과의 충돌 시, 우선순위 정책 문서화(예: "미리보기는 예시 우선, 출시는 API 우선")

## 수용 기준(DoD)
- /study/1-tecoteco vs /study/tecoteco (또는 동적 상세 경로) 비교 시 픽셀/색상/폰트/여백/라인/아이콘/문구/상호작용까지 1:1 매칭
- E2E 시나리오
  - [ ] 메인(랜딩) → 상세 페이지 라우팅 후에도 글로우 누출 없음
  - [ ] "예시 데이터 불러오기"만으로 하드코딩과 동일 구성이 복원
  - [ ] API 시딩 후에도 표시 결과가 하드코딩과 동일(정렬/키워드/시간 표기 포함)

## 테스트/검증 가이드
- 시나리오별 수동 체크리스트
  - [ ] Hero: 타이틀 줄바꿈/하이라이트 색/이미지 보더/인포박스 라인/폰트 일치
  - [ ] Reviews: 키워드 목록/카드 그리드/hover/더보기 버튼/스켈레톤/시간 포맷/좋아요/이모지 일치
  - [ ] Members: 무한 캐러셀 속도/블러 효과/MVP 배지/호버 팝업/모달 레이아웃/통계 카드 일치
  - [ ] Experience: 네비게이션 모양/라인/활성 효과/일러스트 크기/최소 높이/애니메이션 일치
  - [ ] FAQ: 아코디언 토글 아이콘/문구/CTA 버튼 문구/액션 일치
  - [ ] Journey: 레이아웃(리스트/카드/타임라인) 및 강조색/배지/이미지 헤더 일치

## 관련 파일/경로(참고)
- 하드코딩 페이지
  - `web/src/pages/TecoTecoPage/TecoTecoPage.tsx`
  - `web/src/pages/TecoTecoPage/sections/*` (Hero/Reviews/Members/Experience/FAQ/Journey 등)
  - `web/src/pages/TecoTecoPage/TecoTecoPage.css`
- 동적 상세 (렌더/섹션/에디터)
  - `web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
  - `web/src/components/studyDetailPage/sections/*`
  - `web/src/components/studyDetailPage/editor/forms/*`
  - `web/src/components/studyDetailPage/types/*`
- 전역/라우팅
  - `web/src/router/subRouter.tsx` (레거시 라우트 `/study/1-tecoteco`)
- 스크립트/문서
  - `web/scripts/add-tecoteco-*.sh`
  - `web/docs/todo/STUDY_DETAIL_SECTION_TITLE_GLOW_TODO.md`

## 리스크/주의사항
- 전역 CSS(특히 랜딩용)의 누출로 인해 상세 페이지 스타일이 변질될 수 있음 → 라우팅 전후 상태 기반으로 재현 테스트 필수
- 에디터 예시 데이터 vs API 실제 데이터 우선순위에 따라 표시 결과 달라짐 → 명확한 정책 필요
- 하이라이트 클래스(`.highlight` vs `.richtext-highlight`) 충돌 → 색상 일관성 테스트 필요(Hero/Reviews 구간)

## 후속 작업 제안(권장)
- "테코테코 테마 모드"를 도입해 해당 테마에서 모든 섹션의 컬러/하이라이트/여백/폰트/버튼 스타일을 통합 관리
- 예시 데이터 프리셋을 하드코딩 페이지에서 자동 추출→적용하는 Dev 스크립트 제공(실수 최소화)
- 시각 스냅샷 테스트(퍼시픽/픽셀매치 계열)로 회귀 방지

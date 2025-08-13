# TODO: 스터디 디테일 페이지의 `.section-title` 글로우 누수 차단

## 배경
- 랜딩 전용 글로벌 스타일(`web/src/styles/common-landing.css`)에 `.section-title { text-shadow: 0 0 20px rgba(195, 232, 141, 0.5) }`가 정의되어 있음.
- SPA 라우팅 특성상 메인 페이지를 거친 세션에서는 해당 전역 규칙이 문서 전체에 남아 이후 라우트(예: /study/:slug)에도 적용됨.
- 스터디 디테일 페이지는 `/study/1-tecoteco` 하드코딩 페이지와 시각적으로 동일해야 하는데, 글로벌 규칙으로 인해 `.section-title`에 의도치 않은 글로우가 생김.

## 해야 할 일
- 랜딩 전용 스타일의 전역 셀렉터 축소 또는 네임스페이싱으로 누수 차단.

### 옵션 A: 스코프 한정(권장)
- `web/src/styles/common-landing.css`의 `.section-title` 등 전역 셀렉터를 `.landing .section-title`로 변경.
- `web/src/pages/MainPage.tsx` 루트 엘리먼트에 `className="landing"` 추가.

### 옵션 B: 클래스 네임 분리
- 랜딩 전용 타이틀 클래스를 `landing-section-title`로 변경하고 컴포넌트들에서 해당 클래스로 교체.

### 옵션 C: 디테일 페이지에서 리셋
- `web/src/components/studyDetailPage/StudyDetailPageRenderer.css`에 다음 리셋 추가(임시 방편):
  - `.study-detail-page-renderer .section-title { text-shadow: none; }`

## 근거
- git blame: 글로우 최초 도입은 `src/styles/common.css`(commit 2afecd5b, author: mihioon), 이후 `src/styles/common-landing.css`로 분리 유지(commit cfbcd30e, author: mihioon).
- 스터디 디테일 관련 FAQ/Section 파일에서는 `.section-title` 수정 없음.

## 완료 조건(Definition of Done)
- `/study/1-tecoteco`와 스터디 디테일 렌더러가 시각적으로 일치(글로우 없음).
- 랜딩 페이지(/)는 기존 의도한 글로우 유지.
- E2E: 메인(/) → 스터디 디테일(/study/1-tecoteco) 라우팅 시에도 글로우가 디테일 페이지에 나타나지 않음.

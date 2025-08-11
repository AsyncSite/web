# RichTextSection TecoTeco 테마 자동 스타일링 이슈

## 📋 문제 설명

### 현재 상황
RichTextSection 컴포넌트에서 TecoTeco 테마 사용 시, 특정 HTML 속성을 가진 요소들이 자동으로 다른 스타일로 변환되는 문제가 있습니다.

### 구체적 예시
**입력된 HTML:**
```html
<p style="text-align: center; font-size: 1.1rem;">
  우리가 찾는 건 변화 속에서도 흔들리지 않을 '나'<br/>
  생각하는 힘이에요.
</p>
```

**실제 렌더링 결과:**
- 중앙 정렬이 왼쪽 정렬로 강제 변경
- Callout 박스 스타일 자동 적용 (녹색 테두리, 배경색)
- 폰트 크기 변경 (1.3rem)
- 패딩 추가 (20px)

## 🔍 원인 분석

### 파일 위치
`/src/components/studyDetailPage/sections/RichTextSection.css` (209-219번 라인)

### 문제의 CSS 규칙
```css
.tecoteco-theme .tecoteco-content p[style*="text-align: center"] {
  font-size: 1.3rem !important;
  color: #f0f0f0 !important;
  margin-top: 35px;
  font-weight: 600;
  padding: 20px;
  background-color: rgba(195, 232, 141, 0.05);
  border-left: 4px solid #c3e88d;
  border-radius: 0 8px 8px 0;
  text-align: left !important; /* 중앙 정렬 오버라이드 */
}
```

### 작동 메커니즘
1. TecoTeco 테마가 적용된 RichTextSection은 `text-align: center` 스타일을 가진 모든 `<p>` 태그를 찾음
2. 해당 태그를 자동으로 "CTA(Call-to-Action) 또는 Callout 박스"로 간주
3. 원래 스타일을 무시하고 미리 정의된 callout 스타일 강제 적용

## ⚠️ 문제점

### 1. 사용자 의도 무시
- 사용자가 실제로 중앙 정렬을 원할 때도 강제로 변경됨
- HTML 직접 입력 모드의 장점 상실

### 2. 일관성 부재
- 편집기 미리보기와 실제 렌더링 결과가 다름
- WYSIWYG(What You See Is What You Get) 원칙 위반

### 3. 유연성 제한
- 사용자가 원하는 스타일을 정확히 구현할 수 없음
- 테마가 너무 강압적으로 작동

## 💡 해결 방안

### 방안 1: CSS 규칙 제거 (권장)
**장점:**
- 사용자 의도대로 정확히 렌더링
- 미리보기와 실제 결과 일치
- HTML 모드의 자유도 보장

**단점:**
- 기존 TecoTeco 스타일 페이지들이 깨질 수 있음

**구현:**
```css
/* 이 규칙을 제거하거나 주석 처리 */
/* .tecoteco-theme .tecoteco-content p[style*="text-align: center"] { ... } */
```

### 방안 2: 명시적 클래스 사용
**장점:**
- 의도적으로 callout을 원할 때만 적용
- 더 명확한 마크업

**구현 예시:**
```html
<!-- Callout을 원할 때 -->
<div class="tecoteco-callout">
  <p>우리가 찾는 건 변화 속에서도...</p>
</div>

<!-- 일반 중앙 정렬 -->
<p style="text-align: center;">일반 중앙 정렬 텍스트</p>
```

### 방안 3: 템플릿 시스템 구축
**장점:**
- Journey, HowWeRoll처럼 구조화된 입력
- 일관된 스타일 보장
- 사용자 친화적

**구현 방향:**
- RichTextSection에도 템플릿 빌더 추가
- Callout, Quote, Highlight 등 컴포넌트화
- Visual Editor에서 버튼으로 삽입

## 📌 권장 사항

### 단기 해결책
1. CSS 규칙 제거 또는 수정
2. 기존 콘텐츠 영향도 확인
3. 필요시 마이그레이션 스크립트 작성

### 장기 해결책
1. RichText 섹션도 다른 섹션처럼 구조화된 템플릿 시스템 구축
2. Visual Editor 강화 (callout, highlight 등 전용 버튼)
3. 테마는 기본 스타일만 제공, 강제 변환 금지

## 🔧 작업 예상 규모

### CSS 수정만 할 경우
- **작업 시간**: 1-2시간
- **영향 범위**: 기존 TecoTeco 테마 사용 페이지
- **위험도**: 중간 (기존 페이지 스타일 변경)

### 템플릿 시스템 구축
- **작업 시간**: 1-2일
- **영향 범위**: RichTextSectionForm 전체 재구성
- **위험도**: 낮음 (신규 기능)

## 📝 참고 사항

### 관련 파일
- `/src/components/studyDetailPage/sections/RichTextSection.tsx`
- `/src/components/studyDetailPage/sections/RichTextSection.css`
- `/src/components/studyDetailPage/editor/forms/RichTextSectionForm.tsx`
- `/src/components/studyDetailPage/editor/forms/RichTextSectionForm.css`

### 현재 다른 섹션 템플릿 구현 사례
- `HowWeRollSectionForm`: 구조화된 overview, schedule 입력
- `JourneySectionForm` (TimelineSectionForm): 이벤트 단위 입력
- `FAQSectionForm`: Q&A 쌍 입력

이들 모두 자유 HTML 입력이 아닌 구조화된 데이터 입력 방식을 사용하고 있음.

---

*작성일: 2025-08-11*
*작성자: Claude & Rene*
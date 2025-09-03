# 페이지 스크롤 위치 문제 해결 가이드

## 문제 증상
사용자가 페이지에 진입할 때 맨 위가 아닌 중간 위치부터 보이는 문제

## 주요 원인들

### 1. autoFocus 속성
```javascript
// ❌ 문제: 페이지 로드 시 자동으로 해당 input으로 스크롤
<input autoFocus />

// ✅ 해결: autoFocus 제거
<input />
```

**영향 받는 파일들:**
- `DocuMentorForm.tsx` - 도큐멘토 URL 입력 필드
- `SignupPage.tsx` - 회원가입 단계별 입력 필드
- 각종 Modal 컴포넌트들

### 2. JavaScript 스크롤 조작
```javascript
// ❌ 문제: 페이지 로드 시 특정 요소로 자동 스크롤
useEffect(() => {
  element.scrollIntoView({ behavior: 'smooth' });
}, []);
```

**대표적인 예시:**
- `StudyCalendar.tsx` - 오늘 날짜로 자동 스크롤
  ```javascript
  useEffect(() => {
    setTimeout(() => {
      const todayElement = document.querySelector('.day-cell--today');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);
  ```

### 3. 브라우저 스크롤 복원 (Browser Scroll Restoration)
브라우저는 기본적으로 페이지 재방문 시 이전 스크롤 위치를 복원합니다.

```javascript
// React Router SPA 환경에서 문제 발생 순서:
// 1. ScrollToTop 컴포넌트가 window.scrollTo(0, 0) 실행
// 2. 브라우저가 저장된 스크롤 위치로 복원
// 3. 결과: 중간 위치에서 시작
```

## 해결 방법

### 방법 1: autoFocus 제거 (권장)
가장 간단하고 안전한 해결책

```javascript
// DocuMentorForm.tsx
<input
  type="url"
  value={url}
  onChange={handleUrlChange}
  // autoFocus 제거됨
/>
```

### 방법 2: 브라우저 스크롤 복원 비활성화
특정 레이아웃이나 페이지에서만 적용

```javascript
// StudioLayout.tsx 예시
useEffect(() => {
  // 브라우저 스크롤 복원 비활성화
  if ('scrollRestoration' in history) {
    const previousValue = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    
    // 컴포넌트 언마운트 시 원복
    return () => {
      history.scrollRestoration = previousValue;
    };
  }
}, []);
```

### 방법 3: 강제 스크롤 리셋
다른 스크롤 동작보다 늦게 실행

```javascript
useEffect(() => {
  // 다른 useEffect보다 늦게 실행되도록 setTimeout 사용
  const timer = setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
  
  return () => clearTimeout(timer);
}, []);
```

## 격리 전략

### CSS Module 격리
- **효과**: 스타일 충돌 방지 ✅
- **한계**: JavaScript 동작은 격리 안 됨 ❌

### 레이아웃별 격리
```
/studio/* → StudioLayout → 독립적 스크롤 정책
/study/*  → App Layout   → 다른 스크롤 정책
```

### JavaScript 동작의 영향 범위
| API | 영향 범위 | 격리 가능 |
|-----|----------|----------|
| `element.scrollIntoView()` | 전체 viewport | ❌ |
| `window.scrollTo()` | 전체 viewport | ❌ |
| `element.focus()` | 전체 viewport (스크롤 발생) | ❌ |
| CSS scroll-behavior | 해당 요소만 | ✅ |

## 체크리스트

새 컴포넌트 개발 시 확인사항:
- [ ] autoFocus 속성 사용하지 않기
- [ ] 페이지 로드 시 scrollIntoView 사용하지 않기
- [ ] 필요한 경우 사용자 액션 후에만 스크롤 조작
- [ ] 모바일에서 키보드로 인한 스크롤 영향 고려

## 도큐멘토 페이지 해결 사례

### 문제
- 도큐멘토 페이지 진입 시 URL 입력 필드로 자동 포커스
- 페이지가 중간부터 보임

### 원인
```javascript
// DocuMentorForm.tsx:165
<input
  autoFocus  // 이 속성이 문제
/>
```

### 해결
- autoFocus 속성 제거
- 다른 페이지 영향 없음 (StudioLayout으로 격리)
- 작업 파일: `src/components/lab/ai-studio/documentor/DocuMentorForm.tsx`

### 추가 고려사항
도큐멘토는 `/studio/*` 경로 아래 StudioLayout을 사용하므로:
- 메인 사이트와 완전 격리
- 독립적인 스크롤 정책 적용 가능
- 다른 페이지 걱정 없이 수정 가능

## 참고 자료
- [MDN - History.scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)
- [React Router - Scroll Restoration](https://reactrouter.com/en/main/components/scroll-restoration)
- [Web.dev - Scroll behavior](https://web.dev/articles/overscroll-behavior)
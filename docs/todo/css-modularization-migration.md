# CSS 모듈화 마이그레이션 가이드

## 배경 및 맥락

### 현재 상황
AsyncSite 프로젝트는 현재 두 가지 CSS 접근 방식이 혼재되어 있습니다:
1. **전통적 CSS 파일** (`.css`): 글로벌 스코프, 클래스명 충돌 위험
2. **CSS Modules** (`.module.css`): 로컬 스코프, 자동 클래스명 해싱

이로 인해 다음과 같은 문제들이 발생하고 있습니다:
- 클래스명 충돌로 인한 의도치 않은 스타일 적용
- 스타일 우선순위 예측 어려움
- 컴포넌트 간 스타일 간섭
- 유지보수 복잡성 증가

### 마이그레이션 목표
1. **모든 컴포넌트를 CSS Modules로 전환**하여 스타일 캡슐화
2. **재사용 가능한 UI 컴포넌트**는 CSS-in-JS 또는 Tailwind 고려
3. **일관된 네이밍 컨벤션** 확립
4. **점진적 마이그레이션**으로 서비스 중단 없이 진행

## 완료된 작업

### 1. Modal 컴포넌트 신규 생성 (2025-01-13)
**파일**: `/Users/rene/asyncsite/web/src/components/common/Modal/Modal.tsx`
**방식**: CSS-in-JS (인라인 스타일)
**목적**: window.alert() 대체
**특징**:
- TypeScript 인터페이스로 타입 안정성 확보
- 4가지 타입 지원: info, warning, error, success
- 접근성 고려 (ESC 키, 외부 클릭으로 닫기)
- 재사용 가능한 컴포넌트

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}
```

**적용된 페이지**:
- `StudyApplicationPage.tsx`: 모든 alert() 호출을 Modal 컴포넌트로 교체
  - 로그인 필요 알림
  - 신청 완료 알림
  - 중복 신청 경고
  - 오류 메시지
- `StudyDetailPageRenderer.tsx`: 로그인 필요 모달 추가
  - 참가 신청 버튼 클릭 시 로그인 체크

### 2. 기존 CSS Modules 사용 중인 컴포넌트 (변경 없음)
다음 컴포넌트들은 **이미** CSS Modules를 사용 중입니다:
- `ProfilePage.module.css` - 프로필 페이지 (기존)
- `StudyCard.module.css` - 스터디 카드 (기존)
- `Header.module.css` - 헤더 컴포넌트 (기존)

### 3. 아직 CSS Modules로 전환되지 않은 컴포넌트
- `StudyApplicationPage.css` - 여전히 글로벌 CSS 사용 중
- `StudyDetailPageRenderer.css` - 여전히 글로벌 CSS 사용 중
- 대부분의 다른 컴포넌트들

## 마이그레이션 대상 (우선순위 순)

### 🔴 긴급 (글로벌 스타일 충돌 발생)
1. **StudyApplicationPage.css** → `StudyApplicationPage.module.css`
   - 현재: 글로벌 `.application-form`, `.form-group` 등
   - 문제: 다른 폼 컴포넌트와 스타일 충돌
   - 영향 범위: 모든 폼 관련 페이지

2. **StudyDetailPageRenderer.css** → `StudyDetailPageRenderer.module.css`
   - 현재: 글로벌 `.study-detail-page-renderer`, `.section-wrapper` 등
   - 문제: 섹션 스타일이 다른 페이지에 영향
   - 영향 범위: 모든 상세 페이지

### 🟡 중요 (재사용성 높은 컴포넌트)
3. **components/layout/Footer.css** → `Footer.module.css`
   - 모든 페이지에서 사용
   - `.footer`, `.footer-content` 등 일반적 클래스명

4. **components/common/LoadingSpinner.css** → `LoadingSpinner.module.css`
   - 여러 페이지에서 재사용
   - `.loading-spinner` 클래스명 충돌 가능성

5. **components/auth/LoginForm.css** → `LoginForm.module.css`
   - 폼 관련 클래스명 충돌 위험

### 🟢 일반 (독립적 페이지)
6. **pages/HomePage.css** → `HomePage.module.css`
7. **pages/StudyListPage.css** → `StudyListPage.module.css`
8. **pages/AboutPage.css** → `AboutPage.module.css`
9. **pages/user/ProfileEditPage.css** → `ProfileEditPage.module.css`

## 마이그레이션 절차

### Step 1: CSS 파일 이름 변경
```bash
mv Component.css Component.module.css
```

### Step 2: CSS 클래스명 조정
```css
/* Before (Component.css) */
.container {
  padding: 20px;
}
.container .title {
  font-size: 24px;
}

/* After (Component.module.css) */
.container {
  padding: 20px;
}
.title {
  font-size: 24px;
  /* 중첩 선택자 대신 컴포지션 사용 */
}
```

### Step 3: 컴포넌트에서 import 변경
```typescript
// Before
import './Component.css';

// After
import styles from './Component.module.css';
```

### Step 4: 클래스명 적용 변경
```tsx
// Before
<div className="container">
  <h1 className="title">제목</h1>
  <p className="description active">설명</p>
</div>

// After
<div className={styles.container}>
  <h1 className={styles.title}>제목</h1>
  <p className={`${styles.description} ${styles.active}`}>설명</p>
</div>
```

### Step 5: 조건부 클래스 처리
```tsx
// 여러 클래스 조합
className={`${styles.button} ${isActive ? styles.active : ''}`}

// classnames 라이브러리 사용 (선택사항)
import cn from 'classnames';
className={cn(styles.button, { [styles.active]: isActive })}
```

## 주의사항 및 함정

### 1. ⚠️ 글로벌 스타일 필요 시
```css
/* Component.module.css */
:global(.external-library-class) {
  /* 외부 라이브러리 스타일 오버라이드 */
}

:global {
  .modal-backdrop {
    /* 전역 스타일이 필요한 경우 */
  }
}
```

### 2. ⚠️ 동적 클래스명 문제
```tsx
// ❌ 이렇게 하면 안됨 (CSS Modules에서 작동 안함)
const type = 'primary';
<button className={styles[`button-${type}`]} />

// ✅ 올바른 방법
const buttonClass = type === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
<button className={buttonClass} />

// ✅ 또는 객체 매핑
const buttonStyles = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary
};
<button className={buttonStyles[type]} />
```

### 3. ⚠️ CSS 변수 및 애니메이션
```css
/* CSS 변수는 그대로 사용 가능 */
.component {
  color: var(--primary-color);
}

/* 애니메이션 정의도 로컬 스코프 */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animated {
  animation: slideIn 0.3s ease;
}
```

### 4. ⚠️ 미디어 쿼리
```css
/* 미디어 쿼리는 그대로 작동 */
.container {
  padding: 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}
```

### 5. ⚠️ 컴포지션과 상속
```css
/* composes 사용 */
.button {
  padding: 10px 20px;
  border-radius: 4px;
}

.primaryButton {
  composes: button;
  background: blue;
  color: white;
}
```

## 테스트 체크리스트

마이그레이션 후 각 컴포넌트에서 확인해야 할 사항:

- [ ] 모든 스타일이 올바르게 적용되는가?
- [ ] 호버, 액티브 등 상태 스타일이 작동하는가?
- [ ] 미디어 쿼리가 정상 작동하는가?
- [ ] 다른 컴포넌트와 스타일 충돌이 없는가?
- [ ] 프로덕션 빌드에서 클래스명이 해시되는가?
- [ ] 외부 라이브러리 스타일 오버라이드가 필요한 경우 작동하는가?

## 모범 사례

### 1. 네이밍 컨벤션
```css
/* Component.module.css */
.container { }          /* 컴포넌트 루트 */
.title { }             /* 주요 요소 */
.content { }           /* 콘텐츠 영역 */
.buttonPrimary { }     /* camelCase for 복합 이름 */
.isActive { }          /* 상태 클래스는 is- 접두사 */
.hasError { }          /* has- 접두사도 사용 가능 */
```

### 2. 파일 구조
```
components/
  StudyCard/
    StudyCard.tsx
    StudyCard.module.css
    StudyCard.test.tsx
    index.ts
```

### 3. 타입 안정성 (선택사항)
```bash
# CSS Modules 타입 생성
npm install -D typescript-plugin-css-modules
```

```typescript
// 타입 정의 자동 생성
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

## 성능 고려사항

1. **번들 크기**: CSS Modules는 사용하지 않는 스타일도 번들에 포함
2. **런타임 오버헤드**: 클래스명 매핑에 약간의 오버헤드
3. **빌드 시간**: CSS 처리 시간 증가
4. **트리 쉐이킹**: CSS-in-JS 대비 트리 쉐이킹 제한적

## 대안 기술 검토

### CSS-in-JS (styled-components, emotion)
- **장점**: 동적 스타일링, 트리 쉐이킹, TypeScript 통합
- **단점**: 런타임 오버헤드, 번들 크기 증가
- **적합한 경우**: 동적 테마, 복잡한 상태 기반 스타일

### Tailwind CSS
- **장점**: 유틸리티 우선, 작은 번들 크기, 빠른 개발
- **단점**: HTML 가독성 저하, 학습 곡선
- **적합한 경우**: 빠른 프로토타이핑, 일관된 디자인 시스템

## 마이그레이션 추적

| 컴포넌트 | 현재 상태 | 목표 상태 | 우선순위 | 작업 내용 | 완료일 |
|---------|----------|----------|---------|----------|-------|
| **신규 생성** | | | | | |
| Modal | ✅ CSS-in-JS | 완료 | - | 신규 생성 (alert 대체) | 2025-01-13 |
| **글로벌 CSS → CSS Modules 필요** | | | | | |
| StudyApplicationPage | ❌ 글로벌 CSS | CSS Modules | 🔴 긴급 | 마이그레이션 필요 | - |
| StudyDetailPageRenderer | ❌ 글로벌 CSS | CSS Modules | 🔴 긴급 | 마이그레이션 필요 | - |
| Footer | ❌ 글로벌 CSS | CSS Modules | 🟡 중요 | 마이그레이션 필요 | - |
| LoadingSpinner | ❌ 글로벌 CSS | CSS Modules | 🟡 중요 | 마이그레이션 필요 | - |
| LoginForm | ❌ 글로벌 CSS | CSS Modules | 🟡 중요 | 마이그레이션 필요 | - |
| HomePage | ❌ 글로벌 CSS | CSS Modules | 🟢 일반 | 마이그레이션 필요 | - |
| StudyListPage | ❌ 글로벌 CSS | CSS Modules | 🟢 일반 | 마이그레이션 필요 | - |
| AboutPage | ❌ 글로벌 CSS | CSS Modules | 🟢 일반 | 마이그레이션 필요 | - |
| ProfileEditPage | ❌ 글로벌 CSS | CSS Modules | 🟢 일반 | 마이그레이션 필요 | - |
| **이미 CSS Modules 사용 중** | | | | | |
| ProfilePage | ✅ CSS Modules | 유지 | - | 변경 없음 | 기존 |
| StudyCard | ✅ CSS Modules | 유지 | - | 변경 없음 | 기존 |
| Header | ✅ CSS Modules | 유지 | - | 변경 없음 | 기존 |

## 자동화 도구

### 마이그레이션 스크립트 (참고용)
```bash
#!/bin/bash
# migrate-to-css-modules.sh

FILE=$1
if [ -z "$FILE" ]; then
  echo "Usage: ./migrate-to-css-modules.sh Component"
  exit 1
fi

# 1. CSS 파일 이름 변경
mv src/components/${FILE}/${FILE}.css src/components/${FILE}/${FILE}.module.css

# 2. Import 문 수정
sed -i '' "s/import '.\\/${FILE}.css'/import styles from '.\\/${FILE}.module.css'/" src/components/${FILE}/${FILE}.tsx

# 3. 클래스명 변경 (수동 확인 필요)
echo "⚠️  클래스명을 수동으로 변경해주세요:"
echo "  className=\"name\" → className={styles.name}"
```

## 참고 자료

- [CSS Modules 공식 문서](https://github.com/css-modules/css-modules)
- [Create React App CSS Modules 가이드](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)
- [CSS Modules vs CSS-in-JS 비교](https://github.com/andreipfeiffer/css-in-js)
- [Tailwind CSS 마이그레이션 가이드](https://tailwindcss.com/docs/installation)

## 결론

CSS Modules 마이그레이션은 **점진적으로** 진행되어야 하며, **우선순위가 높은 컴포넌트부터** 시작해야 합니다. 특히 **글로벌 스타일 충돌이 발생하는 컴포넌트**를 먼저 처리하고, 이후 재사용성이 높은 공통 컴포넌트를 마이그레이션합니다.

마이그레이션 과정에서 **일관된 네이밍 컨벤션**을 유지하고, **테스트를 철저히** 수행하여 스타일 누락이나 충돌이 없는지 확인해야 합니다.

장기적으로는 **디자인 시스템 구축**과 함께 **CSS-in-JS** 또는 **Tailwind CSS** 도입을 검토할 수 있습니다.
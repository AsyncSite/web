# CSS 모듈 마이그레이션 - Quick Reference

## 🚨 즉시 해결이 필요한 스타일 충돌 파일들

### Critical (범용 클래스명 사용으로 충돌 위험 높음)
```
❌ components/common/Modal/Modal.css
❌ components/common/Toast.css
❌ components/common/LoadingSpinner.css
❌ components/common/ErrorMessage.css
❌ components/common/ConfirmModal.css
```
→ **문제**: `.modal`, `.toast`, `.spinner`, `.error` 등 범용 클래스명

### High Priority (인증 관련 - 전역 영향)
```
❌ components/auth/LoginPage.css
❌ components/auth/SignupPage.css
❌ components/auth/PasswordChangeModal.css
```
→ **문제**: `.form`, `.input`, `.button` 등 일반적 클래스명

### ⚠️ 마이그레이션 제외 대상
```
✅ pages/TecoTecoPage/sections/*.css (격리된 샘플 페이지)
```
→ **이유**: `/study/1-tecoteco` 하드코딩 샘플로 의도적 격리 필요

---

## 🔧 마이그레이션 명령어 (복사해서 사용)

### 1. 파일 변환
```bash
# 단일 파일
mv src/components/auth/LoginPage.css src/components/auth/LoginPage.module.css

# 디렉토리 전체 (주의해서 사용)
for file in src/components/auth/*.css; do 
  mv "$file" "${file%.css}.module.css"
done
```

### 2. Import 일괄 변경 (VS Code)
```
찾기: import ['"](.*)\.css['"]
바꾸기: import styles from '$1.module.css'
```

### 3. 클래스명 변경 패턴
```
찾기: className="([^"]+)"
바꾸기: className={styles.$1}

# 다중 클래스
찾기: className="(\w+) (\w+)"
바꾸기: className={`${styles.$1} ${styles.$2}`}
```

---

## 📋 컴포넌트별 예상 작업 시간

| 컴포넌트 | 파일 수 | 복잡도 | 예상 시간 | 우선순위 |
|----------|---------|--------|-----------|----------|
| common/* | 11 | 중간 | 4시간 | **Critical** |
| auth/* | 7 | 낮음 | 2시간 | **Critical** |
| layout/* | 6 | 낮음 | 2시간 | High |
| lab/playground/* | 5 | 낮음 | 2시간 | Medium |
| lab/utilities/spotlight-arena/* | 30+ | 높음 | 8시간 | Low |
| pages/* (나머지) | 20 | 중간 | 6시간 | Medium |
| ~~TecoTecoPage/sections/*~~ | ~~10~~ | - | - | **제외** |

---

## ⚡ 빠른 시작 템플릿

### Component.tsx
```tsx
import React from 'react';
import styles from './Component.module.css';
import clsx from 'clsx';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
  isActive?: boolean;
}

export const Component: React.FC<ComponentProps> = ({ 
  variant = 'primary',
  isActive = false 
}) => {
  return (
    <div className={clsx(
      styles.container,
      styles[variant],
      { [styles.active]: isActive }
    )}>
      <h1 className={styles.title}>Title</h1>
    </div>
  );
};
```

### Component.module.css
```css
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  color: #333;
}

.primary {
  background: blue;
}

.secondary {
  background: gray;
}

.active {
  border: 2px solid green;
}
```

---

## 🚫 자주 하는 실수

### ❌ 틀린 예시
```tsx
// 1. 동적 클래스명 - 작동 안 함
className={styles[`btn-${size}`]}

// 2. 문자열 연결 - 작동 안 함
className={styles.btn + ' ' + styles.primary}

// 3. 조건부 - undefined 출력됨
className={styles.btn + (isActive && styles.active)}
```

### ✅ 올바른 예시
```tsx
// 1. 동적 클래스명
const sizeClass = {
  sm: styles.btnSm,
  md: styles.btnMd,
  lg: styles.btnLg
}[size];

// 2. 문자열 연결
className={`${styles.btn} ${styles.primary}`}

// 3. 조건부
className={`${styles.btn} ${isActive ? styles.active : ''}`}
```

---

## 🔍 디버깅 팁

### 1. 클래스명이 해시로 안 바뀔 때
- 파일명이 `.module.css`인지 확인
- import가 `import styles from`인지 확인
- 개발 서버 재시작

### 2. 스타일이 적용 안 될 때
- 브라우저 개발자 도구에서 실제 클래스명 확인
- CSS 파일에서 오타 확인 (camelCase)
- 캐시 삭제 후 재시도

### 3. TypeScript 오류
```bash
# tsconfig.json에 추가
{
  "compilerOptions": {
    "plugins": [
      { "name": "typescript-plugin-css-modules" }
    ]
  }
}
```

---

## 📞 도움 요청

문제 발생 시:
1. 에러 메시지와 함께 스크린샷 첨부
2. 변경 전/후 코드 포함
3. `#frontend` 채널에 질문

---

*빠른 참조용 - 상세 내용은 [CSS_MODULE_MIGRATION_GUIDE.md](./CSS_MODULE_MIGRATION_GUIDE.md) 참고*
# CSS 모듈 마이그레이션 작업 가이드

> 작성일: 2025-08-15  
> 작성자: CSS 분석 팀  
> 대상: 프론트엔드 개발자  
> 예상 작업 기간: 2-3주 (점진적 마이그레이션)

## 📋 Executive Summary

현재 프로젝트의 CSS 사용 방식이 **CSS 모듈과 일반 CSS가 혼재**되어 있어 스타일 충돌, 유지보수 어려움, 일관성 부족 등의 문제가 발생하고 있습니다. 이 문서는 현황을 분석하고 **CSS 모듈로의 점진적 마이그레이션**을 위한 구체적인 작업 가이드를 제공합니다.

---

## 🔍 현황 분석

### 1. 숫자로 보는 현재 상태

| 구분 | CSS 모듈 (.module.css) | 일반 CSS (.css) | 비율 |
|------|------------------------|-----------------|------|
| **총 파일 수** | 14개 | 160개 | 8.7% vs 91.3% |
| **실제 사용** | 13개 | 155개 | - |
| **미사용** | 1개 | 5개 | - |

### 2. CSS 모듈 사용 현황 (14개 파일)

#### ✅ StudyDetailPage 관련 (10개) - 가장 일관된 패턴
```
src/components/studyDetailPage/
├── StudyDetailPageRenderer.module.css
└── sections/
    ├── ExperienceSection.module.css
    ├── FAQSection.module.css
    ├── HeroSection.module.css
    ├── HowWeRollSection.module.css
    ├── JourneySection.module.css
    ├── MembersSection.module.css
    ├── ReviewsSection.module.css
    └── RichTextSection.module.css
```

#### ✅ 페이지 컴포넌트 (3개)
- `StudyManagementPage.module.css`
- `StudyPage.module.css`
- `ProfilePage.module.css`

#### ✅ 기타 컴포넌트 (1개)
- `StudyCalendar.module.css`

### 3. 일반 CSS 주요 사용처 (160개 파일)

#### 카테고리별 분포
- **Lab 관련**: ~50개 (31%) - 게임, 유틸리티
- **Pages**: ~25개 (16%)
- **Sections**: 14개 (9%)
- **Common**: 11개 (7%)
- **Auth**: 7개 (4%)
- **기타**: ~53개 (33%)

### 4. 문제가 되는 혼재 패턴

#### ⚠️ 패턴 1: 같은 디렉토리 내 혼재
```
studyDetailPage/
├── sections/*.tsx         → CSS 모듈 사용 ✅
└── editor/forms/*.tsx     → 일반 CSS 사용 ❌
```

#### ⚠️ 패턴 2: 페이지별 일관성 부족
```
pages/
├── StudyPage.tsx          → CSS 모듈 사용 ✅
├── ProfilePage.tsx        → CSS 모듈 사용 ✅
├── LoginPage.tsx          → 일반 CSS 사용 ❌
└── SignupPage.tsx         → 일반 CSS 사용 ❌
```

#### ℹ️ 격리된 샘플 페이지 (마이그레이션 제외)
```
TecoTecoPage/sections/   → 일반 CSS (의도적 격리) ⚠️
```
- `/study/1-tecoteco` 경로의 하드코딩된 샘플 페이지
- 다른 컴포넌트와 완전 격리 필요
- **마이그레이션 대상에서 제외**

---

## 🎯 문제점 심층 분석

### 1. 스타일 충돌 위험 (Critical)
- **현재 발생 사례**: 
  - `common/Modal.css`, `common/Toast.css` 등이 `.modal`, `.toast` 같은 범용 클래스명 사용
  - `auth/` 컴포넌트들이 `.form`, `.input` 같은 일반적인 클래스명 사용
  - 네임스페이스 접두사로 임시 해결 중인 컴포넌트 다수

### 2. 빌드 최적화 불가 (High)
- 일반 CSS는 사용 여부와 관계없이 번들에 포함
- 미사용 스타일 제거(tree-shaking) 불가능
- 현재 발견된 미사용 CSS: 6개 파일

### 3. 리팩토링 어려움 (High)
- 클래스명 변경 시 전체 프로젝트 검색 필요
- 스타일 의존성 파악 어려움
- 안전한 삭제/수정 보장 불가

### 4. 개발자 경험 저하 (Medium)
- IDE 자동완성 미지원 (일반 CSS)
- TypeScript 타입 체크 불가
- 런타임에서만 오류 발견

### 5. 일관성 부족 (Medium)
- 팀원별로 다른 방식 사용
- 새 컴포넌트 작성 시 기준 불명확

---

## 📊 원인 분석 (Git History 기반)

### 히스토리 타임라인
1. **초기 (~2024.06)**: 전체 일반 CSS 사용
2. **중기 (2024.07~09)**: 스타일 충돌 문제 발생, 네임스페이스 접두사 도입
3. **최근 (2024.10~)**: StudyDetailPage에 CSS 모듈 시범 도입
4. **현재 (2025.01)**: 일부만 마이그레이션 완료, 혼재 상태

### 주요 전환점
- `9c613bb`: "Complete CSS Module migration" - StudyDetailPage 완료
- `b995284`: "CSS 모듈 전환 및 프로필 이미지 삭제 버그 수정"
- `fde434a`: "스타일 충돌 해결" - 네임스페이스 격리 시도

### 마이그레이션이 중단된 이유 (추정)
1. 기존 코드 규모가 크고 의존성 복잡
2. 점진적 전환 전략 부재
3. 명확한 가이드라인 없음
4. 우선순위 다른 작업에 밀림

---

## 🚀 마이그레이션 전략

### Phase 1: 준비 단계 (1주)
1. **가이드라인 확정 및 팀 합의**
2. **도구 세팅**
   - CSS Modules TypeScript Plugin 설치
   - ESLint 규칙 추가
3. **파일럿 프로젝트 선정**
   - 추천: `components/auth/` (7개 파일, 독립적)

### Phase 2: 핵심 컴포넌트 전환 (1주)
1. **우선순위 1: 스타일 충돌 빈발 영역**
   ```
   components/common/ (11개) - Critical
   components/auth/ (7개) - Critical
   components/layout/ (6개) - High
   ```

2. **우선순위 2: 페이지 레벨 컴포넌트**
   ```
   pages/*.tsx 중 일반 CSS 사용 (22개)
   ```
   
3. **마이그레이션 제외 대상**
   ```
   pages/TecoTecoPage/ - 하드코딩된 샘플, 격리 유지
   ```

### Phase 3: 나머지 전환 (1주)
1. **Lab 관련 컴포넌트** (50개)
   - 게임별로 묶어서 진행
   - 독립성 높아 병렬 작업 가능

2. **기타 컴포넌트**
   - 사용 빈도 낮은 컴포넌트
   - 레거시 코드

### Phase 4: 정리 및 최적화
1. **미사용 CSS 파일 삭제**
2. **글로벌 스타일 최소화**
3. **문서 업데이트**

---

## 🛠 구체적인 작업 방법

### Step 1: 파일 이름 변경
```bash
# 예시
mv HeroSection.css HeroSection.module.css
```

### Step 2: import 문 수정
```typescript
// Before
import './HeroSection.css';

// After
import styles from './HeroSection.module.css';
```

### Step 3: 클래스명 적용 방식 변경
```tsx
// Before
<div className="hero-section">
  <h1 className="hero-title">제목</h1>
</div>

// After
<div className={styles.heroSection}>
  <h1 className={styles.heroTitle}>제목</h1>
</div>
```

### Step 4: CSS 파일 내 클래스명 변경
```css
/* Before */
.tecoteco-hero-section { }
.hero-title { }

/* After */
.heroSection { }
.heroTitle { }
```

### Step 5: 조건부 클래스 처리
```tsx
// 여러 클래스 조합
className={`${styles.button} ${styles.primary}`}

// 조건부 클래스
className={`${styles.button} ${isActive ? styles.active : ''}`}

// clsx 라이브러리 사용 (권장)
import clsx from 'clsx';
className={clsx(styles.button, {
  [styles.active]: isActive,
  [styles.disabled]: isDisabled
})}
```

---

## ⚠️ 주의사항

### 1. 글로벌 스타일 처리
- `:global()` 래퍼 사용 시에만 전역 적용
- 꼭 필요한 경우만 사용 (reset, normalize 등)

### 2. 동적 클래스명
```tsx
// ❌ 작동 안 함
className={styles[`color-${color}`]}

// ✅ 올바른 방법
const colorClass = {
  red: styles.colorRed,
  blue: styles.colorBlue
}[color];
```

### 3. 서드파티 라이브러리 스타일 오버라이드
```css
/* 전역 스타일 필요한 경우 */
:global(.ant-button) {
  /* Ant Design 버튼 커스터마이징 */
}
```

### 4. 미디어 쿼리와 CSS 변수
- CSS 모듈에서도 정상 작동
- CSS 변수는 `:root`나 컴포넌트 최상위에 정의

---

## 📝 체크리스트

### 마이그레이션 전 체크
- [ ] 현재 컴포넌트의 모든 스타일 의존성 파악
- [ ] 다른 컴포넌트에서 참조하는 클래스 확인
- [ ] 글로벌 스타일 의존성 확인

### 마이그레이션 중 체크
- [ ] 파일명 `.module.css`로 변경
- [ ] import 구문 수정
- [ ] 모든 className 참조 수정
- [ ] CSS 파일 내 클래스명 camelCase로 변경
- [ ] 조건부 클래스 처리 확인

### 마이그레이션 후 체크
- [ ] 개발 서버에서 스타일 정상 적용 확인
- [ ] 프로덕션 빌드 테스트
- [ ] 반응형 디자인 테스트
- [ ] 크로스 브라우저 테스트

---

## 🎯 목표 및 기대 효과

### 단기 목표 (1개월)
- 스타일 충돌 제로
- 핵심 컴포넌트 100% CSS 모듈화
- 미사용 CSS 제거

### 장기 목표 (3개월)
- 전체 컴포넌트 90% 이상 CSS 모듈화
- 번들 사이즈 20% 감소
- 빌드 시간 개선

### 기대 효과
1. **유지보수성**: 컴포넌트별 독립적 스타일 관리
2. **안정성**: 타입 체크 및 컴파일 타임 오류 감지
3. **성능**: 사용하지 않는 스타일 자동 제거
4. **DX**: 자동완성, 리팩토링 도구 지원
5. **확장성**: 새 기능 추가 시 스타일 충돌 걱정 없음

---

## 📚 참고 자료

### 내부 문서
- [CLAUDE.md](../CLAUDE.md) - 코딩 가이드라인
- Git History: `git log --grep="css" --grep="module"`

### 외부 자료
- [CSS Modules 공식 문서](https://github.com/css-modules/css-modules)
- [Create React App - CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)
- [TypeScript with CSS Modules](https://www.typescriptlang.org/docs/handbook/modules.html)

---

## 🤝 작업 담당자 할당 제안

| Phase | 담당 영역 | 예상 공수 | 우선순위 |
|-------|----------|----------|----------|
| 1 | Auth 컴포넌트 | 2일 | High |
| 2 | Common 컴포넌트 | 3일 | Critical |
| 3 | Pages | 3일 | High |
| 4 | Lab 컴포넌트 | 5일 | Medium |
| 5 | 나머지 및 QA | 2일 | Low |

---

## 💡 추가 권장사항

### 1. 새 컴포넌트 작성 규칙
**즉시 적용**: 모든 새 컴포넌트는 CSS 모듈 사용 의무화

### 2. 코드 리뷰 체크포인트
- PR 시 CSS 모듈 사용 여부 확인
- 일반 CSS 추가 시 정당한 사유 필요

### 3. 점진적 개선
- 기존 컴포넌트 수정 시 CSS 모듈로 전환
- Boy Scout Rule: "떠날 때는 왔을 때보다 깨끗하게"

### 4. 팀 교육
- CSS 모듈 사용법 워크샵
- 베스트 프랙티스 공유

### 5. 격리된 페이지 관리
- **TecoTecoPage**: 하드코딩 샘플로 유지
- 다른 샘플 페이지들도 격리 필요 시 별도 관리
- 동적 페이지와 명확히 구분

---

## ✅ 결론

현재 CSS 사용 방식의 혼재는 **기술 부채**로 작용하고 있으며, 프로젝트가 성장할수록 문제가 커질 것입니다. 제안된 3주 마이그레이션 계획을 통해 점진적이면서도 체계적으로 CSS 모듈로 전환하여, 더 **안정적이고 유지보수하기 쉬운 코드베이스**를 구축할 수 있을 것입니다.

**다음 작업자는 Phase 2의 Common 컴포넌트(Critical)부터 시작하시기 바랍니다.**

**중요**: TecoTecoPage (`/study/1-tecoteco`)는 하드코딩된 샘플 페이지로, 다른 컴포넌트와 격리되어야 하므로 마이그레이션 대상에서 제외됩니다.

---

*마지막 업데이트: 2025-08-15*  
*문서 버전: 1.0.0*
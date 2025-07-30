# AsyncSite Design Guide

## 1. 디자인 철학 (Design Philosophy)

### Core Vision
"**경계를 넘나드는 디지털 놀이터**" - AsyncSite는 단순한 웹사이트를 넘어, 코드와 창의성이 만나는 인터랙티브한 경험의 장을 지향합니다.

### Design Principles
- **Playful Professionalism**: 전문성을 유지하면서도 재미있고 접근하기 쉬운 경험
- **Cosmic Minimalism**: 우주적 신비로움과 미니멀한 인터페이스의 조화
- **Interactive Storytelling**: 정적인 정보 전달이 아닌, 사용자 참여형 스토리텔링
- **Inclusive Gaming**: 모두가 즐길 수 있는 캐주얼하면서도 깊이 있는 게임 경험

### Keywords
`#개발자문화` `#우주` `#레트로` `#미래지향적` `#게임화` `#커뮤니티` `#인터랙티브` `#다양성`

## 2. 색상 시스템 (Color System)

### 2.1 기본 색상 팔레트 (Foundation Palette)

| 역할 | 색상 코드 | 설명 |
| --- | --- | --- |
| **Primary Background** | `#000000` | 무한한 가능성을 상징하는 순수한 검정 |
| **Secondary Background** | `#1a1a1a` | 섹션 구분을 위한 다크 그레이 |
| **Tertiary Background** | `#2a2a2a` | 카드 및 컴포넌트용 밝은 다크 그레이 |
| **Primary Text** | `#f0f0f0` | 높은 가독성을 위한 거의 흰색 텍스트 |
| **Secondary Text** | `#ddd` | 보조 정보용 약간 어두운 흰색 |
| **Muted Text** | `#aaa` | 비활성 또는 힌트 텍스트 |

### 2.2 브랜드 액센트 색상 (Brand Accent Colors)

| 이름 | 색상 코드 | 사용처 |
| --- | --- | --- |
| **Neon Green** | `#C3E88D` | 메인 브랜드 색상, CTA 버튼, 중요 텍스트 |
| **Electric Blue** | `#82aaff` | 링크, 인터랙티브 요소 |
| **Cosmic Yellow** | `#ffea00` | 하이라이트, 성공 메시지, 특별 강조 |
| **Cyber Purple** | `#6366f1` | Spotlight Arena 테마, 프리미엄 기능 |
| **Coral Pink** | `#f87171` | 경고, 중요 알림, 감정적 포인트 |

### 2.3 기능별 색상 시스템 (Functional Color System)

#### TecoTeco Community Colors
```css
--color-primary: #c3e88d;    /* 연한 연두색 - 성장과 커뮤니티 */
--color-secondary: #82aaff;  /* 밝은 파란색 - 신뢰와 협력 */
--color-accent: #ffea00;     /* 노란색 - 열정과 에너지 */
```

#### Spotlight Arena Game Colors
```css
--sa-accent-snail: #34d399;      /* 민트 그린 - 달팽이 레이스 */
--sa-accent-dart: #f59e0b;       /* 앰버 - 다트 휠 */
--sa-accent-slot: #ec4899;       /* 핑크 - 슬롯머신 */
--sa-primary: #6366f1;           /* 보라색 - 아레나 메인 */
--sa-secondary: #f87171;         /* 코랄 - 보조 액션 */
```

#### Status Colors
```css
--status-success: #10b981;
--status-warning: #f59e0b;
--status-info: #3b82f6;
--status-error: #ef4444;
```

## 3. 타이포그래피 시스템 (Typography System)

### 3.1 폰트 계층 구조 (Font Hierarchy)

| 용도 | 폰트 | 설명 |
| --- | --- | --- |
| **Hero / Display** | `Moneygraphy-Rounded` | 메인 페이지 타이틀, 브랜드 아이덴티티 |
| **UI / Interface** | `Pretendard` | 대부분의 UI 텍스트, 뛰어난 가독성 |
| **Code / Terminal** | `Consolas`, `Source Code Pro` | 코드 블록, 기술적 콘텐츠 |
| **Retro / Game** | `DungGeunMo` | 레트로 게임 UI, 특별한 효과 |
| **Content / Body** | `LINESeedKR`, `NoonnuBasicGothic` | 긴 텍스트, 읽기 편한 본문 |

### 3.2 타입 스케일 (Type Scale)

```css
/* Fluid Typography - 반응형 타입 시스템 */
--font-size-xs: clamp(0.75rem, 1.5vw, 0.875rem);    /* 12-14px */
--font-size-sm: clamp(0.875rem, 2vw, 1rem);         /* 14-16px */
--font-size-base: clamp(1rem, 2.5vw, 1.125rem);     /* 16-18px */
--font-size-lg: clamp(1.125rem, 3vw, 1.375rem);     /* 18-22px */
--font-size-xl: clamp(1.375rem, 4vw, 1.75rem);      /* 22-28px */
--font-size-2xl: clamp(1.75rem, 5vw, 2.25rem);      /* 28-36px */
--font-size-3xl: clamp(2.25rem, 6vw, 3rem);         /* 36-48px */
--font-size-hero: clamp(3rem, 8vw, 4.5rem);         /* 48-72px */
```

## 4. 컴포넌트 & 인터랙션 (Components & Interactions)

### 4.1 핵심 컴포넌트 (Core Components)

#### StarsBackground
- **목적**: 우주 공간을 유영하는 듯한 몰입감 제공
- **특징**: 동적인 별똥별 애니메이션, 깊이감 있는 레이어링
- **사용처**: 메인 페이지, 특별 섹션 배경

#### NavigationLayout
- **스타일**: 스크롤 기반 고정/플로팅 네비게이션
- **인터랙션**: 부드러운 전환, 섹션별 하이라이트
- **반응형**: 모바일 햄버거 메뉴 변환

#### GameCard
- **디자인**: 호버 시 3D 변환 효과
- **그림자**: 다층 그림자로 깊이감 표현
- **색상**: 게임별 테마 색상 적용

### 4.2 인터랙션 패턴 (Interaction Patterns)

#### Hover Effects
```css
/* 기본 호버 - 위로 떠오르는 효과 */
.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(195, 232, 141, 0.4);
}

/* 게임 카드 호버 - 3D 회전 */
.game-card:hover {
  transform: perspective(1000px) rotateY(5deg) translateY(-5px);
}
```

#### Transitions
```css
--transition-fast: 0.15s ease;
--transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

### 4.3 애니메이션 철학 (Animation Philosophy)

- **Purpose over Polish**: 모든 애니메이션은 명확한 목적을 가져야 함
- **Performance First**: 60fps 유지, GPU 가속 활용
- **Accessibility**: `prefers-reduced-motion` 존중

## 5. 섹션별 디자인 가이드 (Section-Specific Guidelines)

### 5.1 메인 페이지 (Main Page)
- **분위기**: 우주 탐험, 신비로운 여정의 시작
- **구성**: 풀스크린 섹션, 스크롤 스냅, 패럴랙스 효과
- **색상**: 어두운 배경 + 네온 액센트

### 5.2 TecoTeco 커뮤니티 (TecoTeco Community)
- **분위기**: 따뜻하고 포용적인 개발자 커뮤니티
- **구성**: 카드 기반 레이아웃, 멤버 프로필, 활동 피드
- **색상**: 부드러운 그라데이션, 따뜻한 액센트

### 5.3 Spotlight Arena 게임 센터 (Game Center)
- **분위기**: 활기차고 경쟁적이면서도 친근한 게임 공간
- **구성**: 게임 카탈로그, 실시간 리더보드, 녹화 기능
- **색상**: 게임별 테마 색상, 보라색 기반 통일감

### 5.4 Lab 실험실 (Laboratory)
- **분위기**: 실험적이고 창의적인 프로젝트 쇼케이스
- **구성**: 그리드 레이아웃, 인터랙티브 데모, 코드 미리보기
- **색상**: 다크 테마 + 프로젝트별 액센트

## 6. 반응형 디자인 전략 (Responsive Design Strategy)

### 6.1 브레이크포인트 (Breakpoints)
```css
--breakpoint-sm: 576px;   /* 모바일 */
--breakpoint-md: 768px;   /* 태블릿 세로 */
--breakpoint-lg: 992px;   /* 태블릿 가로 */
--breakpoint-xl: 1200px;  /* 데스크톱 */
--breakpoint-2xl: 1400px; /* 와이드 스크린 */
```

### 6.2 모바일 우선 접근 (Mobile-First Approach)
- 핵심 기능과 콘텐츠 우선 순위 정하기
- 터치 친화적 인터페이스 (최소 44px 터치 타겟)
- 제스처 기반 인터랙션 지원

## 7. 접근성 가이드라인 (Accessibility Guidelines)

### 7.1 색상 대비 (Color Contrast)
- WCAG AA 기준 충족 (최소 4.5:1)
- 중요 텍스트는 AAA 기준 목표 (7:1)
- 색맹 사용자를 위한 추가 시각적 단서 제공

### 7.2 키보드 네비게이션 (Keyboard Navigation)
- 모든 인터랙티브 요소 키보드 접근 가능
- 명확한 포커스 인디케이터
- 논리적인 탭 순서

### 7.3 스크린 리더 지원 (Screen Reader Support)
- 의미 있는 alt 텍스트
- ARIA 레이블 적절히 사용
- 동적 콘텐츠 변경 알림

## 8. 성능 최적화 가이드 (Performance Guidelines)

### 8.1 이미지 최적화
- WebP 포맷 우선 사용
- 반응형 이미지 (srcset)
- Lazy loading 적극 활용

### 8.2 코드 스플리팅
- 라우트 기반 코드 스플리팅
- 컴포넌트 레벨 lazy loading
- 크리티컬 CSS 인라인화

### 8.3 애니메이션 성능
- transform과 opacity 위주 사용
- will-change 신중하게 적용
- requestAnimationFrame 활용

## 9. 향후 디자인 방향성 (Future Design Direction)

### 9.1 확장 가능한 디자인 시스템
- 디자인 토큰 중앙 관리
- 테마 시스템 고도화 (다크/라이트/커스텀)
- 컴포넌트 라이브러리 문서화

### 9.2 실험적 요소
- WebGL 기반 3D 인터랙션
- AI 기반 개인화 경험
- 실시간 협업 기능

### 9.3 커뮤니티 주도 디자인
- 사용자 제작 테마 지원
- 커뮤니티 피드백 반영 프로세스
- 오픈소스 디자인 시스템

## 10. 구현 시 주의사항 (Implementation Notes)

### 10.1 CSS 아키텍처
- CSS Variables 적극 활용
- BEM 또는 CSS Modules 사용
- 유틸리티 클래스 최소화

### 10.2 컴포넌트 구조
- 단일 책임 원칙 준수
- Props 타입 명확히 정의
- 스토리북 문서화 권장

### 10.3 테스트
- 시각적 회귀 테스트
- 접근성 자동화 테스트
- 성능 벤치마크

---

> "AsyncSite는 단순히 보기 좋은 웹사이트가 아닌, 사용자가 머물고 싶어하는 디지털 공간을 만들어갑니다." 

이 가이드는 지속적으로 업데이트되며, 프로젝트의 성장과 함께 진화합니다.
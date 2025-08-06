# WhoWeAre 프로토타입 개발 현황

## 개요
AsyncSite의 'Who We Are' 섹션은 다양한 3D 인터랙션 프로토타입을 거쳐 현재의 형태로 발전했습니다. 
이 문서는 각 프로토타입의 특징과 개발 과정을 기록합니다.

## 프로토타입 버전 히스토리

### 1. 초기 버전 프로토타입
- **WhoWeArePage_original.tsx**: 최초 구현 버전
- **WhoWeAreV2Page.tsx**: 개선된 레이아웃
- **WhoWeAreV4Page.tsx**: 인터랙션 강화
- **WhoWeAreV5Page.tsx**: 성능 최적화

### 2. 3D 오브젝트 실험 시리즈

#### 구체(Sphere) 기반
- **WhoWeArePlanetPage.tsx**: 행성 컨셉
- **WhoWeArePlanetsIntuitivePage.tsx**: 직관적 행성 배치
- **WhoWeArePlanetsRandomPage.tsx**: 랜덤 행성 배치
- **WhoWeAreStoryPlanetsPage.tsx**: 스토리 기반 행성

#### 유리(Glass) 효과
- **WhoWeAreGlassPage.tsx**: 글라스모피즘 적용
- **WhoWeAreGlassOrbsPage.tsx**: 유리 구체

#### 크리스탈 효과
- **WhoWeAreCrystalOrbsPage.tsx**: 크리스탈 구체

### 3. 프로필 카드 시리즈
- **WhoWeAreProfilePage.tsx**: 기본 프로필
- **WhoWeAreProfileCardsPage.tsx**: 카드 형태
- **WhoWeAreProfileCardsCorePage.tsx**: 핵심 기능 중심
- **WhoWeAreProfileCardsJourneyPage.tsx**: 여정 스토리텔링
- **WhoWeAreProfileCardsSequencePage.tsx**: 시퀀스 애니메이션
- **WhoWeAreProfilePlanetsPage.tsx**: 프로필 + 행성 결합

### 4. 특수 효과 실험
- **WhoWeAreEnhancedPage.tsx**: 향상된 효과
- **WhoWeAreSubtlePage.tsx**: 미니멀한 접근
- **WhoWeAreScreenPage.tsx**: 스크린 기반 UI
- **WhoWeAreTeamNodesPage.tsx**: 노드 네트워크

## 현재 활성 버전
- **위치**: `src/pages/WhoWeArePage.tsx`
- **특징**: ThreeSceneFloatingStory 컴포넌트를 사용한 플로팅 카드 방식
- **최종 선택 이유**: 
  - 성능과 비주얼의 균형
  - 사용자 인터랙션의 직관성
  - 모바일 호환성

## 프로토타입 아카이브 위치
`archived/whoweare_prototypes/pages/`

모든 프로토타입 버전은 향후 참고와 재사용을 위해 보관되어 있습니다.

## 기술 스택
- React 19
- Three.js
- TypeScript
- CSS3 Animations

## 프로토타입 테스트 방법
프로토타입을 테스트하려면:
1. `src/router/subRouter.tsx`에서 라우트 변경
2. 원하는 프로토타입 컴포넌트를 import
3. 개발 서버 재시작

## 주요 학습 사항
1. **WebGL 컨텍스트 관리**: 여러 Three.js 씬을 동시에 운영할 때 메모리 관리 중요
2. **성능 최적화**: LOD, 텍스처 압축, 인스턴싱 필수
3. **접근성**: 3D 콘텐츠에도 키보드 네비게이션과 스크린 리더 지원 필요
4. **폴백 전략**: 저사양 기기를 위한 2D 버전 필수

---
*최종 업데이트: 2025년 1월 6일*
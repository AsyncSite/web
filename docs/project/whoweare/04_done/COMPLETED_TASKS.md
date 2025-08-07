# WhoWeAre 완료된 작업 목록

## 2025년 1월

### 1월 7일 - AI Guide 온보딩 시스템 구현 ✅

#### 구현 내용
1. **AI Guide 캐릭터 및 대화 시스템**
   - AsyncSite의 마스코트 'Async' 캐릭터 추가
   - 11개의 대화 단계로 구성된 온보딩 플로우
   - 사용자 선택에 따른 분기형 대화 구조
   - 타이핑 애니메이션 효과

2. **Three.js 씬 통합**
   - AI Guide 3D 캐릭터 (반투명 구체)를 씬에 추가
   - 대화와 동기화된 페이드 인/아웃 애니메이션
   - 중앙 고정 위치 (0, 0, 0)에 배치

3. **시각적 강조 효과**
   - 스토리 카드 강조: 초록색(#C3E88D) 발광 효과
   - 팀원 전체 강조: 약한 테두리 발광 효과
   - 개별 팀원 강조: 펄스 애니메이션
   - 대화 변경 시 효과 자동 초기화

4. **UX 개선사항**
   - 타이핑 완료 후 버튼 표시 (건너뛰기, 뒤로가기)
   - 도움받기 버튼 추가 (상단)
   - localStorage 활용한 온보딩 상태 저장
   - 종료 대화 5초 후 자동 닫기

5. **프로젝트 구조 변경**
   - AI Guide 버전이 메인 WhoWeAre 페이지로 승격
   - 기존 버전은 WhoWeAreOriginalPage로 이동
   - 레거시 URL 리다이렉트 설정

#### 구현된 파일
- `src/components/whoweare/onboarding/AIGuideDialogue.tsx`
- `src/components/whoweare/onboarding/AIGuideDialogue.css`
- `src/components/whoweare/onboarding/AIGuideStore.ts`
- `src/components/whoweare/ThreeScene.tsx` (기존 ThreeSceneAIGuide.tsx에서 이름 변경)
- `src/pages/WhoWeArePage.tsx` (AI Guide 버전)
- `src/pages/WhoWeAreOriginalPage.tsx` (기존 버전)

#### 기술적 특징
- Custom Event를 통한 React-Three.js 간 통신
- requestAnimationFrame을 활용한 부드러운 애니메이션
- TypeScript 타입 안전성 확보
- 메모리 누수 방지를 위한 cleanup 처리

### 1월 6일 - WebGL Context Exhaustion 버그 수정 ✅

#### 문제점
- 5-6회 줌인/줌아웃 상호작용 후 화면이 완전히 하얗게 변함
- 브라우저 콘솔: "WARNING: Too many active WebGL contexts. Oldest context will be lost."
- Three.js 씬이 응답하지 않고 페이지 새로고침 필요

#### 근본 원인
- 부모 컴포넌트(WhoWeArePage)에서 매 렌더링마다 새로운 콜백 함수 생성
- 이로 인해 ThreeSceneFloatingStory의 useEffect가 반복 실행
- WebGL 컨텍스트가 제대로 정리되지 않고 누적

#### 해결 방법
1. **React 콜백 최적화**
   - useCallback 훅을 사용하여 콜백 함수들 메모이제이션
   - handleStoryCardSelect, handleLoadComplete, handleLoadError 함수 안정화
   - 불필요한 useEffect 재실행 방지

2. **강화된 WebGL 리소스 정리**
   - 모든 텍스처 맵(map, normalMap, roughnessMap) 명시적 dispose
   - Scene에서 모든 객체 제거 및 부모-자식 관계 정리
   - OrbitControls dispose 추가
   - WEBGL_lose_context 확장을 사용한 강제 컨텍스트 해제
   - forceContextLoss() 호출로 완전한 정리 보장
   - 모든 ref를 null로 초기화

3. **모니터링 도구 추가**
   - WebGL 컨텍스트 실시간 모니터링 페이지 구현
   - 콘솔 로그로 컨텍스트 생성/정리 추적

#### 수정된 파일
- `src/pages/WhoWeArePage.tsx`
- `src/components/whoweare/ThreeSceneFloatingStory.tsx`

#### 검증 결과
- 20회 이상 줌인/줌아웃 후에도 정상 작동
- WebGL 컨텍스트가 1-2개로 안정적 유지
- 메모리 누수 없음

---

## 2025년 1월

### 1월 6일 - 3D 카드 텍스트 선명도 문제 해결

#### 문제점
- 3D 카드에 표시되는 텍스트가 흐리게 보임
- 2D 모드로 전환 시에만 선명하게 표시되던 문제

#### 해결 방법
1. **고해상도 캔버스 지원**
   - devicePixelRatio 기반 동적 해상도 조정 (최대 3배)
   - 메인 텍스트 캔버스: 512x384 → DPR 적용
   - 프로필 카드 캔버스: 256x320 (기존 128x160에서 2배 증가) → DPR 적용

2. **텍스처 필터링 최적화**
   - LinearFilter 적용으로 부드러운 스케일링
   - Anisotropic 필터링으로 각도별 선명도 향상
   - alphaTest 추가로 엣지 선명도 개선

3. **렌더러 설정 강화**
   - pixelRatio 제한을 2에서 3으로 증가
   - highp precision 모드 활성화
   - SRGBColorSpace로 정확한 색상 렌더링
   - NoToneMapping으로 텍스트 명확성 보장

4. **폰트 렌더링 개선**
   - 시스템 폰트 스택 사용 (Apple, Windows, Linux 최적화)
   - 폰트 크기 2배 증가로 고해상도 디스플레이 대응

#### 수정된 파일
- `src/components/whoweare/ThreeSceneFloatingStory.tsx`

---

## 2024년 (프로토타입 개발 단계)

### 프로토타입 버전 완성
- 22개의 다양한 3D 인터랙션 프로토타입 개발
- 최종 버전으로 ThreeSceneFloatingStory 선택
- archived/whoweare_prototypes로 모든 프로토타입 보관

### 팀 멤버 데이터 구조 확립
- 6명의 핵심 팀 멤버 정보 구조화
- 각 멤버별 색상 테마 및 포지션 설정
- 프로필 이미지 및 스토리텔링 콘텐츠 추가

### 기본 3D 씬 구현
- Three.js 기반 우주 공간 테마 구현
- 플로팅 카드 애니메이션
- 마우스 인터랙션 및 카메라 컨트롤

---

## 향후 참고사항

### 성공한 접근 방식
1. **프로토타입 다양성**: 여러 버전을 실험하여 최적의 UX 발견
2. **점진적 개선**: 작은 단위로 나누어 문제 해결
3. **성능 우선**: 비주얼보다 성능과 접근성 우선 고려

### 학습된 교훈
1. WebGL 컨텍스트 관리의 중요성
2. 텍스트 렌더링 시 DPR 고려 필수
3. 모바일 폴백 전략 필요성

---
*최종 업데이트: 2025년 1월 7일*
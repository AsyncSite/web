# WhoWeAre 페이지 온보딩 가이드 전략서

*작성일: 2025년 1월 6일*  
*작성자: AsyncSite Development Team*

---

## 📌 Executive Summary

첫 방문자가 WhoWeAre 페이지의 3D 우주 공간을 자연스럽게 탐험하며 AsyncSite의 철학과 팀 멤버를 알아갈 수 있도록 돕는 온보딩 가이드 시스템 구현 전략입니다.

**핵심 목표:**
- 처음 접하는 3D 인터페이스의 진입 장벽 낮추기
- 스토리텔링을 통한 브랜드 철학 전달
- 인터랙션 방법을 자연스럽게 학습시키기
- 탐험의 즐거움을 해치지 않으면서 가이드하기

---

## 🎯 문제 정의

### 현재 상황
- **3D 인터페이스 낯설음**: 일반적인 웹사이트와 다른 3D 공간에 당황할 수 있음
- **인터랙션 방법 불명확**: 무엇을 클릭해야 하는지, 어떻게 조작하는지 모름
- **콘텐츠 발견 어려움**: 스토리 패널과 팀 멤버가 공간에 흩어져 있어 놓칠 수 있음
- **목적 이해 부족**: 이 페이지가 무엇을 전달하려는지 즉시 파악하기 어려움

### 사용자 유형별 니즈
1. **완전 초보자**: 3D 웹 경험이 처음, 명확한 가이드 필요
2. **탐험가형**: 스스로 발견하길 원함, 최소한의 힌트만 필요
3. **효율추구형**: 빠르게 정보 파악하길 원함, Skip 옵션 필요
4. **재방문자**: 온보딩 없이 바로 콘텐츠 접근 원함

---

## 🗺️ 온보딩 전략 옵션

### 옵션 1: 🎬 시네마틱 자동 투어 (Cinematic Auto Tour)

#### 개념
영화적 카메라 워크로 공간을 자동 순회하며 핵심 요소를 보여주는 방식

#### 구현 방법
```typescript
interface CinematicTour {
  stages: [
    {
      id: 'intro',
      duration: 3000,
      camera: { position: [0, 5, 30], lookAt: [0, 0, 0] },
      overlay: '우주를 떠다니는 우리의 이야기를 만나보세요'
    },
    {
      id: 'story-focus',
      duration: 5000,
      camera: { position: [10, 3, 15], lookAt: storyPanel1 },
      overlay: '먼저 우리의 철학을 들어보세요',
      highlight: 'story-panels'
    },
    {
      id: 'team-overview',
      duration: 4000,
      camera: { orbit: true, radius: 20 },
      overlay: '각자의 궤도를 돌며 함께하는 팀원들',
      highlight: 'team-members'
    }
  ]
}
```

#### 장점
- **몰입감 높음**: 영화적 경험 제공
- **스토리텔링 강화**: 서사 순서 제어 가능
- **수동적 학습**: 사용자 조작 없이 전달

#### 단점
- **통제권 부족**: 사용자가 답답함 느낄 수 있음
- **재생 시간**: 30초 이상 소요 시 이탈 가능성
- **반복 시청 거부감**: 재방문 시 번거로움

---

### 옵션 2: 🎯 인터랙티브 스팟라이트 (Interactive Spotlight)

#### 개념
핵심 요소를 순차적으로 하이라이트하며 클릭 유도하는 방식

#### 구현 방법
```typescript
interface SpotlightGuide {
  steps: [
    {
      target: 'story-panel-1',
      spotlight: {
        intensity: 2,
        radius: 5,
        dimBackground: 0.3
      },
      tooltip: {
        content: '클릭해서 우리의 시작점을 확인하세요',
        position: 'bottom',
        arrow: true
      },
      pulse: true,
      waitForClick: true
    },
    {
      target: 'team-member-1',
      spotlight: { intensity: 1.5, radius: 3 },
      tooltip: {
        content: '팀원을 클릭하면 자세한 프로필을 볼 수 있어요',
        position: 'top'
      }
    }
  ],
  navigation: {
    showProgress: true,
    allowSkip: true,
    allowPrevious: true
  }
}
```

#### 장점
- **명확한 가이드**: 무엇을 해야 할지 명확
- **진행 제어**: 사용자 속도에 맞춤
- **학습 효과**: 실제 인터랙션 연습

#### 단점
- **탐험 제한**: 자유로운 탐색 방해
- **선형적 경험**: 정해진 순서 강요
- **UI 복잡도**: 추가 UI 요소 필요

---

### 옵션 3: 🧭 앰비언트 힌트 시스템 (Ambient Hint System)

#### 개념
공간에 자연스럽게 녹아든 시각적 힌트와 애니메이션으로 유도

#### 구현 방법
```typescript
interface AmbientHints {
  visualCues: {
    // 스토리 패널 주변 파티클 효과
    storyGlow: {
      type: 'particle-orbit',
      color: '#C3E88D',
      intensity: 'pulse',
      firstTimeOnly: true
    },
    // 팀 멤버 초기 회전 강조
    memberRotation: {
      initialSpeed: 0.02,
      slowDownAfter: 5000,
      normalSpeed: 0.005
    },
    // 클릭 가능 오브젝트 호버 피드백
    hoverFeedback: {
      scale: 1.1,
      glow: true,
      cursor: 'pointer'
    }
  },
  subtleMessages: {
    // 3초 후 페이드인되는 메시지
    delayed: [
      { time: 3000, text: '드래그로 공간을 둘러보세요', fadeOut: 5000 },
      { time: 8000, text: '빛나는 카드들을 클릭해보세요', fadeOut: 5000 }
    ]
  },
  smartAssist: {
    // 15초간 클릭 없으면 힌트 강화
    inactivityHint: {
      after: 15000,
      action: 'pulseNearestClickable'
    },
    // 모든 스토리 본 후 팀 멤버로 유도
    progressBasedHint: {
      condition: 'allStoriesViewed',
      action: 'highlightTeamMembers'
    }
  }
}
```

#### 장점
- **비침습적**: 경험을 방해하지 않음
- **자연스러움**: 공간의 일부처럼 느껴짐
- **적응형**: 사용자 행동에 반응

#### 단점
- **발견 어려움**: 힌트를 못 볼 수 있음
- **학습 시간**: 즉각적이지 않음
- **불확실성**: 명확한 지시 부재

---

### 옵션 4: 🤖 AI 가이드 캐릭터 (AI Guide Character) 

#### 개념
우주 공간을 안내하는 친근한 AI 캐릭터가 대화형으로 가이드

#### 구현 방법
```typescript
interface AIGuide {
  character: {
    model: 'floating-orb' | 'mini-astronaut' | 'star-sprite',
    position: 'follow-camera' | 'fixed-corner',
    personality: 'friendly' | 'professional' | 'playful'
  },
  dialogue: {
    introduction: [
      "안녕하세요! AsyncSite 우주 정거장에 오신 걸 환영해요 🚀",
      "제가 이곳을 안내해드릴게요. 먼저 우리의 이야기를 들어보시겠어요?"
    ],
    contextual: {
      nearStory: "이 카드에는 우리의 철학이 담겨있어요",
      nearMember: "팀원을 클릭하면 더 알아볼 수 있어요",
      afterInteraction: "잘하셨어요! 다른 것도 둘러보세요"
    }
  },
  interaction: {
    dismissible: true,
    minimizable: true,
    chatMode: false  // 향후 확장 가능
  }
}
```

#### 장점
- **친근함**: 인격화된 가이드로 부담 감소
- **맥락 제공**: 상황별 적절한 안내
- **브랜드 강화**: AsyncSite 캐릭터 구축

#### 단점
- **개발 복잡도**: 캐릭터 디자인/애니메이션 필요
- **취향 차이**: 캐릭터 선호도 갈림
- **주의 분산**: 메인 콘텐츠에서 시선 분산

---

## 💡 권장 솔루션: 하이브리드 적응형 시스템

### 핵심 컨셉
**"Progressive Disclosure + Ambient Intelligence"**
- 처음엔 명확한 가이드, 점차 자연스러운 힌트로 전환
- 사용자 행동 패턴을 학습하여 적응

### 구현 단계

#### Phase 1: 첫 진입 (0-5초)
```typescript
// 부드러운 진입 애니메이션
const entryAnimation = {
  camera: {
    from: { position: [0, 0, 50], fov: 40 },
    to: { position: [0, 3, 25], fov: 75 },
    duration: 3000,
    easing: 'easeOutQuart'
  },
  overlay: {
    title: 'AsyncSite Universe',
    subtitle: '우주를 떠다니는 우리들의 이야기',
    fadeIn: 1000,
    stay: 2000,
    fadeOut: 1000
  }
}
```

#### Phase 2: 소프트 튜토리얼 (5-20초)
```typescript
// 세 가지 핵심 인터랙션만 안내
const softTutorial = {
  steps: [
    {
      id: 'explore',
      visual: 'camera-orbit-hint',
      text: '드래그로 둘러보기',
      duration: 3000,
      skippable: true
    },
    {
      id: 'discover-story',
      visual: 'story-panel-glow',
      text: '빛나는 이야기 카드 클릭',
      waitForAction: true
    },
    {
      id: 'meet-team',
      visual: 'member-pulse',
      text: '팀원을 만나보세요',
      optional: true
    }
  ],
  presentation: 'floating-tooltip',  // 화면 하단 중앙
  allowDismiss: 'after-first-interaction'
}
```

#### Phase 3: 스마트 어시스트 (20초 이후)
```typescript
// 행동 기반 도움말
const smartAssist = {
  triggers: [
    {
      condition: 'no-interaction-15s',
      action: 'pulse-nearest-clickable',
      message: '가까운 카드를 클릭해보세요'
    },
    {
      condition: 'viewed-3-stories',
      action: 'highlight-team-area',
      message: '이제 팀원들을 만나볼 시간이에요'
    },
    {
      condition: 'all-content-viewed',
      action: 'show-cta',
      message: '함께 성장할 스터디 찾아보기 →'
    }
  ],
  persistence: {
    rememberProgress: true,
    skipOnReturn: true,
    resetAfter: 30 * 24 * 60 * 60 * 1000  // 30일
  }
}
```

### 비주얼 디자인

#### 1. 진입 시퀀스
```
[0s] 검은 화면에서 별들이 서서히 나타남
[1s] 카메라 천천히 후진하며 전체 공간 reveal
[3s] "AsyncSite Universe" 타이틀 페이드인
[5s] 첫 힌트 툴팁 등장
```

#### 2. 힌트 시스템 UI
```css
.onboarding-hint {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  
  background: rgba(195, 232, 141, 0.1);
  border: 1px solid rgba(195, 232, 141, 0.3);
  backdrop-filter: blur(10px);
  
  padding: 12px 24px;
  border-radius: 24px;
  
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  
  animation: slideUp 0.5s ease-out;
}

.hint-progress {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.hint-progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.hint-progress-dot.active {
  background: #C3E88D;
  width: 20px;
  border-radius: 3px;
}
```

#### 3. 스마트 하이라이트
```typescript
// 오브젝트 주변 소프트 글로우
const createSmartHighlight = (target: THREE.Object3D) => {
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      intensity: { value: 0 }
    },
    vertexShader: glowVertexShader,
    fragmentShader: glowFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  
  // 부드러운 펄스 애니메이션
  gsap.to(glowMaterial.uniforms.intensity, {
    value: 1,
    duration: 1,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 2
  });
};
```

### 사용자 설정 및 접근성

```typescript
interface OnboardingSettings {
  // localStorage에 저장
  preferences: {
    skipTutorial: boolean,
    reducedMotion: boolean,
    tooltipDuration: 'fast' | 'normal' | 'slow',
    language: 'ko' | 'en'
  },
  
  // 접근성 옵션
  accessibility: {
    keyboardShortcuts: {
      'Tab': 'nextElement',
      'Shift+Tab': 'previousElement',
      'Enter': 'interact',
      'Escape': 'closePanel',
      '?': 'showHelp'
    },
    screenReaderAnnouncements: boolean,
    highContrastHints: boolean
  },
  
  // 분석을 위한 트래킹
  analytics: {
    tutorialCompletion: number,  // 0-100%
    timeToFirstInteraction: number,
    clickedElements: string[],
    dropOffPoint: string | null
  }
}
```

---

## 📊 성공 지표

### 정량 지표
- **Tutorial Completion Rate**: 70% 이상
- **Time to First Interaction**: 10초 이내
- **Content Discovery Rate**: 80% (스토리 + 팀원)
- **Bounce Rate Reduction**: 30% 감소

### 정성 지표
- "어떻게 사용하는지 모르겠다" 피드백 제로
- "신선하고 재미있는 경험" 긍정 피드백
- 재방문 시 온보딩 스킵률 90% 이상

---

## 🚀 구현 로드맵

### Phase 1 (1주차): 기본 시스템
- [ ] 진입 애니메이션 구현
- [ ] 기본 툴팁 시스템 구축
- [ ] localStorage 상태 관리

### Phase 2 (2주차): 스마트 어시스트
- [ ] 사용자 행동 트래킹
- [ ] 조건부 힌트 시스템
- [ ] 프로그레스 인디케이터

### Phase 3 (3주차): 폴리싱
- [ ] 애니메이션 최적화
- [ ] 접근성 기능 추가
- [ ] A/B 테스트 준비

---

## 🎨 디자인 레퍼런스

### 영감을 받은 사례
1. **Journey (Game)**: 최소한의 UI로 자연스러운 가이드
2. **Google Earth**: 3D 공간 내 부드러운 튜토리얼
3. **Stripe Docs**: Progressive disclosure의 모범 사례
4. **GitHub Universe**: 우주 테마 인터랙티브 경험

### 피해야 할 패턴
- ❌ 모달 팝업 남발
- ❌ 강제 튜토리얼 완료
- ❌ 과도한 텍스트 설명
- ❌ 스킵 불가능한 애니메이션

---

## 💭 결론 및 제언

WhoWeAre 페이지의 온보딩은 **"가이드"라기보다 "초대"**여야 합니다.

우리가 추구하는 것은:
- 🌟 **경이로움의 순간**: "와, 이게 뭐지?" → "아, 이렇게 하는구나!" → "더 보고 싶어!"
- 🎯 **점진적 발견**: 한 번에 모든 것을 보여주지 않고, 호기심을 자극
- 🤝 **존중하는 안내**: 사용자의 속도와 스타일을 존중

**최종 권장안**: 
**하이브리드 적응형 시스템**을 기반으로, 초기엔 **앰비언트 힌트 시스템**의 부드러움을, 필요시 **인터랙티브 스팟라이트**의 명확함을 결합한 경험 설계

이를 통해 AsyncSite의 철학인 "따로 또 같이"를 온보딩 경험에서도 구현할 수 있을 것입니다.

---

*"좋은 온보딩은 보이지 않는 곳에서 빛난다" - RENE CHOI의 철학을 온보딩에도 적용*
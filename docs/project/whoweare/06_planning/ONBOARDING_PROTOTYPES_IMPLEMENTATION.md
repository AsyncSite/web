# WhoWeAre 온보딩 프로토타입 구현 계획서

*작성일: 2025년 1월 6일*  
*작성자: AsyncSite Development Team*

---

## 🎯 프로젝트 개요

WhoWeAre 페이지에 두 가지 온보딩 시스템 프로토타입을 구현하여 최적의 사용자 경험을 찾기 위한 실험입니다.

### 핵심 원칙
- ✅ **원본 보존**: 현재 `/whoweare` 페이지는 그대로 유지
- ✅ **독립 프로토타입**: 각각 별도 URL로 접근 가능
- ✅ **쉬운 롤백**: 언제든 원본으로 돌아갈 수 있는 구조

---

## 📁 파일 구조 및 라우팅 전략

### 현재 구조 (원본 보존)
```
src/
├── pages/
│   └── WhoWeArePage.tsx                    # 원본 (유지)
├── components/whoweare/
│   └── ThreeSceneFloatingStory.tsx        # 원본 (유지)
└── router/
    └── subRouter.tsx                       # 라우트 추가
```

### 프로토타입 추가 구조
```
src/
├── pages/
│   ├── WhoWeArePage.tsx                    # 원본 (유지)
│   ├── WhoWeAreHybridPage.tsx             # 프로토타입 1 (신규)
│   └── WhoWeAreAIGuidePage.tsx            # 프로토타입 2 (신규)
├── components/whoweare/
│   ├── ThreeSceneFloatingStory.tsx        # 원본 (유지)
│   ├── ThreeSceneHybridOnboarding.tsx     # 프로토타입 1 (신규)
│   ├── ThreeSceneAIGuide.tsx              # 프로토타입 2 (신규)
│   └── onboarding/                        # 온보딩 공통 컴포넌트 (신규)
│       ├── HybridHintSystem.tsx
│       ├── AIGuideCharacter.tsx
│       └── OnboardingStore.ts
└── router/
    └── subRouter.tsx                       # 라우트 추가
```

### 라우팅 설정
```typescript
// subRouter.tsx 수정
{
  path: 'whoweare',
  element: <WhoWeArePage />,              // 원본 유지
},
{
  path: 'whoweare-hybrid',
  element: <WhoWeAreHybridPage />,        // 프로토타입 1
},
{
  path: 'whoweare-ai-guide',
  element: <WhoWeAreAIGuidePage />,       // 프로토타입 2
},
```

### URL 접근
- 원본: `https://domain.com/whoweare`
- 프로토타입 1: `https://domain.com/whoweare-hybrid`
- 프로토타입 2: `https://domain.com/whoweare-ai-guide`

---

## 🔄 원본 보존 전략

### 1. 파일 복사 방식
```bash
# 프로토타입 1 생성
cp src/pages/WhoWeArePage.tsx src/pages/WhoWeAreHybridPage.tsx
cp src/components/whoweare/ThreeSceneFloatingStory.tsx \
   src/components/whoweare/ThreeSceneHybridOnboarding.tsx

# 프로토타입 2 생성
cp src/pages/WhoWeArePage.tsx src/pages/WhoWeAreAIGuidePage.tsx
cp src/components/whoweare/ThreeSceneFloatingStory.tsx \
   src/components/whoweare/ThreeSceneAIGuide.tsx
```

### 2. Git 브랜치 전략
```bash
# 원본 보호를 위한 브랜치 생성
git checkout -b feature/whoweare-onboarding-prototypes
git add .
git commit -m "feat: Add onboarding prototypes for WhoWeAre page"
```

### 3. 환경 변수로 전환 (선택적)
```typescript
// .env
REACT_APP_WHOWEARE_MODE=original|hybrid|ai-guide

// 조건부 렌더링
const WhoWeAreRouter = () => {
  const mode = process.env.REACT_APP_WHOWEARE_MODE || 'original';
  
  switch(mode) {
    case 'hybrid': return <WhoWeAreHybridPage />;
    case 'ai-guide': return <WhoWeAreAIGuidePage />;
    default: return <WhoWeArePage />;
  }
};
```

---

## 🚀 프로토타입 1: 하이브리드 적응형 시스템

### 개요
Progressive Disclosure + Ambient Intelligence를 결합한 단계적 온보딩

### 구현 파일
- `WhoWeAreHybridPage.tsx`
- `ThreeSceneHybridOnboarding.tsx`
- `HybridHintSystem.tsx`

### 핵심 구현 사항

#### 1. 진입 시퀀스 (0-5초)
```typescript
// ThreeSceneHybridOnboarding.tsx
interface EntrySequence {
  stages: [
    {
      id: 'fade-in',
      duration: 1000,
      action: () => {
        // 별들이 서서히 나타남
        scene.fog = new THREE.Fog(0x000000, 100, 10); // 역방향
        gsap.to(scene.fog, {
          near: 10,
          far: 100,
          duration: 1,
          ease: "power2.out"
        });
      }
    },
    {
      id: 'camera-pullback',
      duration: 3000,
      action: () => {
        // 카메라 천천히 후진
        gsap.from(camera.position, {
          z: 50,
          duration: 3,
          ease: "power3.out"
        });
      }
    },
    {
      id: 'title-reveal',
      duration: 2000,
      action: () => {
        setShowTitle(true);
        setTimeout(() => setShowTitle(false), 3000);
      }
    }
  ]
}
```

#### 2. 힌트 시스템 컴포넌트
```typescript
// HybridHintSystem.tsx
import React, { useState, useEffect } from 'react';
import './HybridHintSystem.css';

interface HintSystemProps {
  currentStep: number;
  onSkip: () => void;
  onComplete: () => void;
}

export const HybridHintSystem: React.FC<HintSystemProps> = ({
  currentStep,
  onSkip,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const hints = [
    {
      id: 'explore',
      text: '드래그로 우주 공간을 둘러보세요',
      icon: '🔄',
      duration: 3000
    },
    {
      id: 'discover',
      text: '빛나는 이야기 카드를 클릭해보세요',
      icon: '✨',
      waitForAction: true
    },
    {
      id: 'meet',
      text: '팀원들을 만나보세요',
      icon: '👥',
      optional: true
    }
  ];

  useEffect(() => {
    // localStorage에서 온보딩 상태 확인
    const hasSeenOnboarding = localStorage.getItem('whoweare-onboarding-seen');
    if (hasSeenOnboarding === 'true') {
      onComplete();
      return;
    }
    
    // 5초 후 첫 힌트 표시
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleInteraction = () => {
    setHasInteracted(true);
    if (currentStep < hints.length - 1) {
      // 다음 단계로
    } else {
      localStorage.setItem('whoweare-onboarding-seen', 'true');
      onComplete();
    }
  };

  if (!isVisible || hasInteracted) return null;

  return (
    <div className="hybrid-hint-container">
      <div className="hybrid-hint-bubble">
        <span className="hint-icon">{hints[currentStep].icon}</span>
        <span className="hint-text">{hints[currentStep].text}</span>
        <button className="hint-skip" onClick={onSkip}>건너뛰기</button>
      </div>
      <div className="hint-progress">
        {hints.map((_, index) => (
          <div 
            key={index}
            className={`progress-dot ${index === currentStep ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 3. 스마트 하이라이트 시스템
```typescript
// ThreeSceneHybridOnboarding.tsx 내부
const createSmartHighlight = (target: any, intensity: number = 1) => {
  // 기존 글로우 제거
  const existingGlow = target.getObjectByName('glow');
  if (existingGlow) {
    target.remove(existingGlow);
  }
  
  // 새 글로우 생성
  const glowGeometry = target.geometry.clone();
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      intensity: { value: 0 },
      color: { value: new THREE.Color(0xC3E88D) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform vec3 color;
      varying vec3 vNormal;
      
      void main() {
        float pulse = sin(time * 3.0) * 0.5 + 0.5;
        float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(color, fresnel * intensity * pulse);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  glowMesh.name = 'glow';
  glowMesh.scale.multiplyScalar(1.2);
  target.add(glowMesh);
  
  // 애니메이션
  const animate = () => {
    glowMaterial.uniforms.time.value += 0.01;
    if (glowMaterial.uniforms.intensity.value < intensity) {
      glowMaterial.uniforms.intensity.value += 0.02;
    }
  };
  
  return { glowMesh, animate };
};
```

#### 4. 행동 기반 트리거
```typescript
// OnboardingStore.ts
class OnboardingStore {
  private lastInteractionTime: number = Date.now();
  private interactionCount: number = 0;
  private viewedStories: Set<string> = new Set();
  private viewedMembers: Set<string> = new Set();
  
  checkInactivity() {
    const now = Date.now();
    const timeSinceLastInteraction = now - this.lastInteractionTime;
    
    if (timeSinceLastInteraction > 15000 && this.interactionCount === 0) {
      // 15초 동안 인터랙션 없음 - 가장 가까운 요소 하이라이트
      return 'highlight-nearest';
    }
    
    if (this.viewedStories.size >= 3 && this.viewedMembers.size === 0) {
      // 스토리 3개 이상 봤는데 멤버는 안 봄
      return 'suggest-members';
    }
    
    if (this.viewedStories.size >= 5 && this.viewedMembers.size >= 3) {
      // 충분히 탐색함 - CTA 표시
      return 'show-cta';
    }
    
    return null;
  }
  
  recordInteraction(type: 'story' | 'member', id: string) {
    this.lastInteractionTime = Date.now();
    this.interactionCount++;
    
    if (type === 'story') {
      this.viewedStories.add(id);
    } else {
      this.viewedMembers.add(id);
    }
  }
}

export const onboardingStore = new OnboardingStore();
```

### CSS 스타일
```css
/* HybridHintSystem.css */
.hybrid-hint-container {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideUpFade 0.5s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.hybrid-hint-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(195, 232, 141, 0.1);
  border: 1px solid rgba(195, 232, 141, 0.3);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.hint-icon {
  font-size: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hint-skip {
  margin-left: 20px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.hint-skip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.hint-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.progress-dot.active {
  width: 20px;
  background: #C3E88D;
  border-radius: 3px;
}
```

---

## 🤖 프로토타입 2: AI 가이드 캐릭터

### 개요
우주 공간을 안내하는 친근한 AI 캐릭터 "Async"가 대화형으로 가이드

### 구현 파일
- `WhoWeAreAIGuidePage.tsx`
- `ThreeSceneAIGuide.tsx`
- `AIGuideCharacter.tsx`

### 핵심 구현 사항

#### 1. AI 캐릭터 모델
```typescript
// AIGuideCharacter.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface AIGuideProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  onDialogueEnd: () => void;
}

export class AIGuideCharacter {
  private mesh: THREE.Group;
  private position: THREE.Vector3;
  private targetPosition: THREE.Vector3;
  private state: 'idle' | 'talking' | 'pointing' | 'following';
  
  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(5, 3, 10);
    this.targetPosition = this.position.clone();
    this.state = 'idle';
    
    this.createCharacter();
    scene.add(this.mesh);
  }
  
  private createCharacter() {
    // 메인 바디 (빛나는 구체)
    const geometry = new THREE.IcosahedronGeometry(0.5, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    
    const body = new THREE.Mesh(geometry, material);
    this.mesh.add(body);
    
    // 궤도 링
    const ringGeometry = new THREE.TorusGeometry(0.8, 0.05, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xC3E88D,
      transparent: true,
      opacity: 0.6
    });
    
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    this.mesh.add(ring1);
    
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.rotation.y = Math.PI / 2;
    this.mesh.add(ring2);
    
    // 파티클 이펙트
    const particleCount = 20;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = (i / 3) * (Math.PI * 2 / particleCount);
      const radius = 1 + Math.random() * 0.5;
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = (Math.random() - 0.5) * 0.5;
      positions[i + 2] = Math.sin(angle) * radius;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xC3E88D,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.mesh.add(particles);
    
    this.mesh.position.copy(this.position);
  }
  
  public moveTo(target: THREE.Vector3, duration: number = 1000) {
    this.targetPosition = target.clone();
    this.state = 'following';
    
    // GSAP 또는 자체 애니메이션으로 부드럽게 이동
    const startPos = this.position.clone();
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutQuad(progress);
      
      this.position.lerpVectors(startPos, this.targetPosition, eased);
      this.mesh.position.copy(this.position);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.state = 'idle';
      }
    };
    
    animate();
  }
  
  public pointTo(target: THREE.Vector3) {
    this.state = 'pointing';
    
    // 타겟 방향으로 회전
    const direction = target.clone().sub(this.position).normalize();
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;
    
    // 포인팅 애니메이션 (살짝 앞으로 기울임)
    this.mesh.rotation.x = -0.2;
    
    setTimeout(() => {
      this.mesh.rotation.x = 0;
      this.state = 'idle';
    }, 1000);
  }
  
  public talk(duration: number = 2000) {
    this.state = 'talking';
    
    // 말하는 애니메이션 (진동 효과)
    const originalScale = this.mesh.scale.x;
    const animate = () => {
      if (this.state !== 'talking') return;
      
      this.mesh.scale.setScalar(
        originalScale + Math.sin(Date.now() * 0.01) * 0.1
      );
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    setTimeout(() => {
      this.state = 'idle';
      this.mesh.scale.setScalar(originalScale);
    }, duration);
  }
  
  public update() {
    // 아이들 상태일 때 부드러운 회전
    if (this.state === 'idle') {
      this.mesh.rotation.y += 0.005;
      this.mesh.children[1].rotation.z += 0.01; // 링 회전
      this.mesh.children[2].rotation.z -= 0.01; // 링 회전
    }
    
    // 파티클 애니메이션
    const particles = this.mesh.children[3] as THREE.Points;
    if (particles && particles.geometry) {
      particles.rotation.y += 0.002;
    }
  }
  
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}
```

#### 2. 대화 시스템
```typescript
// AIGuideDialogue.tsx
interface DialogueStep {
  id: string;
  text: string;
  action?: 'move' | 'point' | 'highlight';
  target?: THREE.Vector3 | string;
  choices?: {
    text: string;
    next: string;
  }[];
  duration?: number;
}

export const dialogueScript: DialogueStep[] = [
  {
    id: 'greeting',
    text: '안녕하세요! 저는 Async예요. AsyncSite 우주 정거장에 오신 걸 환영해요! 🚀',
    duration: 3000
  },
  {
    id: 'introduction',
    text: '이곳은 우리 팀의 이야기와 철학이 담긴 특별한 공간이에요. 제가 안내해드릴게요!',
    duration: 3000,
    choices: [
      { text: '좋아요, 안내해주세요!', next: 'tour_start' },
      { text: '혼자 둘러볼게요', next: 'explore_alone' }
    ]
  },
  {
    id: 'tour_start',
    text: '먼저 저 빛나는 카드들을 보세요. 우리의 철학이 담겨있어요.',
    action: 'point',
    target: 'nearest_story',
    duration: 3000
  },
  {
    id: 'story_guide',
    text: '카드를 클릭하면 자세한 이야기를 볼 수 있어요. 한번 시도해보세요!',
    action: 'highlight',
    target: 'story_panel_1',
    duration: 3000
  },
  {
    id: 'after_story_click',
    text: '잘하셨어요! 이런 식으로 모든 이야기를 탐험할 수 있어요.',
    duration: 2000
  },
  {
    id: 'team_introduction',
    text: '이제 우리 팀원들을 만나볼 차례예요. 각자의 궤도를 돌고 있죠.',
    action: 'move',
    target: new THREE.Vector3(0, 5, 15),
    duration: 3000
  },
  {
    id: 'member_guide',
    text: '팀원을 클릭하면 더 자세히 알아볼 수 있어요. RENE CHOI부터 만나보실래요?',
    action: 'point',
    target: 'member_rene',
    duration: 3000
  },
  {
    id: 'exploration_tip',
    text: '마우스를 드래그하면 공간을 360도 둘러볼 수 있어요. 자유롭게 탐험해보세요!',
    duration: 3000
  },
  {
    id: 'farewell',
    text: '이제 혼자서도 충분히 탐험할 수 있을 거예요. 필요하면 언제든 저를 불러주세요! ✨',
    duration: 3000
  },
  {
    id: 'explore_alone',
    text: '알겠어요! 혼자 탐험하시는 걸 선택하셨네요. 저는 여기서 기다릴게요. 도움이 필요하면 물음표 버튼을 눌러주세요!',
    duration: 3000
  }
];
```

#### 3. 대화 UI 컴포넌트
```typescript
// AIGuideDialogueUI.tsx
import React, { useState, useEffect } from 'react';
import './AIGuideDialogue.css';

interface DialogueUIProps {
  currentDialogue: DialogueStep | null;
  onChoice: (nextId: string) => void;
  onDismiss: () => void;
}

export const AIGuideDialogueUI: React.FC<DialogueUIProps> = ({
  currentDialogue,
  onChoice,
  onDismiss
}) => {
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!currentDialogue) return;
    
    setIsTyping(true);
    setDisplayedText('');
    
    // 타이핑 효과
    const text = currentDialogue.text;
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);
    
    return () => clearInterval(typeInterval);
  }, [currentDialogue]);
  
  if (!currentDialogue) return null;
  
  return (
    <div className="ai-guide-dialogue-container">
      <div className="ai-guide-avatar">
        <div className="avatar-glow"></div>
        <div className="avatar-core">
          <span className="avatar-emoji">🤖</span>
        </div>
      </div>
      
      <div className="dialogue-bubble">
        <div className="dialogue-text">
          {displayedText}
          {isTyping && <span className="typing-cursor">|</span>}
        </div>
        
        {!isTyping && currentDialogue.choices && (
          <div className="dialogue-choices">
            {currentDialogue.choices.map((choice, index) => (
              <button
                key={index}
                className="choice-button"
                onClick={() => onChoice(choice.next)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
        
        <button className="dialogue-dismiss" onClick={onDismiss}>
          ×
        </button>
      </div>
    </div>
  );
};
```

#### 4. AI 가이드 통합
```typescript
// ThreeSceneAIGuide.tsx 추가 코드
const aiGuide = useRef<AIGuideCharacter | null>(null);
const [currentDialogueId, setCurrentDialogueId] = useState('greeting');
const [isGuideActive, setIsGuideActive] = useState(true);

useEffect(() => {
  if (scene && !aiGuide.current) {
    aiGuide.current = new AIGuideCharacter(scene);
  }
}, [scene]);

// 대화 진행 관리
const handleDialogueProgress = (dialogueStep: DialogueStep) => {
  if (!aiGuide.current) return;
  
  switch (dialogueStep.action) {
    case 'move':
      if (dialogueStep.target instanceof THREE.Vector3) {
        aiGuide.current.moveTo(dialogueStep.target);
      }
      break;
      
    case 'point':
      if (typeof dialogueStep.target === 'string') {
        const targetObject = findObjectByName(dialogueStep.target);
        if (targetObject) {
          aiGuide.current.pointTo(targetObject.position);
        }
      }
      break;
      
    case 'highlight':
      if (typeof dialogueStep.target === 'string') {
        const targetObject = findObjectByName(dialogueStep.target);
        if (targetObject) {
          createSmartHighlight(targetObject, 2);
        }
      }
      break;
  }
  
  // 대화 애니메이션
  aiGuide.current.talk(dialogueStep.duration || 2000);
};

// 애니메이션 루프에 추가
const animate = () => {
  // ... 기존 애니메이션 코드
  
  if (aiGuide.current) {
    aiGuide.current.update();
  }
  
  // ... 렌더링
};
```

### CSS 스타일
```css
/* AIGuideDialogue.css */
.ai-guide-dialogue-container {
  position: fixed;
  bottom: 100px;
  left: 40px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  z-index: 1000;
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-guide-avatar {
  position: relative;
  width: 60px;
  height: 60px;
}

.avatar-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(195, 232, 141, 0.4) 0%, transparent 70%);
  animation: pulse 2s infinite;
}

.avatar-core {
  position: relative;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00ff88, #C3E88D);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(195, 232, 141, 0.5);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.avatar-emoji {
  font-size: 30px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.dialogue-bubble {
  position: relative;
  max-width: 400px;
  padding: 20px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(195, 232, 141, 0.3);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.dialogue-bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  bottom: 20px;
  width: 20px;
  height: 20px;
  background: rgba(26, 26, 26, 0.95);
  border-left: 1px solid rgba(195, 232, 141, 0.3);
  border-bottom: 1px solid rgba(195, 232, 141, 0.3);
  transform: rotate(45deg);
}

.dialogue-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.typing-cursor {
  color: #C3E88D;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.dialogue-choices {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.choice-button {
  padding: 8px 16px;
  background: rgba(195, 232, 141, 0.1);
  border: 1px solid rgba(195, 232, 141, 0.3);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.choice-button:hover {
  background: rgba(195, 232, 141, 0.2);
  transform: translateY(-2px);
}

.dialogue-dismiss {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.dialogue-dismiss:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}
```

---

## 📊 구현 체크리스트

### 공통 작업
- [ ] 원본 파일 백업
- [ ] Git 브랜치 생성
- [ ] 라우터 설정 추가
- [ ] 파일 복사 및 이름 변경

### 프로토타입 1: 하이브리드 시스템
- [ ] `WhoWeAreHybridPage.tsx` 생성
- [ ] `ThreeSceneHybridOnboarding.tsx` 생성
- [ ] `HybridHintSystem.tsx` 컴포넌트 구현
- [ ] 진입 애니메이션 시퀀스
- [ ] 스마트 하이라이트 시스템
- [ ] 행동 기반 트리거 로직
- [ ] localStorage 상태 관리
- [ ] CSS 스타일링

### 프로토타입 2: AI 가이드
- [ ] `WhoWeAreAIGuidePage.tsx` 생성
- [ ] `ThreeSceneAIGuide.tsx` 생성
- [ ] `AIGuideCharacter.tsx` 3D 모델 구현
- [ ] 대화 시스템 구현
- [ ] 대화 UI 컴포넌트
- [ ] 캐릭터 애니메이션
- [ ] 인터랙션 연동
- [ ] CSS 스타일링

### 테스트 및 최적화
- [ ] 각 프로토타입 독립 테스트
- [ ] 원본과 비교 테스트
- [ ] 성능 프로파일링
- [ ] 모바일 호환성 확인
- [ ] 접근성 테스트

---

## 🚨 주의사항

### 충돌 방지
1. **import 경로 확인**: 복사한 파일들의 import 경로를 새 파일명에 맞게 수정
2. **컴포넌트명 변경**: React 컴포넌트 이름도 파일명과 일치하도록 수정
3. **CSS 클래스명**: 프로토타입별로 고유한 prefix 사용 (예: `hybrid-`, `ai-guide-`)

### 상태 격리
```typescript
// localStorage 키 분리
const STORAGE_KEYS = {
  original: 'whoweare-visited',
  hybrid: 'whoweare-hybrid-onboarding',
  aiGuide: 'whoweare-ai-guide-progress'
};
```

### 롤백 계획
```bash
# 프로토타입이 만족스럽지 않을 경우
git checkout main
git branch -D feature/whoweare-onboarding-prototypes

# 또는 특정 파일만 되돌리기
git checkout main -- src/pages/WhoWeArePage.tsx
git checkout main -- src/components/whoweare/ThreeSceneFloatingStory.tsx
```

---

## 📈 성능 고려사항

### 메모리 관리
- AI 캐릭터 모델은 추가 메모리 사용 (~5MB)
- 하이브리드 시스템은 최소한의 오버헤드
- 두 프로토타입 모두 기존 cleanup 로직 유지 필수

### 로딩 최적화
```typescript
// Lazy loading for onboarding components
const HybridHintSystem = lazy(() => import('./HybridHintSystem'));
const AIGuideCharacter = lazy(() => import('./AIGuideCharacter'));
```

### 애니메이션 성능
- requestAnimationFrame 사용
- GPU 가속 활용 (transform, opacity)
- 불필요한 re-render 방지

---

## 🎯 테스트 시나리오

### 시나리오 1: 첫 방문자
1. 각 프로토타입 URL 접속
2. 온보딩 전체 flow 완료
3. localStorage 저장 확인
4. 페이지 새로고침 후 온보딩 스킵 확인

### 시나리오 2: 중도 이탈
1. 온보딩 중간에 스킵
2. 다른 요소 클릭 시 반응
3. 온보딩 재개 또는 종료 확인

### 시나리오 3: 성능 테스트
1. Chrome DevTools Performance 탭
2. 60fps 유지 확인
3. 메모리 사용량 모니터링
4. WebGL 컨텍스트 안정성

---

## 📅 구현 일정

### Day 1: 환경 설정
- 파일 구조 생성
- 라우팅 설정
- 기본 컴포넌트 복사

### Day 2-3: 프로토타입 1 (하이브리드)
- 핵심 기능 구현
- UI 컴포넌트 개발
- 애니메이션 적용

### Day 4-5: 프로토타입 2 (AI 가이드)
- 캐릭터 모델링
- 대화 시스템 구현
- 인터랙션 연동

### Day 6: 테스트 및 최적화
- 통합 테스트
- 버그 수정
- 성능 최적화

### Day 7: 문서화 및 배포
- 사용 가이드 작성
- A/B 테스트 준비
- 배포

---

*이 문서는 구현 과정에서 지속적으로 업데이트됩니다.*
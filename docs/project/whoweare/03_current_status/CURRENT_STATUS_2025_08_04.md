# AsyncSite "Who We Are" 섹션 기획 및 구현 계획서

## 1. 프로젝트 컨텍스트 이해

AsyncSite는 "고독한 개발자들이 함께 연결되어, 끊임없이 배우고 공유하며 집단적 성장을 이루는 지속가능한 에코시스템"을 구축하는 플랫폼입니다. 이 프로젝트의 핵심 가치는:

- **연결(Connection)**: 함께 읽고 쓰고 대화하며 집단 지성 구현
- **성장(Growth)**: 기술적, 비기술적 역량을 포함한 총체적 성장
- **지속가능성(Sustainability)**: 시스템을 통해 모임과 성장이 꾸준히 이어지도록 함

디자인 언어는 "Cosmic Minimalism"으로, 우주적 신비로움과 미니멀한 인터페이스의 조화를 추구합니다.

## 2. 3D_IMPROVEMENT_COMMAND 프로토타입 분석

현재 구현된 프로토타입의 강점:
- Three.js를 활용한 몰입감 있는 3D 공간
- 우주 공간 컨셉과 일치하는 비주얼
- 플로팅 애니메이션과 인터랙션

개선이 필요한 부분:
- 추상적인 구체를 개인의 정체성이 드러나는 오브젝트로 변경
- 정보 접근성 향상 (클릭 전에도 이름/역할 표시)
- 모바일/저사양 대응
- 사용자의 다음 행동 유도

## 3. "Who We Are" 섹션 종합 기획안

### 3.1 컨셉: "우주 정거장의 크루들"

AsyncSite를 우주 탐험선으로, 팀원들을 각자의 전문성을 가진 크루로 표현합니다. 이는 프로젝트의 "우주적 신비로움" 테마와 "함께하는 여정"이라는 가치관을 시각적으로 구현합니다.

### 3.2 구현 방향

**A. 3D 공간 고도화 (메인 경험)**

```typescript
interface TeamMember {
  id: string;
  nameKo: string;
  nameEn: string;
  role: string;
  quote: string;
  story: string;
  currentFocus: string;
  avatar: {
    type: 'astronaut' | 'hologram' | 'robot';
    color: string;
    animation: 'floating' | 'working' | 'communicating';
  };
  workstation: {
    tools: string[];
    screens: string[];
    personalItems: string[];
  };
}
```

**주요 개선사항:**

1. **개인화된 3D 아바타**
   - 우주복을 입은 캐릭터 또는 홀로그램 형태
   - 각 멤버의 역할을 상징하는 도구나 오브젝트 소지
   - 개인별 색상 테마와 파티클 효과

2. **워크스테이션 디자인**
   - 각 멤버가 작업하는 미래적인 워크스테이션
   - 역할별 특수 장비 (예: Platform Engineer는 서버 홀로그램, UX Designer는 3D 프로토타입 등)

3. **동적 관계 시각화**
   - 멤버 간 협업 관계를 빛나는 연결선으로 표현
   - 실시간 데이터 흐름 애니메이션

4. **인터랙티브 요소**
   - 멤버에게 접근 시 자동으로 카메라 줌인
   - 음성 인사말 또는 타이핑 사운드 효과
   - 키보드 단축키로 빠른 네비게이션

**B. 2D 폴백 버전 (접근성 보장)**

```typescript
interface FallbackLayout {
  type: 'grid' | 'constellation' | 'timeline';
  animations: 'subtle' | 'none';
  interactions: 'hover' | 'click' | 'both';
}
```

모바일이나 저사양 환경을 위한 2D 버전:
- CSS Grid 기반의 카드 레이아웃
- 별자리 형태로 멤버들을 연결하는 인터랙티브 맵
- 가벼운 CSS 애니메이션과 트랜지션

### 3.3 팀 멤버 데이터 구조

```typescript
const teamMembers: TeamMember[] = [
  {
    id: 'rene-choi',
    nameKo: 'Rene Choi',
    nameEn: 'Rene Choi',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    currentFocus: 'MSA 아키텍처 최적화',
    avatar: {
      type: 'astronaut',
      color: '#6366f1',
      animation: 'working'
    },
    workstation: {
      tools: ['Architecture Diagrams', 'System Monitor'],
      screens: ['Service Mesh', 'Performance Metrics'],
      personalItems: ['Coffee Mug', 'Architecture Books']
    }
  },
  {
    id: 'mihyun-park',
    nameKo: '미현 박',
    nameEn: 'Mihyun Park',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    currentFocus: '3D 인터랙션 디자인',
    avatar: {
      type: 'hologram',
      color: '#C3E88D',
      animation: 'communicating'
    },
    workstation: {
      tools: ['3D Design Tools', 'Color Palette'],
      screens: ['User Flow', 'Prototype'],
      personalItems: ['Sketch Book', 'Design Awards']
    }
  },
  {
    id: 'jiyeon-kim',
    nameKo: '지연 김',
    nameEn: 'Jiyeon Kim',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    currentFocus: '커뮤니티 성장 전략',
    avatar: {
      type: 'astronaut',
      color: '#34d399',
      animation: 'floating'
    },
    workstation: {
      tools: ['Community Dashboard', 'Growth Metrics'],
      screens: ['Member Journey', 'Engagement Stats'],
      personalItems: ['Plant', 'Community Photos']
    }
  },
  {
    id: 'jinwoo-cho',
    nameKo: '진우 조',
    nameEn: 'Jinwoo Cho',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    currentFocus: '시스템 최적화',
    avatar: {
      type: 'robot',
      color: '#82aaff',
      animation: 'working'
    },
    workstation: {
      tools: ['Terminal', 'System Monitor'],
      screens: ['Code Editor', 'Performance Graph'],
      personalItems: ['Mechanical Keyboard', 'Tech Books']
    }
  },
  {
    id: 'geon-lee',
    nameKo: 'Geon Lee',
    nameEn: 'Geon Lee',
    role: 'Connection Engineer',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    currentFocus: '실시간 데이터 파이프라인',
    avatar: {
      type: 'hologram',
      color: '#f87171',
      animation: 'communicating'
    },
    workstation: {
      tools: ['Data Pipeline', 'Analytics Dashboard'],
      screens: ['Real-time Metrics', 'Data Flow'],
      personalItems: ['Coffee Machine', 'Data Viz Books']
    }
  },
  {
    id: 'dongmin-cha',
    nameKo: '차동민',
    nameEn: 'Dongmin Cha',
    role: 'Platform Engineer',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    currentFocus: '클라우드 인프라 구축',
    avatar: {
      type: 'astronaut',
      color: '#f59e0b',
      animation: 'working'
    },
    workstation: {
      tools: ['Infrastructure Diagram', 'Monitoring Tools'],
      screens: ['Cloud Console', 'Security Dashboard'],
      personalItems: ['Server Model', 'DevOps Stickers']
    }
  }
];
```

### 3.4 기술 구현 전략

**1단계: 핵심 3D 씬 구축**
- Three.js 씬 최적화 (LOD, Instancing 활용)
- React Three Fiber 도입 검토
- 성능 모니터링 및 프레임 제한

**2단계: 인터랙션 레이어**
- Raycasting 최적화
- 부드러운 카메라 전환
- 상태 관리 (Zustand 또는 Context API)

**3단계: 2D 폴백 구현**
- 미디어 쿼리와 기기 감지
- Progressive Enhancement 전략
- 동일한 데이터로 다른 뷰 렌더링

**4단계: 통합 및 최적화**
- 코드 스플리팅
- 텍스처 압축 및 최적화
- 접근성 개선 (ARIA labels, 키보드 네비게이션)

## 4. 창의적 제안사항

### 4.1 "미션 컨트롤" 이스터에그
- Konami Code 입력 시 우주 정거장 전체 뷰로 전환
- 각 멤버의 실시간 활동 상태 표시 (GitHub 커밋, 블로그 포스팅 등)
- AsyncSite의 실시간 통계 대시보드

### 4.2 역할별 특수 효과
- **Product Architect**: 주변에 시스템 아키텍처 다이어그램이 홀로그램으로 떠다님
- **Experience Designer**: 컬러풀한 디자인 파티클이 계속 생성됨
- **System Engineer**: 서버 상태를 나타내는 LED 표시등
- **Growth Path Builder**: 성장 경로를 나타내는 빛나는 길
- **Connection Engineer**: 다른 멤버들과 연결되는 실시간 데이터 스트림
- **Platform Engineer**: 안정적인 기반을 상징하는 단단한 플랫폼

### 4.3 "우주 탐험" 인터랙션
- 스크롤이나 드래그로 우주 정거장을 탐험
- 숨겨진 공간에 팀의 히스토리나 재미있는 에피소드
- 미래 비전을 보여주는 "관측 창"

## 5. 구현 우선순위 및 일정

**Phase 1 (1주차)**: 기본 구조 및 3D 씬
- Three.js 씬 설정 및 기본 레이아웃
- 팀 멤버 데이터 구조 확정
- 기본 인터랙션 구현

**Phase 2 (2주차)**: 개인화 및 디테일
- 멤버별 커스텀 오브젝트 제작
- 애니메이션 및 파티클 효과
- 사운드 디자인

**Phase 3 (3주차)**: 2D 폴백 및 최적화
- 반응형 2D 레이아웃 구현
- 성능 최적화
- 접근성 개선

**Phase 4 (4주차)**: 통합 및 마무리
- 메인 사이트와 통합
- QA 및 버그 수정
- 문서화

## 6. 성공 지표

- **성능**: 60fps 유지 (중급 사양 기준)
- **접근성**: WCAG AA 기준 충족
- **참여도**: 평균 체류 시간 2분 이상
- **호환성**: 모든 주요 브라우저 지원

## 7. 결론

"Who We Are" 섹션은 단순한 팀 소개를 넘어, AsyncSite의 비전과 가치를 체험할 수 있는 인터랙티브한 공간이 될 것입니다. 우주 탐험이라는 메타포를 통해 "함께하는 성장의 여정"을 시각화하고, 방문자들이 우리 팀의 열정과 전문성을 직접 느낄 수 있도록 합니다.

이 구현을 통해 AsyncSite는 기술적 우수성과 창의적 비전을 동시에 보여주며, "개발자들의 성장 플랫폼"이라는 정체성을 강화할 것입니다.

---

*문서 작성일: 2025년 8월 4일*
*작성자: AsyncSite AI Development Assistant*
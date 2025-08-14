// Experience Section 타입 정의

export interface StepContent {
  label: string;
  title: string;
  description: string;
  // SVG 일러스트레이션은 템플릿으로 제공
  illustrationType?: 'problem' | 'question' | 'explore' | 'review' | 'grow' | 'custom';
  customSvg?: string; // 커스텀 SVG 코드 (선택적)
}

export interface ExperienceSectionData {
  // 섹션 헤더
  tagHeader?: string;
  title: string;
  subtitle?: string;
  
  // 하이라이트 텍스트 (subtitle 내의 강조 부분)
  highlightText?: string;
  
  // 스텝 콘텐츠 배열 (기본 5개, 최대 7개)
  steps: StepContent[];
  
  // 레이아웃 옵션
  layout?: 'horizontal' | 'vertical' | 'grid';
  
  // 애니메이션 설정
  enableAnimation?: boolean;
  animationType?: 'fadeIn' | 'slideUp' | 'scale';
  
  // 초기 활성화 스텝 (0-based index, null이면 비활성)
  defaultActiveStep?: number | null;
  
  // 자동 진행 옵션
  autoProgress?: boolean;
  autoProgressInterval?: number; // milliseconds
  
  // 커스텀 색상 (선택적)
  primaryColor?: string;
  secondaryColor?: string;
  
  // 스텝 네비게이션 스타일
  navigationStyle?: 'numbers' | 'dots' | 'progress' | 'timeline';
  
  // 모바일 설정
  mobileCollapse?: boolean; // 모바일에서 아코디언 형태로 표시
}

// 템플릿 데이터
export const experienceTemplates = {
  algorithm: {
    tagHeader: '성장을 위한 스텝',
    title: '알고리즘 스터디를 <span style="color: #c3e88d;">한다는 건</span>',
    subtitle: '매주 모임을 통해 <span style="color: #82aaff;">이런 루틴으로</span> 함께 성장해요.',
    steps: [
      {
        label: '문제를 만나고',
        title: '새로운 도전, 익숙한 문제',
        description: '혼자서는 엄두 내지 못했던 문제들.<br/><span style="color: #82aaff;">함께라면</span> 그 문제들을 피하지 않고 마주하며 새로운 도전을 시작합니다.',
        illustrationType: 'problem' as const
      },
      {
        label: '질문하고',
        title: '멈추지 않는 호기심, 날카로운 질문',
        description: '막히는 지점에서 주저하지 않고 <span style="color: #c3e88d;">끊임없이 질문</span>하며<br/>서로에게 배우고 이해의 폭을 넓힙니다.',
        illustrationType: 'question' as const
      },
      {
        label: '파고들고',
        title: '본질을 꿰뚫는 탐구',
        description: '단순히 정답을 아는 것을 넘어,<br/>문제의 <span style="color: #c3e88d;">본질과 원리</span>를 집요하게 파고듭니다.',
        illustrationType: 'explore' as const
      },
      {
        label: '리뷰하고',
        title: '성장을 위한 따뜻한 피드백',
        description: '서로의 코드를 읽고 배우며,<br/>더 나은 코드를 위해 <span style="color: #c3e88d;">아낌없이 피드백</span>합니다.',
        illustrationType: 'review' as const
      },
      {
        label: '성장해요',
        title: '코드를 넘어, 삶의 이야기',
        description: '알고리즘을 넘어 <span style="color: #c3e88d;">개발 문화와 커리어</span>까지,<br/>함께 성장하는 소중한 시간.',
        illustrationType: 'grow' as const
      }
    ],
    theme: 'standard' as const,
    layout: 'horizontal' as const,
    enableAnimation: true,
    animationType: 'fadeIn' as const,
    defaultActiveStep: 0,
    navigationStyle: 'numbers' as const
  },
  
  design: {
    tagHeader: '디자인 프로세스',
    title: '우리가 <span style="color: #82aaff;">디자인</span>하는 방법',
    subtitle: '<span style="color: #ffea00;">사용자 중심</span>의 디자인을 위한 <span style="color: #c3e88d;">체계적인 프로세스</span>',
    steps: [
      {
        label: '리서치',
        title: '사용자를 이해하다',
        description: '깊이 있는 사용자 조사를 통해<br/><span style="color: #c3e88d;">진짜 문제</span>를 발견합니다.',
        illustrationType: 'explore' as const
      },
      {
        label: '아이디어',
        title: '창의적인 해결책',
        description: '브레인스토밍과 스케치를 통해<br/><span style="color: #82aaff;">다양한 아이디어</span>를 탐색합니다.',
        illustrationType: 'question' as const
      },
      {
        label: '프로토타입',
        title: '빠른 실험과 검증',
        description: '아이디어를 구체화하고<br/><span style="color: #ffea00;">빠르게 테스트</span>합니다.',
        illustrationType: 'problem' as const
      },
      {
        label: '테스트',
        title: '사용자 피드백',
        description: '실제 사용자와 함께 테스트하며<br/><span style="color: #c3e88d;">개선점</span>을 찾습니다.',
        illustrationType: 'review' as const
      },
      {
        label: '개선',
        title: '지속적인 발전',
        description: '피드백을 반영하여<br/>더 나은 <span style="color: #ffea00;">경험</span>을 만들어갑니다.',
        illustrationType: 'grow' as const
      }
    ],
    theme: 'modern' as const,
    layout: 'horizontal' as const,
    enableAnimation: true,
    defaultActiveStep: null,
    navigationStyle: 'dots' as const
  },
  
  project: {
    tagHeader: '프로젝트 진행 과정',
    title: '아이디어가 <span style="color: #c3e88d;">현실</span>이 되기까지',
    subtitle: '<span style="color: #82aaff;">체계적인 프로젝트 관리</span>로 목표를 달성합니다',
    steps: [
      {
        label: '기획',
        title: '명확한 목표 설정',
        description: '프로젝트의 <span style="color: #82aaff;">방향성과 목표</span>를<br/>명확히 정의합니다.',
        illustrationType: 'problem' as const
      },
      {
        label: '설계',
        title: '구조와 아키텍처',
        description: '기술 스택을 선정하고<br/><span style="color: #c3e88d;">시스템을 설계</span>합니다.',
        illustrationType: 'explore' as const
      },
      {
        label: '개발',
        title: '코드로 구현하기',
        description: '설계를 바탕으로<br/><span style="color: #c3e88d;">실제 제품</span>을 개발합니다.',
        illustrationType: 'question' as const
      },
      {
        label: '배포',
        title: '세상에 선보이기',
        description: '완성된 제품을<br/><span style="color: #82aaff;">사용자에게 전달</span>합니다.',
        illustrationType: 'grow' as const
      }
    ],
    theme: 'classic' as const,
    layout: 'vertical' as const,
    enableAnimation: true,
    navigationStyle: 'timeline' as const
  }
};
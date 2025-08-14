// Journey/History Section Types

// 개별 세대/시즌 정보
export interface Generation {
  id?: string;
  title: string; // 예: "시즌 1 (2024.09 ~ 2024.12)"
  description: string; // 예: "자료구조의 기본기를 다지고..."
  icon?: string; // 예: "🌱"
  period?: {
    start: string; // 시작 날짜
    end?: string; // 종료 날짜 (진행중이면 없음)
  };
  achievements?: string[]; // 성과 목록
  status?: 'completed' | 'ongoing' | 'planned'; // 상태
  highlight?: boolean; // 강조 표시 여부
}

// 통계 정보
export interface JourneyStats {
  totalProblems?: string | number;
  studyHours?: string | number;
  memberGrowth?: string;
  teamSpirit?: string;
  customStats?: Array<{
    label: string;
    value: string | number;
    icon?: string;
  }>;
}

// 전체 Journey 섹션 데이터
export interface JourneySectionData {
  // 기본 정보
  title?: string; // 동적 제목 (경과일 포함 가능)
  subtitle?: string;
  tagHeader?: string; // 예: "우리의 여정"
  
  // 시작 날짜 (경과일 계산용)
  startDate?: string;
  calculateDays?: boolean; // 경과일 자동 계산 여부
  
  // 세대/시즌 목록
  generations: Generation[];
  
  // 통계 (선택적)
  showStats?: boolean;
  stats?: JourneyStats;
  
  // 미래 계획 이미지 (선택적)
  futureImage?: {
    src: string;
    alt?: string;
    title?: string;
    description?: string;
  };
  
  // 마무리 메시지 (선택적)
  closingMessage?: string;
  
  // 레이아웃 옵션
  layout?: 'list' | 'timeline' | 'cards';
  showAchievements?: boolean;
  showIcons?: boolean;
}

// 편집기용 템플릿
export const journeyTemplates = {
  algorithm: {
    tagHeader: '우리의 여정',
    subtitle: '작은 시작이 모여 의미 있는 변화를 만들어가고 있어요. 각자의 속도로, 함께의 힘으로.',
    startDate: new Date().toISOString().split('T')[0],
    calculateDays: true,
    generations: [
      {
        title: '시즌 1 (기초 다지기)',
        description: '자료구조의 기본기를 다지고, 알고리즘 문제 해결의 첫 발을 내디뎠습니다.',
        icon: '🌱',
        achievements: ['기본 자료구조 마스터', '문제 해결 패턴 습득', '팀워크 기반 다지기'],
        status: 'completed' as const
      },
      {
        title: '시즌 2 (심화 학습)',
        description: '심화 알고리즘을 탐구하며, 더 복잡한 문제에 대한 해결 능력을 키워나가고 있습니다.',
        icon: '🚀',
        achievements: ['고급 알고리즘 도전', '문제 해결 깊이 확장'],
        status: 'ongoing' as const
      }
    ],
    showStats: true,
    stats: {
      totalProblems: '100+',
      studyHours: '50+',
      memberGrowth: '평균 30% 향상'
    },
    theme: 'standard' as const,
    layout: 'list' as const,
    showAchievements: true,
    showIcons: true
  },
  
  project: {
    tagHeader: '프로젝트 히스토리',
    subtitle: '아이디어에서 시작해 실제 서비스로 성장하는 과정',
    calculateDays: false,
    generations: [
      {
        title: 'Phase 1: 아이디어 & 기획',
        description: '문제 정의와 솔루션 설계를 진행했습니다.',
        icon: '💡',
        achievements: ['요구사항 분석', '기술 스택 선정', 'MVP 정의'],
        status: 'completed' as const
      },
      {
        title: 'Phase 2: 개발 & 구현',
        description: '핵심 기능을 구현하고 테스트를 진행중입니다.',
        icon: '⚙️',
        achievements: ['핵심 기능 구현', '테스트 작성', 'CI/CD 구축'],
        status: 'ongoing' as const
      },
      {
        title: 'Phase 3: 출시 & 운영',
        description: '서비스를 출시하고 사용자 피드백을 반영할 예정입니다.',
        icon: '🎯',
        achievements: ['베타 출시', '사용자 피드백 수집', '지속적 개선'],
        status: 'planned' as const
      }
    ],
    theme: 'modern' as const,
    layout: 'timeline' as const,
    showAchievements: true,
    showIcons: true
  },
  
  reading: {
    tagHeader: '독서 여정',
    subtitle: '함께 읽고, 함께 성장하는 시간들',
    calculateDays: true,
    generations: [
      {
        title: '1분기: 기술 서적',
        description: '개발 역량 향상을 위한 기술 서적을 읽었습니다.',
        icon: '📚',
        achievements: ['클린 코드', '리팩토링', '디자인 패턴'],
        status: 'completed' as const
      },
      {
        title: '2분기: 소프트 스킬',
        description: '커뮤니케이션과 협업 능력 향상에 집중했습니다.',
        icon: '🤝',
        achievements: ['소프트웨어 장인', '함께 자라기', '실용주의 프로그래머'],
        status: 'ongoing' as const
      }
    ],
    theme: 'classic' as const,
    layout: 'cards' as const,
    showAchievements: true,
    showIcons: true
  }
};
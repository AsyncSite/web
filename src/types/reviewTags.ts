// Review Tag System - Frontend Types & Constants
// 백엔드와 동일한 구조로 관리

export enum ReviewTagCategory {
  ATMOSPHERE = 'ATMOSPHERE',        // 분위기
  LEARNING = 'LEARNING',           // 학습 효과
  MENTORING = 'MENTORING',          // 멘토링/리더십
  COMMUNITY = 'COMMUNITY',          // 커뮤니티
  GROWTH = 'GROWTH',               // 성장
  PRACTICAL = 'PRACTICAL',         // 실무
  DIFFICULTY = 'DIFFICULTY',        // 난이도
  ORGANIZATION = 'ORGANIZATION'    // 운영/체계
}

export interface ReviewTag {
  id: string;                      // COMFORTABLE_ATMOSPHERE
  category: ReviewTagCategory;
  label: string;                   // "편안한 분위기"
  emoji: string;                   // "😌"
  description?: string;            // 선택적 설명
}

// 백엔드에서 관리할 태그 정의 (프론트엔드 미러링)
export const REVIEW_TAGS: { [key: string]: ReviewTag } = {
  // ========== ATMOSPHERE (분위기) ==========
  COMFORTABLE_ATMOSPHERE: {
    id: 'COMFORTABLE_ATMOSPHERE',
    category: ReviewTagCategory.ATMOSPHERE,
    label: '편안한 분위기',
    emoji: '😌',
    description: '부담 없이 편안하게 참여할 수 있어요'
  },
  EXCITING_ATMOSPHERE: {
    id: 'EXCITING_ATMOSPHERE',
    category: ReviewTagCategory.ATMOSPHERE,
    label: '활기찬 분위기',
    emoji: '🎉',
    description: '에너지 넘치고 즐거운 분위기예요'
  },
  WARM_ATMOSPHERE: {
    id: 'WARM_ATMOSPHERE',
    category: ReviewTagCategory.ATMOSPHERE,
    label: '따뜻한 분위기',
    emoji: '🤗',
    description: '서로 배려하고 존중하는 분위기예요'
  },
  PROFESSIONAL_ATMOSPHERE: {
    id: 'PROFESSIONAL_ATMOSPHERE',
    category: ReviewTagCategory.ATMOSPHERE,
    label: '프로페셔널한 분위기',
    emoji: '💼',
    description: '진지하고 전문적인 분위기예요'
  },
  FRIENDLY_ATMOSPHERE: {
    id: 'FRIENDLY_ATMOSPHERE',
    category: ReviewTagCategory.ATMOSPHERE,
    label: '친근한 분위기',
    emoji: '😊',
    description: '친구같이 편하게 대화할 수 있어요'
  },

  // ========== LEARNING (학습 효과) ==========
  DEEP_LEARNING: {
    id: 'DEEP_LEARNING',
    category: ReviewTagCategory.LEARNING,
    label: '깊이 있는 학습',
    emoji: '🧠',
    description: '개념을 깊이 있게 이해할 수 있어요'
  },
  PRACTICAL_LEARNING: {
    id: 'PRACTICAL_LEARNING',
    category: ReviewTagCategory.LEARNING,
    label: '실전적인 학습',
    emoji: '💪',
    description: '실무에 바로 적용 가능한 내용이에요'
  },
  SYSTEMATIC_LEARNING: {
    id: 'SYSTEMATIC_LEARNING',
    category: ReviewTagCategory.LEARNING,
    label: '체계적인 학습',
    emoji: '📚',
    description: '단계별로 체계적으로 배워요'
  },
  FAST_LEARNING: {
    id: 'FAST_LEARNING',
    category: ReviewTagCategory.LEARNING,
    label: '빠른 성장',
    emoji: '🚀',
    description: '단기간에 실력이 빠르게 늘어요'
  },
  FUNDAMENTAL_LEARNING: {
    id: 'FUNDAMENTAL_LEARNING',
    category: ReviewTagCategory.LEARNING,
    label: '탄탄한 기초',
    emoji: '🏗️',
    description: '기초부터 탄탄하게 다져요'
  },

  // ========== MENTORING (멘토링/리더십) ==========
  EXCELLENT_MENTOR: {
    id: 'EXCELLENT_MENTOR',
    category: ReviewTagCategory.MENTORING,
    label: '훌륭한 멘토',
    emoji: '👨‍🏫',
    description: '멘토님의 실력과 티칭이 뛰어나요'
  },
  DETAILED_FEEDBACK: {
    id: 'DETAILED_FEEDBACK',
    category: ReviewTagCategory.MENTORING,
    label: '꼼꼼한 피드백',
    emoji: '📝',
    description: '세심하고 구체적인 피드백을 받아요'
  },
  CARING_LEADER: {
    id: 'CARING_LEADER',
    category: ReviewTagCategory.MENTORING,
    label: '배려심 깊은 리더',
    emoji: '💝',
    description: '모든 멤버를 세심하게 챙겨주세요'
  },
  PASSIONATE_TEACHING: {
    id: 'PASSIONATE_TEACHING',
    category: ReviewTagCategory.MENTORING,
    label: '열정적인 티칭',
    emoji: '🔥',
    description: '열정적으로 가르쳐주세요'
  },
  PATIENT_GUIDANCE: {
    id: 'PATIENT_GUIDANCE',
    category: ReviewTagCategory.MENTORING,
    label: '인내심 있는 지도',
    emoji: '🕰️',
    description: '모르는 것도 끈기있게 설명해주세요'
  },

  // ========== COMMUNITY (커뮤니티) ==========
  ACTIVE_NETWORKING: {
    id: 'ACTIVE_NETWORKING',
    category: ReviewTagCategory.COMMUNITY,
    label: '활발한 네트워킹',
    emoji: '🤝',
    description: '다양한 사람들과 교류할 수 있어요'
  },
  SUPPORTIVE_PEERS: {
    id: 'SUPPORTIVE_PEERS',
    category: ReviewTagCategory.COMMUNITY,
    label: '서로 돕는 동료',
    emoji: '🤲',
    description: '서로 도우며 함께 성장해요'
  },
  DIVERSE_BACKGROUNDS: {
    id: 'DIVERSE_BACKGROUNDS',
    category: ReviewTagCategory.COMMUNITY,
    label: '다양한 배경',
    emoji: '🌈',
    description: '다양한 배경의 사람들을 만날 수 있어요'
  },
  LONG_TERM_FRIENDSHIP: {
    id: 'LONG_TERM_FRIENDSHIP',
    category: ReviewTagCategory.COMMUNITY,
    label: '오래가는 인연',
    emoji: '👥',
    description: '스터디 후에도 이어지는 관계예요'
  },
  ACTIVE_COMMUNICATION: {
    id: 'ACTIVE_COMMUNICATION',
    category: ReviewTagCategory.COMMUNITY,
    label: '활발한 소통',
    emoji: '💬',
    description: '자유롭게 질문하고 토론해요'
  },

  // ========== GROWTH (성장) ==========
  EXPAND_THINKING: {
    id: 'EXPAND_THINKING',
    category: ReviewTagCategory.GROWTH,
    label: '사고의 확장',
    emoji: '💡',
    description: '새로운 관점과 사고방식을 배워요'
  },
  CONFIDENCE_BOOST: {
    id: 'CONFIDENCE_BOOST',
    category: ReviewTagCategory.GROWTH,
    label: '자신감 상승',
    emoji: '💪',
    description: '실력과 자신감이 함께 성장해요'
  },
  HABIT_FORMATION: {
    id: 'HABIT_FORMATION',
    category: ReviewTagCategory.GROWTH,
    label: '좋은 습관 형성',
    emoji: '📅',
    description: '꾸준한 학습 습관을 만들어요'
  },
  OVERCOME_FEAR: {
    id: 'OVERCOME_FEAR',
    category: ReviewTagCategory.GROWTH,
    label: '두려움 극복',
    emoji: '🦸',
    description: '어려운 문제도 도전할 수 있게 되요'
  },
  CONTINUOUS_GROWTH: {
    id: 'CONTINUOUS_GROWTH',
    category: ReviewTagCategory.GROWTH,
    label: '지속적인 성장',
    emoji: '🌱',
    description: '꾸준히 성장하는 것을 느껴요'
  },

  // ========== PRACTICAL (실무) ==========
  JOB_READY: {
    id: 'JOB_READY',
    category: ReviewTagCategory.PRACTICAL,
    label: '취업 준비 완벽',
    emoji: '🎯',
    description: '실제 취업에 도움이 되었어요'
  },
  REAL_WORLD_SKILLS: {
    id: 'REAL_WORLD_SKILLS',
    category: ReviewTagCategory.PRACTICAL,
    label: '실무 스킬 향상',
    emoji: '⚡',
    description: '실무에서 쓰는 기술을 배워요'
  },
  INTERVIEW_PREP: {
    id: 'INTERVIEW_PREP',
    category: ReviewTagCategory.PRACTICAL,
    label: '면접 대비',
    emoji: '🗣️',
    description: '면접 준비에 큰 도움이 돼요'
  },
  PORTFOLIO_BUILDING: {
    id: 'PORTFOLIO_BUILDING',
    category: ReviewTagCategory.PRACTICAL,
    label: '포트폴리오 구축',
    emoji: '📁',
    description: '포트폴리오를 만들 수 있어요'
  },
  INDUSTRY_INSIGHTS: {
    id: 'INDUSTRY_INSIGHTS',
    category: ReviewTagCategory.PRACTICAL,
    label: '업계 인사이트',
    emoji: '🔍',
    description: '현업의 인사이트를 얻을 수 있어요'
  },

  // ========== DIFFICULTY (난이도) ==========
  BEGINNER_FRIENDLY: {
    id: 'BEGINNER_FRIENDLY',
    category: ReviewTagCategory.DIFFICULTY,
    label: '초보자 친화적',
    emoji: '🐣',
    description: '초보자도 따라갈 수 있어요'
  },
  CHALLENGING: {
    id: 'CHALLENGING',
    category: ReviewTagCategory.DIFFICULTY,
    label: '도전적인 난이도',
    emoji: '🏔️',
    description: '도전적이지만 성장할 수 있어요'
  },
  WELL_PACED: {
    id: 'WELL_PACED',
    category: ReviewTagCategory.DIFFICULTY,
    label: '적절한 속도',
    emoji: '⏱️',
    description: '학습 속도가 적절해요'
  },
  PROGRESSIVE_DIFFICULTY: {
    id: 'PROGRESSIVE_DIFFICULTY',
    category: ReviewTagCategory.DIFFICULTY,
    label: '단계적 난이도',
    emoji: '📈',
    description: '점진적으로 난이도가 올라가요'
  },
  CUSTOMIZABLE_PACE: {
    id: 'CUSTOMIZABLE_PACE',
    category: ReviewTagCategory.DIFFICULTY,
    label: '맞춤형 속도',
    emoji: '🎚️',
    description: '개인 수준에 맞춰 진행해요'
  },

  // ========== ORGANIZATION (운영/체계) ==========
  WELL_ORGANIZED: {
    id: 'WELL_ORGANIZED',
    category: ReviewTagCategory.ORGANIZATION,
    label: '체계적인 운영',
    emoji: '📋',
    description: '체계적으로 운영되고 있어요'
  },
  CLEAR_CURRICULUM: {
    id: 'CLEAR_CURRICULUM',
    category: ReviewTagCategory.ORGANIZATION,
    label: '명확한 커리큘럼',
    emoji: '🗓️',
    description: '커리큘럼이 명확하고 체계적이에요'
  },
  REGULAR_SCHEDULE: {
    id: 'REGULAR_SCHEDULE',
    category: ReviewTagCategory.ORGANIZATION,
    label: '규칙적인 일정',
    emoji: '⏰',
    description: '규칙적으로 진행되어 습관을 만들기 좋아요'
  },
  GOOD_MATERIALS: {
    id: 'GOOD_MATERIALS',
    category: ReviewTagCategory.ORGANIZATION,
    label: '우수한 자료',
    emoji: '📖',
    description: '학습 자료가 잘 준비되어 있어요'
  },
  EFFICIENT_TIME: {
    id: 'EFFICIENT_TIME',
    category: ReviewTagCategory.ORGANIZATION,
    label: '효율적인 시간 활용',
    emoji: '⚡',
    description: '시간을 효율적으로 활용해요'
  }
};

// 카테고리별 태그 그룹핑 헬퍼
export const getTagsByCategory = (category: ReviewTagCategory): ReviewTag[] => {
  return Object.values(REVIEW_TAGS).filter(tag => tag.category === category);
};

// 모든 카테고리와 태그를 구조화된 형태로 반환
export const getStructuredTags = () => {
  const structured: { [key in ReviewTagCategory]: ReviewTag[] } = {
    [ReviewTagCategory.ATMOSPHERE]: [],
    [ReviewTagCategory.LEARNING]: [],
    [ReviewTagCategory.MENTORING]: [],
    [ReviewTagCategory.COMMUNITY]: [],
    [ReviewTagCategory.GROWTH]: [],
    [ReviewTagCategory.PRACTICAL]: [],
    [ReviewTagCategory.DIFFICULTY]: [],
    [ReviewTagCategory.ORGANIZATION]: []
  };

  Object.values(REVIEW_TAGS).forEach(tag => {
    structured[tag.category].push(tag);
  });

  return structured;
};

// 카테고리 한글 라벨
export const CATEGORY_LABELS: { [key in ReviewTagCategory]: string } = {
  [ReviewTagCategory.ATMOSPHERE]: '분위기',
  [ReviewTagCategory.LEARNING]: '학습 효과',
  [ReviewTagCategory.MENTORING]: '멘토링',
  [ReviewTagCategory.COMMUNITY]: '커뮤니티',
  [ReviewTagCategory.GROWTH]: '성장',
  [ReviewTagCategory.PRACTICAL]: '실무',
  [ReviewTagCategory.DIFFICULTY]: '난이도',
  [ReviewTagCategory.ORGANIZATION]: '운영'
};

// 태그 선택 제한 설정
export const TAG_SELECTION_RULES = {
  minTags: 1,
  maxTags: 5,
  maxPerCategory: 2  // 카테고리당 최대 선택 가능 수
};

// 인기 태그 (예시 - 실제로는 백엔드에서 집계)
export const POPULAR_TAGS = [
  'COMFORTABLE_ATMOSPHERE',
  'SYSTEMATIC_LEARNING',
  'EXCELLENT_MENTOR',
  'SUPPORTIVE_PEERS',
  'CONTINUOUS_GROWTH'
];
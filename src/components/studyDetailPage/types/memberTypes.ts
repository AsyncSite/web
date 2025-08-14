// Member profile types for study detail pages

export interface MemberProfile {
  // === 필수 기본 필드 ===
  userId?: string;         // 사용자 ID (시스템 연동용)
  name: string;           // 표시 이름
  role: string;           // 역할 (리더/멤버/멘토 등)
  imageUrl?: string;      // 프로필 이미지
  joinDate?: string;      // 가입일
  
  // === 범용 텍스트 필드 (모든 스터디 공통) ===
  tagline?: string;       // 한 줄 소개/기여
  achievement?: string;   // 주요 성과/배운 점
  message?: string;       // 동료의 한마디
  messageFrom?: string;   // 메시지 작성자
  
  // === 커스텀 필드 (스터디별 최대 3개) ===
  customFields?: CustomField[];
  
  // === 상태 필드 ===
  isActive?: boolean;     // 활동 상태
  lastActivity?: string;  // 최근 활동일
  badges?: Badge[];       // 배지 (MVP, 개근상 등)
  
  // === 레거시 호환 ===
  bio?: string;           // 기존 bio 필드 호환

  // === 고급 필드 (선택) ===
  // 더 풍부한 정보 표시를 위한 추가 필드들
  streak?: number;               // 연속 참여 일수 (예: 15)
  currentFocus?: string;         // 현재 집중 분야 (예: "그래프 최단경로")
  memorableProblem?: string;     // 기억에 남는 문제 (예: "BOJ 1753 - 최단경로")
  solvedProblems?: number;       // 해결한 문제 수 (모달 통계용)
  whatIGained?: string;          // 스터디에서 얻은 것 (모달용)
  customMetricLabel?: string;    // 커스텀 메트릭 라벨 (예: "완료한 과제" 대신 사용자 정의)
  recentActivity?: string;       // 최근 활동 (예: "1일 전 활동")
  testimonial?: string;          // 동료의 평가 (호버/모달용)
  from?: string;                 // 평가 작성자
}

export interface CustomField {
  label: string;          // 필드명 (예: "해결한 문제", "작업한 프로젝트")
  value: string;          // 값 (예: "342개", "5개")
  icon?: string;          // 아이콘 (예: "🔥", "📚")
}

export interface Badge {
  type: 'mvp' | 'streak' | 'achievement' | 'special';
  label: string;
  icon?: string;
}


// 레이아웃 타입
export type MemberLayoutType = 'grid' | 'list' | 'carousel';

// 스터디 타입별 템플릿
export const STUDY_TEMPLATES = {
  algorithm: {
    name: '알고리즘 스터디',
    customFields: [
      { label: '해결한 문제', icon: '✅' },
      { label: '연속 참여', icon: '🔥' },
      { label: '주력 분야', icon: '📚' }
    ],
    badges: [
      { type: 'mvp' as const, label: '이주의 MVP', icon: '👑' },
      { type: 'streak' as const, label: '개근왕', icon: '🔥' }
    ]
  },
  design: {
    name: '디자인 스터디',
    customFields: [
      { label: '포트폴리오', icon: '🎨' },
      { label: '주 사용 툴', icon: '🛠' },
      { label: '완성 작품', icon: '✨' }
    ],
    badges: [
      { type: 'achievement' as const, label: '크리에이터', icon: '🎨' },
      { type: 'special' as const, label: '멘토', icon: '🌟' }
    ]
  },
  language: {
    name: '언어 스터디',
    customFields: [
      { label: '학습 레벨', icon: '📈' },
      { label: '회화 시간', icon: '🗣' },
      { label: '목표', icon: '🎯' }
    ],
    badges: [
      { type: 'achievement' as const, label: '유창함', icon: '💬' },
      { type: 'streak' as const, label: '꾸준함', icon: '📅' }
    ]
  },
  reading: {
    name: '독서 스터디',
    customFields: [
      { label: '읽은 책', icon: '📚' },
      { label: '독서 목표', icon: '🎯' },
      { label: '선호 장르', icon: '📖' }
    ],
    badges: [
      { type: 'achievement' as const, label: '다독왕', icon: '📚' },
      { type: 'special' as const, label: '큐레이터', icon: '🔖' }
    ]
  },
  development: {
    name: '개발 스터디',
    customFields: [
      { label: '주 기술스택', icon: '💻' },
      { label: '진행 프로젝트', icon: '🚀' },
      { label: '관심 분야', icon: '🔍' }
    ],
    badges: [
      { type: 'mvp' as const, label: '최고 기여자', icon: '🏆' },
      { type: 'achievement' as const, label: '문제 해결사', icon: '💡' }
    ]
  }
};

// MembersSection 데이터 구조
export interface MembersSectionData {
  tagHeader?: string;
  title?: string;
  subtitle?: string;
  layout?: MemberLayoutType;
  studyType?: keyof typeof STUDY_TEMPLATES;
  members: MemberProfile[];
  showStats?: boolean;
  stats?: StudyStats;
  // 주간 MVP 등 하이라이트 멤버 (name 또는 userId 기준)
  weeklyMvp?: string;
}

// 스터디 통계
export interface StudyStats {
  totalMembers?: number;
  activeMembers?: number;
  totalHours?: number;
  totalProblems?: number;      // 총 해결한 문제 수
  participationRate?: number;   // 평균 참여율 (%)
  customStats?: Array<{
    label: string;
    value: string | number;
    icon?: string;
  }>;
  // "인기 알고리즘" 태그 영역
  popularAlgorithms?: string[];
}
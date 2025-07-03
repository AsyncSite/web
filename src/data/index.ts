// 전역 데이터 관리 파일

// 캘린더 이벤트 타입
export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'study' | 'meeting' | 'project' | 'social';
  participants: number;
  location: string;
  wave: string;
}

// 랭킹 사용자 타입
export interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  change: number;
  activities: {
    commits: number;
    studies: number;
    projects: number;
    contributions: number;
  };
  badges: string[];
  level: number;
  streak: number;
}

// Wave 프로젝트 타입
export interface WaveProject {
  id: number;
  title: string;
  description: string;
  status: string;
  tech: string[];
  image?: string;
  link?: string;
  studyInfo?: {
    recruitmentStatus: 'recruiting' | 'full' | 'closed';
    currentMembers: number;
    maxMembers: number;
    schedule: string;
    duration: string;
    location: string;
    requirements: string[];
  };
}

// Lab 프로젝트 타입
export interface LabProject {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  icon?: string; // 선화 아이콘 (lucide-react 아이콘명)
}

// 캘린더 이벤트 데이터 (하드코딩된 샘플 데이터)
export const calendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: '테코테코',
    description: '알고리즘 문제 풀이 및 코드 리뷰',
    date: '2025-07-11',
    time: '19:00',
    type: 'study',
    participants: 8,
    location: '온라인',
    wave: '테코테코'
  },
  {
    id: 1-1,
    title: '테코테코',
    description: '알고리즘 문제 풀이 및 코드 리뷰',
    date: '2025-07-18',
    time: '19:00',
    type: 'study',
    participants: 8,
    location: '온라인',
    wave: '테코테코'
  },
  {
    id: 1-2,
    title: '테코테코',
    description: '알고리즘 문제 풀이 및 코드 리뷰',
    date: '2025-07-25',
    time: '19:00',
    type: 'study',
    participants: 8,
    location: '온라인',
    wave: '테코테코'
  },
  {
    id: 2,
    title: 'DEVLOG-14',
    description: '개발 블로그 포스팅 챌린지',
    date: '2025-07-14',
    time: '19:00',
    type: 'project',
    participants: 12,
    location: '온라인',
    wave: 'DEVLOG-14'
  },
  {
    id: 2-1,
    title: 'DEVLOG-14',
    description: '개발 블로그 포스팅 챌린지',
    date: '2025-07-28',
    time: '19:00',
    type: 'project',
    participants: 12,
    location: '온라인',
    wave: 'DEVLOG-14'
  },
  {
    id: 3,
    title: '회고모임',
    description: '커리어 회고 및 계획 세우기',
    date: '2025-07-04',
    time: '20:00',
    type: 'meeting',
    participants: 15,
    location: '온라인',
    wave: '회고모임'
  },
  {
    id: 5,
    title: '디핑소스',
    description: '오픈소스 기여 스터디',
    date: '2025-07-06',
    time: '14:00',
    type: 'study',
    participants: 8,
    location: '온라인',
    wave: '디핑소스'
  },
  {
    id: 6,
    title: '디핑소스',
    description: '오픈소스 기여 스터디',
    date: '2025-07-13',
    time: '14:00',
    type: 'study',
    participants: 8,
    location: '온라인',
    wave: '디핑소스'
  },
  {
    id: 7,
    title: '디핑소스',
    description: '오픈소스 기여 스터디',
    date: '2025-07-20',
    time: '14:00',
    type: 'study',
    participants: 8,
    location: '온라인',
    wave: '디핑소스'
  },
  {
    id: 8,
    title: '커리어로그',
    description: '이력서 업데이트 스터디',
    date: '2025-07-01',
    time: '19:00',
    type: 'project',
    participants: 15,
    location: '온라인',
    wave: '커리어로그'
  },
];

// 랭킹 사용자 데이터 (하드코딩된 샘플 데이터)
export const rankingUsers: RankingUser[] = [
  {
    id: 1,
    name: '최병호',
    avatar: '👨‍💻',
    score: 2850,
    rank: 1,
    change: 0,
    activities: { commits: 145, studies: 28, projects: 12, contributions: 35 },
    badges: ['🏆', '🔥', '💎'],
    level: 15,
    streak: 42
  },
  {
    id: 2,
    name: '김지연',
    avatar: '👩‍💻',
    score: 2720,
    rank: 2,
    change: 1,
    activities: { commits: 132, studies: 31, projects: 8, contributions: 28 },
    badges: ['🥈', '📚', '⚡'],
    level: 14,
    streak: 28
  },
  {
    id: 3,
    name: '박미현',
    avatar: '🧑‍💻',
    score: 2650,
    rank: 3,
    change: -1,
    activities: { commits: 128, studies: 25, projects: 15, contributions: 22 },
    badges: ['🥉', '🚀', '💡'],
    level: 13,
    streak: 35
  }
];

// Wave 프로젝트 데이터 (하드코딩된 샘플 데이터)
export const waveProjects: WaveProject[] = [
  {
    id: 1,
    title: '테코테코',
    description: '알고리즘을 함께 풀고 리뷰하는 매주 일요일 오전의 코테 모임. 실전 문제풀이와 코드 리뷰 과정을 통해 한 단계 더 성장할 수 있도록 도와줍니다.',
    status: 'Active',
    tech: ['Algorithm', 'Problem Solving', 'Code Review'],
    image: '/images/005%20(1).png',
    link: '/web/tecoteco'
  },
  {
    id: 2,
    title: 'DEVLOG-14',
    description: '격주에 한 번, 개발자 블로그 포스팅 챌린지. 개발자들이 모여 주제별로 포스팅을 진행하며 경험을 공유하고 성장하는 시간을 가집니다.',
    status: 'Active',
    tech: ['Blog', 'Writing', 'Knowledge Sharing'],
    image: '/images/devlog-14.png',
    link: '/web/devlog',
    studyInfo: {
      recruitmentStatus: 'recruiting',
      currentMembers: 8,
      maxMembers: 12,
      schedule: '격주 일요일 오후 2시',
      duration: '2시간',
      location: '온라인 (Discord)',
      requirements: ['개인 블로그 보유', '격주 1회 포스팅 가능', '피드백 참여 의지']
    }
  },
  {
    id: 3,
    title: '디핑소스',
    description: '매주 일요일 오후에 모여 우리가 사용하고 있는 오픈소스 라이브러리를 딥다이브하고 기여합니다.',
    status: 'Active',
    tech: ['Open Source', 'Contribution', 'Collaboration'],
    image: '/images/no-answer2.png',
    link: '#'
  },
  {
    id: 4,
    title: '회고모임',
    description: '커리어와 삶에 대한 고민을 나누고, 서로의 인사이트를 배웁니다. 정기적인 회고를 통해 우리의 현재 방향을 점검하고 미래를 위한 로드맵을 함께 그려가는 시간입니다.',
    status: 'Active',
    tech: ['Retrospective', 'Career', 'Life'],
    image: '/images/turning-page.png',
    link: '#'
  }
];

// Lab 프로젝트 데이터 (하드코딩된 샘플 데이터)
export const labProjects: LabProject[] = [
  {
    title: "테트리스",
    description: "AI로 시작한 테트리스 게임만들기 고도화는 어디까지 시킬 수 있는 것인가?",
    imageUrl: "/lab/images/tetris.png",
    link: "/lab/tetris",
    icon: "Gamepad2"
  },
  {
    title: "Async Site",
    description: "Async Site 제작기 어떻게 만들어졌는지 확인해보세요!",
    imageUrl: "/lab/images/async-site.png",
    link: "/lab/async-site",
    icon: "Globe"
  },
  {
    title: "추론 게임",
    description: "서로 다른 오답 정보를 가진 상태에서 정답을 추론하는 브라우저 게임",
    imageUrl: "/lab/images/deduction-game.png",
    link: "/lab/deduction-game",
    icon: "Brain"
  }
];

// 데이터 추가 함수들
export const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
  const newEvent = { ...event, id: calendarEvents.length + 1 };
  calendarEvents.push(newEvent);
  return newEvent;
};

export const addRankingUser = (user: RankingUser) => {
  rankingUsers.push(user);
  return user;
};

export const addWaveProject = (project: WaveProject) => {
  waveProjects.push(project);
  return project;
};

export const addLabProject = (project: LabProject) => {
  labProjects.push(project);
  return project;
};

// Wave별 색상 시스템
export const getWaveColor = (wave: string) => {
  const colors = {
    '테코테코': { bg: 'bg-[#6366F1]/15', text: 'text-[#6366F1]', border: 'border-[#6366F1]/30' },
    'DEVLOG-14': { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
    '디핑소스': { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
    '커리어로그': { bg: 'bg-[#06B6D4]/15', text: 'text-[#06B6D4]', border: 'border-[#06B6D4]/30' },
  };
  return colors[wave as keyof typeof colors] || { bg: 'bg-[#64748B]/15', text: 'text-[#64748B]', border: 'border-[#64748B]/30' };
};

// 이벤트 타입별 색상 시스템
export const getTypeColor = (type: string) => {
  const colors = {
    'study': 'bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30',
    'meeting': 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30',
    'project': 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
    'social': 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
  };
  return colors[type as keyof typeof colors] || 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30';
};

// 스터디 모집 상태별 색상 시스템
export const getRecruitmentStatusColor = (status: string) => {
  const colors = {
    'recruiting': 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
    'full': 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
    'closed': 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30',
  };
  return colors[status as keyof typeof colors] || 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30';
};

// 스터디 모집 상태 텍스트
export const getRecruitmentStatusText = (status: string) => {
  const texts = {
    'recruiting': '모집 중',
    'full': '모집 완료',
    'closed': '모집 마감',
  };
  return texts[status as keyof typeof texts] || '상태 미정';
};



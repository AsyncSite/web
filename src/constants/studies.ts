// 스터디 정보를 중앙화하여 관리
// 향후 백엔드 API로 대체될 예정

export interface StudyInfo {
  id: number;
  slug: string;
  name: string;
  generation: number;
  tagline: string;
  description?: string;
  type: 'participatory' | 'educational'; // 스터디 유형
  typeLabel: string; // 한글 표시용 라벨
  leader: {
    name: string;
    profileImage: string;
    welcomeMessage: string;
  };
  schedule: string;
  duration: string;
  capacity: number;
  enrolled: number;
  deadline: Date;
  status: 'recruiting' | 'ongoing' | 'closed';
  detailPageComponent?: string; // 커스텀 상세 페이지 컴포넌트 이름
  recentTestimonial?: {
    content: string;
    author: string;
  };
  color: {
    primary: string;
    glow: string;
  };
}

export const STUDY_LIST: StudyInfo[] = [
  {
    id: 1,
    slug: 'tecoteco',
    name: '테코테코',
    generation: 3,
    tagline: '함께 풀어가는 알고리즘의 즐거움',
    description: '코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다.',
    type: 'participatory',
    typeLabel: '참여형',
    leader: {
      name: '김준혁',
      profileImage: 'https://i.pravatar.cc/150?img=1',
      welcomeMessage: '알고리즘도 결국 사람이 푸는 거예요. 함께 고민하고 성장해요!'
    },
    schedule: '매주 금요일',
    duration: '19:30-21:30',
    capacity: 20,
    enrolled: 17,
    deadline: new Date('2024-12-25'),
    status: 'recruiting',
    detailPageComponent: 'TecoTecoPage', // 전용 상세 페이지 존재
    recentTestimonial: {
      content: '처음엔 어려웠지만, 동료들과 함께하니 재미있어졌어요',
      author: '2기 수료생'
    },
    color: {
      primary: '#C3E88D',
      glow: 'rgba(195, 232, 141, 0.3)'
    }
  },
  {
    id: 2,
    slug: '11routine',
    name: '11루틴',
    generation: 2,
    tagline: '퇴근 후 함께하는 성장의 시간',
    description: '매일 밤 11시, 하루를 마무리하며 성장하는 온라인 스터디',
    type: 'educational',
    typeLabel: '교육형',
    leader: {
      name: '이서연',
      profileImage: 'https://i.pravatar.cc/150?img=2',
      welcomeMessage: '혼자서는 지치기 쉬운 퇴근 후 공부, 함께라면 꾸준히 할 수 있어요'
    },
    schedule: '매주 수요일',
    duration: '23:00-24:00',
    capacity: 30,
    enrolled: 23,
    deadline: new Date('2024-12-20'),
    status: 'recruiting',
    recentTestimonial: {
      content: '온라인이지만 진짜 동료를 만난 느낌이에요',
      author: '1기 수료생'
    },
    color: {
      primary: '#82AAFF',
      glow: 'rgba(130, 170, 255, 0.3)'
    }
  },
  {
    id: 3,
    slug: 'devlog',
    name: '데브로그',
    generation: 1,
    tagline: '기록하며 성장하는 개발자의 글쓰기',
    description: '개발 경험을 글로 남기며 성장하는 테크 라이팅 스터디',
    type: 'participatory',
    typeLabel: '참여형',
    leader: {
      name: '박지민',
      profileImage: 'https://i.pravatar.cc/150?img=3',
      welcomeMessage: '꾸준한 기록은 가장 확실한 성장의 증거가 됩니다'
    },
    schedule: '격주 토요일',
    duration: '14:00-16:00',
    capacity: 15,
    enrolled: 12,
    deadline: new Date('2024-12-28'),
    status: 'recruiting',
    recentTestimonial: {
      content: '글쓰기가 이렇게 즐거운 일인지 처음 알았어요',
      author: '현재 참여자'
    },
    color: {
      primary: '#F78C6C',
      glow: 'rgba(247, 140, 108, 0.3)'
    }
  }
];

// 유틸리티 함수들
export const getStudyBySlug = (slug: string): StudyInfo | undefined => {
  return STUDY_LIST.find(study => study.slug === slug);
};

export const getStudyById = (id: number): StudyInfo | undefined => {
  return STUDY_LIST.find(study => study.id === id);
};

export const getStudyByIdOrSlug = (identifier: string): StudyInfo | undefined => {
  // 숫자인 경우 ID로 검색
  const id = parseInt(identifier);
  if (!isNaN(id)) {
    return getStudyById(id);
  }
  
  // 하이브리드 형식 (1-tecoteco) 파싱
  const match = identifier.match(/^(\d+)-(.+)$/);
  if (match) {
    return getStudyById(parseInt(match[1]));
  }
  
  // slug로 검색
  return getStudyBySlug(identifier);
};

export const getActiveStudies = (): StudyInfo[] => {
  return STUDY_LIST.filter(study => study.status === 'recruiting' || study.status === 'ongoing');
};

export const getStudyUrl = (study: StudyInfo): string => {
  // 하이브리드 URL 형식 사용
  return `/study/${study.id}-${study.slug}`;
};
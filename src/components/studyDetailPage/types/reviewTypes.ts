// Review types for study detail pages
import { ReviewTag, ReviewTagCategory } from '../../../types/reviewTags';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  rating: number; // 1-5 stars
  title: string; // 리뷰 제목 추가
  content: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean; // 실제 수강생 여부
  attendCount?: number; // 참석 횟수 추가
  helpfulCount?: number; // 도움이 됐어요 수
  tags?: ReviewTag[]; // 태그 객체 배열 (이모지 포함)
  timeAgo?: string; // 상대 시간 표시 (프론트에서 계산)
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationRate?: number; // 추천율 (%)
}

export interface ReviewSectionData {
  enabled: boolean; // 섹션 표시 여부
  tagHeader?: string; // 상단 작은 태그 텍스트 (예: "솔직한 후기")
  title: string; // 섹션 제목 (예: "수강생 후기", "참여자 리뷰")
  subtitle?: string; // 부제목
  showStats?: boolean; // 통계 표시 여부
  stats?: ReviewStats; // 리뷰 통계
  reviews?: Review[]; // 실제 리뷰 목록 (API에서 자동으로 가져옴)
  displayCount?: number; // 표시할 리뷰 개수 (기본값: 10)
  sortBy?: 'latest' | 'helpful' | 'rating_high' | 'rating_low'; // 정렬 방식
  keywords?: string[]; // 키워드 리스트 (선택, 리더가 직접 입력)
  showKeywords?: boolean; // 키워드 표시 여부
}

// 샘플 리뷰 데이터 (편집 모드에서 미리보기용)
import { REVIEW_TAGS } from '../../../types/reviewTags';

// 표준 스타일 샘플 데이터
export const sampleStandardReviewData: ReviewSectionData = {
  enabled: true,
  tagHeader: '솔직한 후기',
  title: '가장 진솔한 이야기, <br /> 멤버들의 목소리 🗣️',
  subtitle: '숫자와 코드만으로는 설명할 수 없는 <span class="highlight">우리 모임의 진짜 가치</span>를 들어보세요.',
  showStats: false,
  displayCount: 3,
  sortBy: 'latest',
  showKeywords: true,
  keywords: [
    '😌 편안한 분위기',
    '💥 사고의 확장',
    '🤗 배려왕 멤버',
    '🥳 즐거운 분위기',
    '📝 꼼꼼한 코드 리뷰',
    '👩‍💻 실전 코딩',
    '🧠 논리적 사고력',
    '🗣️ 커뮤니케이션 역량',
    '🤖 AI 활용',
    '🌱 함께 성장'
  ]
};

// 표준 샘플 리뷰들
export const sampleStandardReviews: Review[] = [
  {
    id: 'standard-1',
    userId: 'user1',
    userName: '익명1',
    rating: 5,
    title: '인생의 의미',
    content: '누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험',
    createdAt: '2024-02-15',
    attendCount: 3,
    helpfulCount: 2,
    tags: [
      { id: 'growth', emoji: '😃', label: '성장', category: ReviewTagCategory.GROWTH, description: '' },
      { id: 'spark', emoji: '✨', label: '영감', category: ReviewTagCategory.GROWTH, description: '' },
      { id: 'passion', emoji: '🔥', label: '열정', category: ReviewTagCategory.MENTORING, description: '' }
    ],
    timeAgo: '6달 전'
  },
  {
    id: 'standard-2',
    userId: 'user2',
    userName: '익명2',
    rating: 5,
    title: 'Better together !',
    content: '혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 스터디 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!',
    createdAt: '2023-08-10',
    attendCount: 10,
    helpfulCount: 1,
    tags: [
      { id: 'teamwork', emoji: '🧡', label: '팀워크', category: ReviewTagCategory.COMMUNITY, description: '' },
      { id: 'love', emoji: '😍', label: '사랑', category: ReviewTagCategory.ATMOSPHERE, description: '' },
      { id: 'happy', emoji: '😃', label: '행복', category: ReviewTagCategory.ATMOSPHERE, description: '' }
    ],
    timeAgo: '2년 전'
  },
  {
    id: 'standard-3',
    userId: 'user3',
    userName: '김코딩',
    rating: 5,
    title: '알고리즘 실력이 확실히 늘었어요',
    content: 'DP, 그래프, BFS/DFS... 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다!',
    createdAt: '2024-10-15',
    attendCount: 8,
    helpfulCount: 5,
    tags: [
      { id: 'skill', emoji: '💪', label: '실력향상', category: ReviewTagCategory.GROWTH, description: '' },
      { id: 'pattern', emoji: '🎯', label: '패턴인식', category: ReviewTagCategory.LEARNING, description: '' },
      { id: 'excited', emoji: '🎉', label: '기대감', category: ReviewTagCategory.ATMOSPHERE, description: '' }
    ],
    timeAgo: '1달 전'
  },
  {
    id: 'standard-4',
    userId: 'user4',
    userName: '박개발',
    rating: 5,
    title: '코딩테스트 합격했습니다!',
    content: '스터디에서 배운 문제 해결 접근법과 시간 복잡도 최적화 덕분에 드디어 코딩테스트를 통과했어요. 함께 고민해주신 모든 분들께 감사드립니다.',
    createdAt: '2024-11-20',
    attendCount: 12,
    helpfulCount: 8,
    tags: [
      { id: 'success', emoji: '🎊', label: '합격', category: ReviewTagCategory.PRACTICAL, description: '' },
      { id: 'grateful', emoji: '🙏', label: '감사', category: ReviewTagCategory.COMMUNITY, description: '' },
      { id: 'optimization', emoji: '⚡', label: '최적화', category: ReviewTagCategory.LEARNING, description: '' }
    ],
    timeAgo: '2주 전'
  }
];

export const sampleReviews: Review[] = [
  {
    id: 'sample-1',
    userId: 'user-1',
    userName: '김개발',
    userProfileImage: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    title: '체계적인 커리큘럼과 꼼꼼한 코드 리뷰',
    content: '정말 체계적이고 실무에 도움이 되는 스터디였습니다. 멘토님의 꼼꼼한 코드 리뷰와 동료들과의 활발한 토론이 인상적이었어요.',
    createdAt: '2024-01-15T09:00:00Z',
    isVerified: true,
    attendCount: 12,
    helpfulCount: 12,
    tags: [
      REVIEW_TAGS.SYSTEMATIC_LEARNING,
      REVIEW_TAGS.DETAILED_FEEDBACK,
      REVIEW_TAGS.PRACTICAL_LEARNING
    ],
    timeAgo: '1개월 전'
  },
  {
    id: 'sample-2',
    userId: 'user-2',
    userName: '이학습',
    userProfileImage: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    title: '함께 성장하는 즐거움',
    content: '혼자 공부하다가 막막했는데, 함께 성장할 수 있는 동료들을 만나서 좋았습니다. 매주 진행되는 세션이 기다려졌어요!',
    createdAt: '2024-01-10T14:30:00Z',
    isVerified: true,
    attendCount: 8,
    helpfulCount: 8,
    tags: [
      REVIEW_TAGS.SUPPORTIVE_PEERS,
      REVIEW_TAGS.CONTINUOUS_GROWTH,
      REVIEW_TAGS.EXCITING_ATMOSPHERE
    ],
    timeAgo: '1개월 전'
  },
  {
    id: 'sample-3',
    userId: 'user-3',
    userName: '박열정',
    userProfileImage: 'https://i.pravatar.cc/150?img=3',
    rating: 4,
    title: '도전적이지만 성장할 수 있었던 시간',
    content: '전반적으로 만족스러웠습니다. 다만 난이도가 생각보다 높아서 처음엔 따라가기 힘들었지만, 그만큼 성장할 수 있었습니다.',
    createdAt: '2024-01-05T11:00:00Z',
    isVerified: true,
    attendCount: 15,
    helpfulCount: 5,
    tags: [
      REVIEW_TAGS.CHALLENGING,
      REVIEW_TAGS.EXPAND_THINKING,
      REVIEW_TAGS.OVERCOME_FEAR
    ],
    timeAgo: '2개월 전'
  }
];

export const sampleReviewStats: ReviewStats = {
  averageRating: 4.7,
  totalReviews: 42,
  ratingDistribution: {
    5: 28,
    4: 10,
    3: 3,
    2: 1,
    1: 0
  },
  recommendationRate: 95
};
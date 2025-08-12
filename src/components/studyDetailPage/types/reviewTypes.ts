// Review types for study detail pages

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  rating: number; // 1-5 stars
  content: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean; // 실제 수강생 여부
  helpfulCount?: number; // 도움이 됐어요 수
  tags?: string[]; // 예: ["체계적", "친절한 멘토링", "실무 중심"]
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
  title: string; // 섹션 제목 (예: "수강생 후기", "참여자 리뷰")
  subtitle?: string; // 부제목 (선택)
  showStats?: boolean; // 통계 표시 여부
  stats?: ReviewStats; // 리뷰 통계
  reviews?: Review[]; // 실제 리뷰 목록 (API에서 자동으로 가져옴)
  displayCount?: number; // 표시할 리뷰 개수 (기본값: 10)
  sortBy?: 'latest' | 'helpful' | 'rating_high' | 'rating_low'; // 정렬 방식
}

// 샘플 리뷰 데이터 (편집 모드에서 미리보기용)
export const sampleReviews: Review[] = [
  {
    id: 'sample-1',
    userId: 'user-1',
    userName: '김개발',
    userProfileImage: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    content: '정말 체계적이고 실무에 도움이 되는 스터디였습니다. 멘토님의 꼼꼼한 코드 리뷰와 동료들과의 활발한 토론이 인상적이었어요.',
    createdAt: '2024-01-15T09:00:00Z',
    isVerified: true,
    helpfulCount: 12,
    tags: ['체계적', '실무 중심', '코드 리뷰']
  },
  {
    id: 'sample-2',
    userId: 'user-2',
    userName: '이학습',
    userProfileImage: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    content: '혼자 공부하다가 막막했는데, 함께 성장할 수 있는 동료들을 만나서 좋았습니다. 매주 진행되는 세션이 기다려졌어요!',
    createdAt: '2024-01-10T14:30:00Z',
    isVerified: true,
    helpfulCount: 8,
    tags: ['동료 학습', '꾸준함']
  },
  {
    id: 'sample-3',
    userId: 'user-3',
    userName: '박열정',
    userProfileImage: 'https://i.pravatar.cc/150?img=3',
    rating: 4,
    content: '전반적으로 만족스러웠습니다. 다만 난이도가 생각보다 높아서 처음엔 따라가기 힘들었지만, 그만큼 성장할 수 있었습니다.',
    createdAt: '2024-01-05T11:00:00Z',
    isVerified: true,
    helpfulCount: 5,
    tags: ['도전적', '성장']
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
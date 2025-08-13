// Review types for study detail pages
import { ReviewTag } from '../../../types/reviewTags';

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
  title: string; // 섹션 제목 (예: "수강생 후기", "참여자 리뷰")
  subtitle?: string; // 부제목 (선택)
  showStats?: boolean; // 통계 표시 여부
  stats?: ReviewStats; // 리뷰 통계
  reviews?: Review[]; // 실제 리뷰 목록 (API에서 자동으로 가져옴)
  displayCount?: number; // 표시할 리뷰 개수 (기본값: 10)
  sortBy?: 'latest' | 'helpful' | 'rating_high' | 'rating_low'; // 정렬 방식
}

// 샘플 리뷰 데이터 (편집 모드에서 미리보기용)
import { REVIEW_TAGS } from '../../../types/reviewTags';

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
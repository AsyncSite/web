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
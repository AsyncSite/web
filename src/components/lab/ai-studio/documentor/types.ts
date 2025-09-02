export interface DocuMentorSubmitRequest {
  url: string;
  tone?: string;
  purpose?: string;
  audience?: string;
}

export interface DocuMentorContent {
  id: string;
  userId?: string;  // null for trial users
  url: string;
  normalizedUrl?: string;
  crawledTitle?: string;
  crawledContent?: string;
  summary?: string;
  keywords?: string[];
  status: 'SUBMITTED' | 'CRAWLING' | 'CRAWLED' | 'PARSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  crawledAt?: string;
  parsedAt?: string;
  createdAt: string;
  updatedAt: string;
  analysisResult?: string;  // JSON string containing analysis results
  analysisMetadata?: string;  // JSON string containing metadata
}

export interface CategoryRating {
  category: string;
  rating: number; // 1-5 stars
  comment: string;
}

export interface DocuMentorAnalysis {
  id: string;
  overallAssessment: string; // e.g., "전반적으로 잘 쓰셨어요!"
  categoryRatings: CategoryRating[];
  strengths: string[];
  growthPoints: string[];
  summary?: string;
  keywords?: string[];
  category?: string;
}

export interface DocuMentorStats {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  resetTime: string;
  totalSubmissions: number;
}

export interface ReviewSection {
  emoji: string;
  title: string;
  items: string[];
  type: 'positive' | 'improvement' | 'suggestion';
}


export const MOCK_REVIEW: DocuMentorAnalysis = {
  id: 'mock-1',
  overallAssessment: '전반적으로 잘 쓰셨어요! 👏',
  categoryRatings: [
    {
      category: '제목 매력도',
      rating: 4,
      comment: '클릭하고 싶은 제목이에요! 조금만 더 구체적이면 완벽할 거예요'
    },
    {
      category: '첫인상',
      rating: 5,
      comment: '도입부가 재밌어서 계속 읽고 싶어져요!'
    },
    {
      category: '가독성',
      rating: 3,
      comment: '문단이 조금 길어요. 나누면 더 술술 읽힐 거예요'
    },
    {
      category: '구조/흐름',
      rating: 4,
      comment: '전체적인 흐름은 좋아요! 소제목을 추가하면 더 좋겠어요'
    },
    {
      category: '감정 전달',
      rating: 4,
      comment: '진정성이 느껴져요. 마무리를 조금 더 강화하면 어떨까요?'
    }
  ],
  strengths: [
    '도입부가 매력적이고 흥미로워요',
    '예시가 구체적이라 이해가 쉬워요',
    '친근한 어투로 거리감이 없어요',
  ],
  growthPoints: [
    '긴 문단을 2-3개로 나누어보세요',
    '중간에 소제목을 추가해보세요',
    '마무리에 독자 참여 유도 문구를 넣어보세요',
  ],
  summary: '몇 가지만 보완하면 정말 완벽한 글이 될 거예요!',
  keywords: ['블로그', '글쓰기', '피드백', 'AI'],
  category: '블로그/에세이',
};
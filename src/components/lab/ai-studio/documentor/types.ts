export interface DocuMentorSubmitRequest {
  url: string;
}

export interface DocuMentorContent {
  id: string;
  url: string;
  status: 'SUBMITTED' | 'CRAWLING' | 'PARSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocuMentorAnalysis {
  id: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  titleScore: number;
  structureScore: number;
  readabilityScore: number;
  toneScore: number;
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
  overallScore: 78,
  strengths: [
    '도입부가 재밌어서 계속 읽고 싶어져요!',
    '예시가 구체적이라 이해가 쉬워요',
    '친근한 어투로 거리감이 없어요',
  ],
  improvements: [
    '3번째 문단이 너무 길어요. 나누면 읽기 편할 것 같아요',
    '전문용어를 쉽게 풀어서 설명해주세요',
    '마무리가 조금 허전해요. 정리를 추가하면 어떨까요?',
  ],
  suggestions: [
    '중간에 소제목 2-3개를 넣어보세요',
    '마지막에 "이 글이 도움이 되셨나요?" 같은 질문을 추가해보세요',
    '핵심 내용을 박스나 인용구로 강조해보세요',
  ],
  titleScore: 85,
  structureScore: 72,
  readabilityScore: 80,
  toneScore: 90,
  summary: '전체적으로 친근하고 읽기 쉬운 글이에요. 구조를 조금 더 명확히 하면 완벽할 것 같아요!',
  keywords: ['블로그', '글쓰기', '피드백', 'AI'],
  category: '블로그/에세이',
};
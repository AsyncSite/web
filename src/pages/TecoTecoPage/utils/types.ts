// src/pages/TecoTecoPage/utils/types.ts

export interface Contributor {
  name: string;
  githubId: string;
  imageUrl?: string;
  tecotecoContribution?: string; // 새 필드 추가
  joinDate?: string;
}

export interface Review {
  name: string;
  attendCount: number;
  timeAgo: string;
  title: string;
  content: string;
  emojis: string[];
  likes: number;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface StepContent {
  label: string;
  title: string;
  description: string;
  image: string;
}

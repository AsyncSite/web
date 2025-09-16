import { Review, ReviewSectionData } from '../types/reviewTypes';
import { LeaderIntroData } from '../types/leaderIntroTypes';

// 템플릿 타입 정의
export type StudyTemplateType = 'algorithm' | 'bookclub' | 'project' | 'english';

// Hero Section 템플릿
export interface HeroSectionTemplate {
  title: string;
  subtitle: string;
  tagHeader?: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

// FAQ Section 템플릿
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSectionTemplate {
  tagHeader: string;
  title: string;
  subtitle: string;
  faqs: FAQItem[];
}

// Review Section 템플릿
export interface ReviewSectionTemplate {
  data: ReviewSectionData;
  reviews: Review[];
}

// Leader Section 템플릿
export interface LeaderSectionTemplate {
  name: string;
  profileImage: string;
  role: string;
  motivation: string;
  philosophy: string;
  welcomeMessage: string;
  expertise: string[];
  since: string;
  totalStudies: number;
  totalMembers: number;
  email: string;
  github?: string;
  blog?: string;
}

// Experience Section 템플릿
export interface ExperienceSectionTemplate {
  tagHeader: string;
  title: string;
  subtitle: string;
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
}

// Journey Section 템플릿
export interface JourneySectionTemplate {
  tagHeader: string;
  title: string;
  subtitle: string;
  milestones: {
    week: string;
    title: string;
    description: string;
    topics?: string[];
  }[];
}

// HowWeRoll Section 템플릿
export interface HowWeRollSectionTemplate {
  tagHeader: string;
  title: string;
  subtitle: string;
  schedules: {
    day: string;
    time: string;
    description: string;
    icon?: string;
  }[];
}

// Members Section 템플릿
export interface MembersSectionTemplate {
  tagHeader: string;
  title: string;
  subtitle: string;
  members: {
    name: string;
    role: string;
    bio?: string;
    profileImage?: string;
  }[];
}

// RichText Section 템플릿
export interface RichTextSectionTemplate {
  title: string;
  content: string;
}

// 전체 스터디 템플릿
export interface StudyTemplate {
  name: string;
  icon: string;
  color: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  sections: {
    hero: HeroSectionTemplate;
    faq: FAQSectionTemplate;
    review: ReviewSectionTemplate;
    leader: LeaderSectionTemplate;
    experience?: ExperienceSectionTemplate;
    journey?: JourneySectionTemplate;
    howWeRoll?: HowWeRollSectionTemplate;
    members?: MembersSectionTemplate;
    richText?: RichTextSectionTemplate;
  };
}

// 템플릿 저장소 타입
export type StudyTemplateRepository = Record<StudyTemplateType, StudyTemplate>;
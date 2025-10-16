import { RichTextData } from '../../common/richtext/RichTextTypes';

/**
 * 스터디 리더 소개 섹션 데이터 타입
 * 트레바리 스타일의 깊이있는 리더 소개를 위한 구조
 */
export interface LeaderIntroData {
  // 기본 정보 (Study.leader에서 자동 연동 가능)
  name: string;
  profileImage?: string;
  role?: string;  // "스터디 리더", "운영진" 등
  
  // 소개 콘텐츠 (RichText 포맷)
  introduction?: RichTextData;      // 자기소개
  motivation?: RichTextData;         // 이 스터디를 시작한 이유
  philosophy?: RichTextData;         // 운영 철학
  welcomeMessage?: RichTextData;     // 환영 메시지
  
  // 신뢰 지표
  experience?: {
    since?: string;                  // 활동 시작일 ("2024년 1월부터")
    totalStudies?: number;           // 운영한 스터디 수
    totalMembers?: number;           // 함께한 멤버 수
    achievements?: string[];         // 주요 성과 (선택)
  };
  
  // 전문성/배경
  background?: {
    career?: string[];              // 경력사항
    education?: string[];           // 학력/자격증
    expertise?: string[];           // 전문 분야
  };
  
  // 연락처/링크
  links?: {
    email?: string;
    kakaoTalk?: string;         // 카카오톡 오픈채팅 링크
    github?: string;
    linkedin?: string;
    blog?: string;
    portfolio?: string;
  };
  
  // 레이아웃 옵션
  layout?: 'card' | 'split' | 'centered';  // 기본: split
  showContactButton?: boolean;              // 연락하기 버튼 표시
  contactButtonText?: string;               // 버튼 텍스트 커스터마이징
  
  // 섹션 헤더 (선택)
  tagHeader?: string;                       // 예: "스터디를 이끄는 사람"
  title?: RichTextData;                     // 섹션 제목
  subtitle?: RichTextData;                  // 섹션 부제목
}

// 레이아웃 타입별 설명
export const LeaderLayoutDescriptions = {
  card: '카드 형식 - 컴팩트한 정보 표시',
  split: '분할 레이아웃 - 좌측 프로필, 우측 상세 (기본)',
  centered: '중앙 정렬 - 모바일 친화적'
};

// 기본값
export const defaultLeaderIntroData: Partial<LeaderIntroData> = {
  role: '스터디 리더',
  layout: 'split',
  showContactButton: true,
  contactButtonText: '리더에게 문의하기',
  tagHeader: '스터디를 이끄는 사람'
};
// RichText 시스템 타입 정의

// 메인 RichText 데이터 구조
export interface RichTextData {
  type: 'richtext';
  version: '1.0';
  content: Block[];
  theme?: StudyTheme;
}

// 블록 레벨 요소 (문단, 제목, 리스트 등)
export interface Block {
  type: BlockType;
  content: Inline[];
  props?: BlockProps;
}

export type BlockType = 'paragraph' | 'heading' | 'list' | 'quote';

export interface BlockProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;  // heading level
  listType?: 'bullet' | 'number';   // list type
  alignment?: 'left' | 'center' | 'right';
}

// 인라인 요소 (텍스트, 링크, 줄바꿈)
export interface Inline {
  type: InlineType;
  text?: string;
  marks?: Mark[];
  href?: string;  // for links
}

export type InlineType = 'text' | 'link' | 'break';

// 텍스트 장식 (굵게, 기울임, 하이라이트 등)
export interface Mark {
  type: MarkType;
  color?: string;           // 커스텀 텍스트 색상
  backgroundColor?: string;  // 커스텀 배경 색상
  className?: string;        // 커스텀 CSS 클래스
}

export type MarkType = 
  | 'bold' 
  | 'italic' 
  | 'highlight' 
  | 'subtle-highlight' 
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'custom';

// 스터디별 테마 설정
export interface StudyTheme {
  colors: {
    primary: string;      // 주 색상
    secondary: string;    // 부 색상
    highlight: string;    // 강조 색상
    subtleHighlight: string;  // 약한 강조 색상
    background?: string;  // 배경 색상
    text?: string;       // 텍스트 색상
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
}

// 에디터 툴바 옵션
export type ToolbarOption = 
  | 'bold'
  | 'italic'
  | 'highlight'
  | 'subtle-highlight'
  | 'link'
  | 'break'
  | 'heading'
  | 'list'
  | 'color'
  | 'emoji';

// 색상 프리셋
export const COLOR_PRESETS = {
  tecoteco: {
    name: 'TecoTeco (연두/파랑)',
    colors: {
      primary: '#c3e88d',
      secondary: '#82aaff',
      highlight: '#c3e88d',
      subtleHighlight: '#82aaff'
    }
  },
  warm: {
    name: '따뜻한 톤',
    colors: {
      primary: '#ff9800',
      secondary: '#ff5722',
      highlight: '#ffeb3b',
      subtleHighlight: '#ff9800'
    }
  },
  cool: {
    name: '차가운 톤',
    colors: {
      primary: '#00bcd4',
      secondary: '#3f51b5',
      highlight: '#00bcd4',
      subtleHighlight: '#3f51b5'
    }
  },
  monochrome: {
    name: '모노크롬',
    colors: {
      primary: '#ffffff',
      secondary: '#888888',
      highlight: '#ffffff',
      subtleHighlight: '#cccccc'
    }
  }
};

// 유틸리티 타입
export interface RichTextEditorProps {
  value: RichTextData | null;
  onChange: (data: RichTextData) => void;
  placeholder?: string;
  toolbar?: ToolbarOption[];
  theme?: StudyTheme;
  maxLength?: number;
  singleLine?: boolean;
  className?: string;
}

export interface RichTextRendererProps {
  data: RichTextData | string | null;  // string은 레거시 HTML 지원
  theme?: StudyTheme;
  className?: string;
}

// 기본 테마
export const DEFAULT_THEME: StudyTheme = {
  colors: {
    primary: '#c3e88d',
    secondary: '#82aaff',
    highlight: '#c3e88d',
    subtleHighlight: '#82aaff',
    background: 'transparent',
    text: '#f0f0f0'
  }
};
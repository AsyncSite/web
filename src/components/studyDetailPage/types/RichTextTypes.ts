// RichTextSection Block Types Definition
import { RichTextData } from '../../common/richtext/RichTextTypes';

export type BlockAlign = 'left' | 'center' | 'right';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type ListStyle = 'bullet' | 'number';
export type CalloutStyle = 'green' | 'blue' | 'yellow' | 'red';

// Content can be either plain string or RichTextData for inline styling
export type BlockContent = string | RichTextData;

// Base Block Interface
interface BaseBlock {
  id: string;
  type: string;
}

// Heading Block
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: HeadingLevel;
  content: BlockContent;  // Changed from text to content
}

// Paragraph Block
export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: BlockContent;  // Changed from text to content
  align?: BlockAlign;
}

// Callout Block (명시적 CTA/강조 박스)
export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  content: BlockContent;  // Changed from text to content
  icon?: string;
  style?: CalloutStyle;
}

// Quote Block
export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: BlockContent;  // Changed from text to content
  author?: string;
}

// List Block
export interface ListBlock extends BaseBlock {
  type: 'list';
  style: ListStyle;
  items: BlockContent[];  // Changed to support rich text in list items
}

// Info Box Block (TecoTeco 스타일 정보 박스)
export interface InfoBoxBlock extends BaseBlock {
  type: 'infoBox';
  header?: string;
  items: Array<{
    icon?: string;
    content: BlockContent;  // Changed from text to content
  }>;
}

// Code Block
export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: string;
  language?: string;
}

// Divider Block
export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

// Image Block
export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
}

// Highlighted Text Block (색상 강조)
export interface HighlightBlock extends BaseBlock {
  type: 'highlight';
  content: BlockContent;  // Changed from text to content
  color: 'green' | 'blue' | 'yellow';
}

// Union Type for All Blocks
export type RichTextBlock = 
  | HeadingBlock
  | ParagraphBlock
  | CalloutBlock
  | QuoteBlock
  | ListBlock
  | InfoBoxBlock
  | CodeBlock
  | DividerBlock
  | ImageBlock
  | HighlightBlock;

// RichTextSection Data Structure
export interface RichTextSectionData {
  title?: string;
  blocks: RichTextBlock[];
  alignment?: BlockAlign;
  backgroundColor?: string;
  theme?: 'default' | 'tecoteco';
}

// Helper Functions Type Definitions
export interface BlockHelpers {
  createBlock: (type: RichTextBlock['type']) => RichTextBlock;
  generateId: () => string;
  moveBlock: (blocks: RichTextBlock[], fromIndex: number, toIndex: number) => RichTextBlock[];
  duplicateBlock: (block: RichTextBlock) => RichTextBlock;
}
import React from 'react';
import { RichTextData, Block, Inline, Mark, StudyTheme, DEFAULT_THEME } from './RichTextTypes';
import { RichTextConverter } from './RichTextConverter';
import './RichTextStyles.css';

interface RichTextRendererProps {
  data: RichTextData | string | null;
  theme?: StudyTheme;
  className?: string;
}

/**
 * RichText 데이터를 안전하게 렌더링하는 컴포넌트
 * XSS 공격을 방지하면서 다양한 텍스트 포맷을 지원
 */
const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  data, 
  theme = DEFAULT_THEME, 
  className = '' 
}) => {
  // 데이터가 없으면 빈 컨테이너 반환
  if (!data) {
    return <div className={`richtext-renderer ${className}`} />;
  }

  // 문자열인 경우 RichText로 변환 (레거시 HTML 지원)
  let richTextData: RichTextData;
  if (typeof data === 'string') {
    richTextData = RichTextConverter.fromHTML(data);
  } else {
    richTextData = data;
  }

  // 인라인 요소 렌더링
  const renderInline = (inline: Inline, index: number): React.ReactNode => {
    // 줄바꿈
    if (inline.type === 'break') {
      return <br key={index} />;
    }

    // 링크
    if (inline.type === 'link') {
      const linkContent = inline.text || '';
      const styledContent = inline.marks 
        ? applyMarks(linkContent, inline.marks, `link-${index}`)
        : linkContent;
      
      return (
        <a 
          key={index} 
          href={inline.href || '#'} 
          className="richtext-link"
          target={inline.href?.startsWith('http') ? '_blank' : undefined}
          rel={inline.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {styledContent}
        </a>
      );
    }

    // 일반 텍스트
    const text = inline.text || '';
    if (inline.marks && inline.marks.length > 0) {
      return applyMarks(text, inline.marks, `text-${index}`);
    }
    
    return text;
  };

  // 마크(스타일) 적용
  const applyMarks = (
    content: React.ReactNode, 
    marks: Mark[], 
    key: string
  ): React.ReactNode => {
    let result = content;

    // 모든 마크를 순차적으로 적용
    marks.forEach((mark, markIndex) => {
      const markKey = `${key}-mark-${markIndex}`;
      
      switch (mark.type) {
        case 'bold':
          result = <strong key={markKey}>{result}</strong>;
          break;
          
        case 'italic':
          result = <em key={markKey}>{result}</em>;
          break;
          
        case 'underline':
          result = <u key={markKey}>{result}</u>;
          break;
          
        case 'strikethrough':
          result = <s key={markKey}>{result}</s>;
          break;
          
        case 'code':
          result = <code key={markKey} className="richtext-code">{result}</code>;
          break;
          
        case 'highlight':
          result = (
            <span 
              key={markKey} 
              className="richtext-highlight highlight"
              style={{ 
                color: mark.color || theme.colors.highlight || '#c3e88d',
                backgroundColor: mark.backgroundColor,
                fontWeight: 600
              }}
            >
              {result}
            </span>
          );
          break;
          
        case 'subtle-highlight':
          result = (
            <span 
              key={markKey} 
              className="richtext-subtle-highlight subtle-highlight"
              style={{ 
                color: mark.color || theme.colors.subtleHighlight || '#82aaff',
                backgroundColor: mark.backgroundColor,
                fontWeight: 500
              }}
            >
              {result}
            </span>
          );
          break;
          
        case 'custom':
          const style: React.CSSProperties = {};
          if (mark.color) style.color = mark.color;
          if (mark.backgroundColor) style.backgroundColor = mark.backgroundColor;
          
          result = (
            <span 
              key={markKey} 
              className={mark.className || 'richtext-custom'}
              style={style}
            >
              {result}
            </span>
          );
          break;
      }
    });

    return result;
  };

  // 블록 요소 렌더링
  const renderBlock = (block: Block, blockIndex: number): React.ReactNode => {
    const content = block.content.map((inline, inlineIndex) => 
      renderInline(inline, inlineIndex)
    );

    const key = `block-${blockIndex}`;

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.props?.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={key} 
            className={`richtext-heading richtext-h${block.props?.level || 1}`}
            style={{ textAlign: block.props?.alignment }}
          >
            {content}
          </HeadingTag>
        );

      case 'list':
        const listContent = <li key={key} className="richtext-list-item">{content}</li>;
        
        // 리스트 아이템들을 그룹화해야 함
        // 연속된 리스트 아이템들을 하나의 ul/ol로 묶기 위한 로직이 필요
        // 여기서는 간단히 개별 처리
        if (block.props?.listType === 'number') {
          return listContent; // 부모 컴포넌트에서 <ol>로 감싸야 함
        }
        return listContent; // 부모 컴포넌트에서 <ul>로 감싸야 함

      case 'quote':
        return (
          <blockquote 
            key={key} 
            className="richtext-quote"
            style={{ textAlign: block.props?.alignment }}
          >
            {content}
          </blockquote>
        );

      case 'paragraph':
      default:
        return (
          <div 
            key={key} 
            className="richtext-paragraph"
            style={{ textAlign: block.props?.alignment }}
          >
            {content}
          </div>
        );
    }
  };

  // 연속된 리스트 아이템을 그룹화
  const renderBlocks = (blocks: Block[]): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let currentListType: 'bullet' | 'number' | null = null;

    blocks.forEach((block, index) => {
      if (block.type === 'list') {
        const listType = block.props?.listType || 'bullet';
        
        // 같은 타입의 리스트면 계속 추가
        if (currentListType === listType) {
          currentList.push(renderBlock(block, index));
        } else {
          // 이전 리스트가 있으면 먼저 추가
          if (currentList.length > 0 && currentListType) {
            const ListTag = currentListType === 'number' ? 'ol' : 'ul';
            result.push(
              <ListTag key={`list-${result.length}`} className="richtext-list">
                {currentList}
              </ListTag>
            );
          }
          
          // 새 리스트 시작
          currentList = [renderBlock(block, index)];
          currentListType = listType;
        }
      } else {
        // 리스트가 아닌 블록
        // 이전 리스트가 있으면 먼저 추가
        if (currentList.length > 0 && currentListType) {
          const ListTag = currentListType === 'number' ? 'ol' : 'ul';
          result.push(
            <ListTag key={`list-${result.length}`} className="richtext-list">
              {currentList}
            </ListTag>
          );
          currentList = [];
          currentListType = null;
        }
        
        // 일반 블록 추가
        result.push(renderBlock(block, index));
      }
    });

    // 마지막 리스트 처리
    if (currentList.length > 0 && currentListType) {
      const ListTag = currentListType === 'number' ? 'ol' : 'ul';
      result.push(
        <ListTag key={`list-${result.length}`} className="richtext-list">
          {currentList}
        </ListTag>
      );
    }

    return result;
  };

  // CSS 변수로 테마 색상 주입
  const style: React.CSSProperties = {
    '--richtext-primary': theme.colors.primary,
    '--richtext-secondary': theme.colors.secondary,
    '--richtext-highlight': theme.colors.highlight,
    '--richtext-subtle-highlight': theme.colors.subtleHighlight,
    '--richtext-text': theme.colors.text || '#f0f0f0',
    '--richtext-background': theme.colors.background || 'transparent',
  } as React.CSSProperties;

  if (theme.fonts?.heading) {
    (style as any)['--richtext-font-heading'] = theme.fonts.heading;
  }
  if (theme.fonts?.body) {
    (style as any)['--richtext-font-body'] = theme.fonts.body;
  }

  return (
    <div 
      className={`richtext-renderer ${className}`}
      style={style}
    >
      {renderBlocks(richTextData.content)}
    </div>
  );
};

export default RichTextRenderer;
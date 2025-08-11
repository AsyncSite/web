import { RichTextData, Block, Inline, Mark, BlockType, InlineType, MarkType } from './RichTextTypes';

/**
 * HTML과 RichText 데이터 구조 간 변환을 담당하는 유틸리티 클래스
 */
export class RichTextConverter {
  /**
   * HTML 문자열을 RichText 데이터 구조로 변환
   */
  static fromHTML(html: string): RichTextData {
    console.log('[RichTextConverter.fromHTML] Input HTML:', html);
    
    if (!html || html.trim() === '') {
      return {
        type: 'richtext',
        version: '1.0',
        content: []
      };
    }

    const blocks: Block[] = [];
    
    // 임시 DOM 파서 생성
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    
    console.log('[RichTextConverter.fromHTML] Parsed body innerHTML:', body.innerHTML);

    // 노드 순회하며 변환
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text.trim()) {
          // 텍스트 노드는 현재 블록에 추가
          if (blocks.length === 0) {
            blocks.push({ type: 'paragraph', content: [] });
          }
          const currentBlock = blocks[blocks.length - 1];
          currentBlock.content.push({ type: 'text', text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
          case 'br':
            // 줄바꿈
            if (blocks.length === 0) {
              blocks.push({ type: 'paragraph', content: [] });
            }
            const currentBlock = blocks[blocks.length - 1];
            currentBlock.content.push({ type: 'break' });
            break;

          case 'p':
            // 문단
            const paragraphContent = processInlineElements(element);
            if (paragraphContent.length > 0) {
              blocks.push({ type: 'paragraph', content: paragraphContent });
            }
            break;

          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            // 제목
            const level = parseInt(tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
            const headingContent = processInlineElements(element);
            if (headingContent.length > 0) {
              blocks.push({
                type: 'heading',
                content: headingContent,
                props: { level }
              });
            }
            break;

          case 'ul':
          case 'ol':
            // 리스트
            const listType = tagName === 'ul' ? 'bullet' : 'number';
            element.querySelectorAll('li').forEach(li => {
              const listContent = processInlineElements(li);
              if (listContent.length > 0) {
                blocks.push({
                  type: 'list',
                  content: listContent,
                  props: { listType }
                });
              }
            });
            break;

          case 'blockquote':
            // 인용
            const quoteContent = processInlineElements(element);
            if (quoteContent.length > 0) {
              blocks.push({ type: 'quote', content: quoteContent });
            }
            break;

          case 'span':
          case 'b':
          case 'strong':
          case 'i':
          case 'em':
          case 'u':
          case 'code':
          case 'a':
            // 인라인 요소는 현재 블록에 추가
            if (blocks.length === 0) {
              blocks.push({ type: 'paragraph', content: [] });
            }
            // Root-level inline elements need special handling to preserve their styles
            // We process them as inline nodes directly, not just their children
            const tempInlines: Inline[] = [];
            const processRootInline = (node: Node, marks: Mark[] = []): void => {
              if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                if (text) {
                  const parts = text.split('\n');
                  parts.forEach((part, index) => {
                    if (part) {
                      tempInlines.push({
                        type: 'text',
                        text: part,
                        marks: marks.length > 0 ? [...marks] : undefined
                      });
                    }
                    if (index < parts.length - 1) {
                      tempInlines.push({ type: 'break' });
                    }
                  });
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const newMarks = [...marks];
                
                // Extract marks from the element
                const elTag = el.tagName.toLowerCase();
                switch (elTag) {
                  case 'b':
                  case 'strong':
                    newMarks.push({ type: 'bold' });
                    break;
                  case 'i':
                  case 'em':
                    newMarks.push({ type: 'italic' });
                    break;
                  case 'u':
                    newMarks.push({ type: 'underline' });
                    break;
                  case 'code':
                    newMarks.push({ type: 'code' });
                    break;
                  case 'span':
                    // Handle span color styles
                    const styleColor = el.style?.color;
                    if (styleColor) {
                      const normalizedColor = styleColor.replace(/\s+/g, ' ').trim();
                      if (normalizedColor.includes('255') && normalizedColor.includes('234')) {
                        newMarks.push({ type: 'highlight', color: normalizedColor });
                      } else if (normalizedColor.includes('130') && normalizedColor.includes('170')) {
                        newMarks.push({ type: 'subtle-highlight', color: normalizedColor });
                      } else if (normalizedColor.includes('195') && normalizedColor.includes('232')) {
                        newMarks.push({ type: 'highlight', color: normalizedColor });
                      } else {
                        newMarks.push({ type: 'custom', color: normalizedColor });
                      }
                    }
                    break;
                  case 'a':
                    // Links need special handling
                    const href = el.getAttribute('href') || '#';
                    const linkText = el.textContent || '';
                    tempInlines.push({
                      type: 'link',
                      text: linkText,
                      href,
                      marks: newMarks.length > 0 ? newMarks : undefined
                    });
                    return; // Don't process children for links
                }
                
                // Process children with accumulated marks
                el.childNodes.forEach(child => processRootInline(child, newMarks));
              }
            };
            
            processRootInline(element);
            blocks[blocks.length - 1].content.push(...tempInlines);
            break;

          default:
            // 기타 요소는 자식 노드 처리
            element.childNodes.forEach(child => processNode(child));
        }
      }
    };

    // 인라인 요소 처리
    const processInlineElements = (element: HTMLElement): Inline[] => {
      const inlines: Inline[] = [];

      const processInlineNode = (node: Node, marks: Mark[] = []): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text) {
            // <br/>를 \n으로 변환된 경우 처리
            const parts = text.split('\n');
            parts.forEach((part, index) => {
              if (part) {
                inlines.push({
                  type: 'text',
                  text: part,
                  marks: marks.length > 0 ? [...marks] : undefined
                });
              }
              if (index < parts.length - 1) {
                inlines.push({ type: 'break' });
              }
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          const newMarks = [...marks];

          // 마크 추가
          switch (tagName) {
            case 'b':
            case 'strong':
              newMarks.push({ type: 'bold' });
              break;
            case 'i':
            case 'em':
              newMarks.push({ type: 'italic' });
              break;
            case 'u':
              newMarks.push({ type: 'underline' });
              break;
            case 'code':
              newMarks.push({ type: 'code' });
              break;
          case 'mark': {
            // TipTap Highlight 출력(<mark>)을 RichText 마크로 변환
            const bg = (el.style && el.style.backgroundColor) ? el.style.backgroundColor.replace(/\s+/g, ' ') : '';
            const newMarksForMark = [...marks];
            if (bg) {
              if (bg.startsWith('rgb(255, 234, 0)')) {
                newMarksForMark.push({ type: 'highlight' });
              } else if (bg.startsWith('rgb(130, 170, 255)')) {
                newMarksForMark.push({ type: 'subtle-highlight' });
              } else {
                newMarksForMark.push({ type: 'custom', backgroundColor: bg });
              }
            } else {
              // 배경이 비어도 마크가 있으면 일반 highlight로 간주
              newMarksForMark.push({ type: 'highlight' });
            }
            el.childNodes.forEach(child => processInlineNode(child, newMarksForMark));
            return;
          }

          case 'span':
              const className = el.className;
              if (className && className.includes('highlight')) {
                newMarks.push({ type: 'highlight' });
              } else if (className && className.includes('subtle-highlight')) {
                newMarks.push({ type: 'subtle-highlight' });
              }
              
              // 인라인 텍스트 색상 유지 - style.color 직접 접근
              const styleColor = el.style?.color;
              console.log('[RichTextConverter] span element:', {
                tagName: el.tagName,
                className: el.className,
                styleColor: styleColor,
                styleObj: el.style,
                getAttribute: el.getAttribute ? el.getAttribute('style') : 'no getAttribute',
                outerHTML: el.outerHTML?.substring(0, 100)
              });
              
              if (styleColor) {
                console.log('[RichTextConverter] Found style.color:', styleColor);
                // RGB 색상 정규화
                const normalizedColor = styleColor.replace(/\s+/g, ' ').trim();
                
                // 대표 색상 매핑
                if (normalizedColor.includes('255') && normalizedColor.includes('234')) {
                  newMarks.push({ type: 'highlight', color: normalizedColor });
                } else if (normalizedColor.includes('130') && normalizedColor.includes('170')) {
                  newMarks.push({ type: 'subtle-highlight', color: normalizedColor });
                } else if (normalizedColor.includes('195') && normalizedColor.includes('232')) {
                  // 테마 기본 하이라이트 색상
                  newMarks.push({ type: 'highlight', color: normalizedColor });
                } else {
                  newMarks.push({ type: 'custom', color: normalizedColor });
                }
              }
              break;
            case 'br':
              inlines.push({ type: 'break' });
              return;
            case 'a':
              // 링크는 특별 처리
              const href = el.getAttribute('href') || '#';
              const linkText = el.textContent || '';
              inlines.push({
                type: 'link',
                text: linkText,
                href,
                marks: newMarks.length > 0 ? newMarks : undefined
              });
              return;
          }

          // 자식 노드 처리
          el.childNodes.forEach(child => processInlineNode(child, newMarks));
        }
      };

      element.childNodes.forEach(child => processInlineNode(child));
      return inlines;
    };

    // 모든 자식 노드 처리
    body.childNodes.forEach(node => processNode(node));

    // 빈 블록이면 기본 문단 추가
    if (blocks.length === 0) {
      // HTML에 <br/>만 있는 경우 처리
      const brMatches = html.match(/<br\s*\/?>/gi);
      if (brMatches) {
        const content: Inline[] = [];
        const parts = html.split(/<br\s*\/?>/gi);
        parts.forEach((part, index) => {
          // HTML 태그 제거하고 텍스트만 추출
          const textOnly = part.replace(/<[^>]*>/g, '').trim();
          if (textOnly) {
            content.push({ type: 'text', text: textOnly });
          }
          if (index < parts.length - 1) {
            content.push({ type: 'break' });
          }
        });
        if (content.length > 0) {
          blocks.push({ type: 'paragraph', content });
        }
      } else {
        // 순수 텍스트인 경우
        const textOnly = html.replace(/<[^>]*>/g, '').trim();
        if (textOnly) {
          blocks.push({
            type: 'paragraph',
            content: [{ type: 'text', text: textOnly }]
          });
        }
      }
    }

    const result: RichTextData = {
      type: 'richtext',
      version: '1.0',
      content: blocks
    };
    
    console.log('[RichTextConverter.fromHTML] Output RichTextData:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * RichText 데이터 구조를 HTML 문자열로 변환 (필요시 export용)
   */
  static toHTML(data: RichTextData): string {
    if (!data || !data.content || data.content.length === 0) {
      return '';
    }

    const blockToHTML = (block: Block): string => {
      const inlineToHTML = (inline: Inline): string => {
        if (inline.type === 'break') {
          return '<br/>';
        }

        if (inline.type === 'link') {
          let linkHTML = `<a href="${inline.href || '#'}">${inline.text || ''}</a>`;
          if (inline.marks) {
            linkHTML = applyMarks(linkHTML, inline.marks);
          }
          return linkHTML;
        }

        let text = inline.text || '';
        if (inline.marks) {
          text = applyMarks(text, inline.marks);
        }
        return text;
      };

      const applyMarks = (text: string, marks: Mark[]): string => {
        let result = text;
        marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              result = `<strong>${result}</strong>`;
              break;
            case 'italic':
              result = `<em>${result}</em>`;
              break;
            case 'underline':
              result = `<u>${result}</u>`;
              break;
            case 'code':
              result = `<code>${result}</code>`;
              break;
            case 'highlight': {
              // 텍스트 색상 강조 (배경 미사용)
              const color = mark.color || 'rgb(255, 234, 0)';
              result = `<span class="highlight" style="color: ${color}">${result}</span>`;
              break;
            }
            case 'subtle-highlight': {
              // 텍스트 색상 약한 강조 (배경 미사용)
              const subtle = mark.color || 'rgb(130, 170, 255)';
              result = `<span class="subtle-highlight" style="color: ${subtle}">${result}</span>`;
              break;
            }
            case 'custom':
              const style = [];
              if (mark.color) style.push(`color: ${mark.color}`);
              if (mark.backgroundColor) style.push(`background-color: ${mark.backgroundColor}`);
              const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : '';
              if (mark.backgroundColor) {
                // 배경색 지정된 경우에만 mark 사용
                const classAttr = mark.className ? ` class="${mark.className}"` : ' class="sdpre-mark"';
                result = `<mark${classAttr}${styleAttr}>${result}</mark>`;
              } else {
                const classAttr = mark.className ? ` class="${mark.className}"` : '';
                result = `<span${classAttr}${styleAttr}>${result}</span>`;
              }
              break;
          }
        });
        return result;
      };

      const content = block.content.map(inlineToHTML).join('');

      switch (block.type) {
        case 'heading':
          const level = block.props?.level || 1;
          return `<h${level}>${content}</h${level}>`;
        case 'list':
          const tag = block.props?.listType === 'number' ? 'ol' : 'ul';
          return `<li>${content}</li>`;
        case 'quote':
          return `<blockquote>${content}</blockquote>`;
        case 'paragraph':
        default:
          return content; // 문단은 태그 없이 내용만
      }
    };

    return data.content.map(blockToHTML).join('');
  }

  /**
   * 레거시 데이터 감지 및 변환
   */
  static parseContent(content: any): RichTextData | null {
    if (!content) return null;

    // 이미 RichText 형식인 경우
    if (content.type === 'richtext' && content.version && content.content) {
      return content as RichTextData;
    }

    // 문자열인 경우 HTML로 간주하고 변환
    if (typeof content === 'string') {
      return this.fromHTML(content);
    }

    return null;
  }

  /**
   * 간단한 텍스트를 RichText로 변환
   */
  static fromPlainText(text: string, marks?: Mark[]): RichTextData {
    if (!text) {
      return {
        type: 'richtext',
        version: '1.0',
        content: []
      };
    }

    // 줄바꿈 처리
    const lines = text.split('\n');
    const content: Inline[] = [];

    lines.forEach((line, index) => {
      if (line) {
        content.push({
          type: 'text',
          text: line,
          marks
        });
      }
      if (index < lines.length - 1) {
        content.push({ type: 'break' });
      }
    });

    return {
      type: 'richtext',
      version: '1.0',
      content: [{
        type: 'paragraph',
        content
      }]
    };
  }
}
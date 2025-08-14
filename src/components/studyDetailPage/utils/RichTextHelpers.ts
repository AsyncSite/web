// RichText Helper Functions

import { 
  RichTextBlock, 
  HeadingBlock,
  ParagraphBlock,
  CalloutBlock,
  QuoteBlock,
  ListBlock,
  InfoBoxBlock,
  CodeBlock,
  DividerBlock,
  ImageBlock,
  HighlightBlock,
  RichTextSectionData,
  BlockContent
} from '../types/RichTextTypes';
import { RichTextData } from '../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../common/richtext/RichTextConverter';

// Generate unique ID for blocks
export const generateId = (): string => {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert BlockContent to HTML string
export const contentToHTML = (content: BlockContent): string => {
  if (typeof content === 'string') {
    return escapeHtml(content);
  }
  // If it's RichTextData, convert to HTML
  console.log('[contentToHTML] Converting RichTextData:', content);
  const html = RichTextConverter.toHTML(content);
  console.log('[contentToHTML] Converted HTML:', html);
  return html;
};

// Convert HTML string to BlockContent (tries to parse as RichTextData)
export const htmlToContent = (html: string): BlockContent => {
  // Try to parse as RichTextData for inline styling
  try {
    return RichTextConverter.fromHTML(html);
  } catch {
    // If fails, return as plain string
    return html;
  }
};

// Get plain text from BlockContent (for forms)
export const contentToPlainText = (content: BlockContent): string => {
  if (typeof content === 'string') {
    return content;
  }
  // Extract plain text from RichTextData
  return content.content
    .map(block => block.content.map(inline => inline.text || '').join(''))
    .join('');
};

// Create new block with default values
export const createBlock = (type: RichTextBlock['type']): RichTextBlock => {
  const id = generateId();

  switch (type) {
    case 'heading':
      return {
        id,
        type: 'heading',
        level: 2,
        content: '새 제목'
      } as HeadingBlock;

    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        content: '새 단락을 입력하세요.',
        align: 'left'
      } as ParagraphBlock;

    case 'callout':
      return {
        id,
        type: 'callout',
        content: '중요한 내용을 강조하세요.',
        icon: '💡',
        style: 'green'
      } as CalloutBlock;

    case 'quote':
      return {
        id,
        type: 'quote',
        content: '인용문을 입력하세요.',
        author: ''
      } as QuoteBlock;

    case 'list':
      return {
        id,
        type: 'list',
        style: 'bullet',
        items: ['첫 번째 항목', '두 번째 항목']
      } as ListBlock;

    case 'infoBox':
      return {
        id,
        type: 'infoBox',
        header: '정보 박스',
        items: [
          { icon: '📌', content: '첫 번째 정보' },
          { icon: '🎯', content: '두 번째 정보' }
        ]
      } as InfoBoxBlock;

    case 'code':
      return {
        id,
        type: 'code',
        code: '// 코드를 입력하세요',
        language: 'javascript'
      } as CodeBlock;

    case 'divider':
      return {
        id,
        type: 'divider'
      } as DividerBlock;

    case 'image':
      return {
        id,
        type: 'image',
        src: '',
        alt: '이미지 설명',
        caption: ''
      } as ImageBlock;

    case 'highlight':
      return {
        id,
        type: 'highlight',
        content: '강조할 텍스트',
        color: 'green'
      } as HighlightBlock;

    default:
      throw new Error(`Unknown block type: ${type}`);
  }
};

// Move block within array
export const moveBlock = (
  blocks: RichTextBlock[], 
  fromIndex: number, 
  toIndex: number
): RichTextBlock[] => {
  const result = [...blocks];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

// Duplicate a block
export const duplicateBlock = (block: RichTextBlock): RichTextBlock => {
  return {
    ...block,
    id: generateId()
  };
};

// Convert blocks to HTML (for saving/rendering)
export const blocksToHTML = (blocks: RichTextBlock[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        return `<h${block.level}>${contentToHTML(block.content)}</h${block.level}>`;

      case 'paragraph':
        const alignStyle = block.align && block.align !== 'left' 
          ? ` style="text-align: ${block.align};"` 
          : '';
        return `<p${alignStyle}>${contentToHTML(block.content)}</p>`;

      case 'callout':
        // 표준 스타일 callout - 명시적 클래스 사용
        return `<div class="study-callout study-callout-${block.style || 'green'}">
          ${block.icon ? `<span class="callout-icon">${block.icon}</span>` : ''}
          <p>${contentToHTML(block.content)}</p>
        </div>`;

      case 'quote':
        return `<blockquote>
          <p>${contentToHTML(block.content)}</p>
          ${block.author ? `<cite>${escapeHtml(block.author)}</cite>` : ''}
        </blockquote>`;

      case 'list':
        const tag = block.style === 'number' ? 'ol' : 'ul';
        const items = block.items.map(item => `<li>${contentToHTML(item)}</li>`).join('\n');
        return `<${tag}>\n${items}\n</${tag}>`;

      case 'infoBox':
        const infoItems = block.items.map(item => `
          <div class="study-management-richtext-info-item">
            ${item.icon ? `<span class="study-management-richtext-info-icon">${item.icon}</span>` : ''}
            <span class="study-management-richtext-info-text">${contentToHTML(item.content)}</span>
          </div>
        `).join('\n');
        
        return `<div class="study-management-richtext-info-box">
          ${block.header ? `<div class="study-management-richtext-info-header">${escapeHtml(block.header)}</div>` : ''}
          <div class="study-management-richtext-info-content">
            ${infoItems}
          </div>
        </div>`;

      case 'code':
        return `<pre><code${block.language ? ` class="language-${block.language}"` : ''}>${escapeHtml(block.code)}</code></pre>`;

      case 'divider':
        return '<hr />';

      case 'image':
        const caption = block.caption 
          ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` 
          : '';
        return `<figure>
          <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || '')}" />
          ${caption}
        </figure>`;

      case 'highlight':
        const colorClass = `highlight-${block.color}`;
        return `<span class="study-management-richtext-${colorClass}">${contentToHTML(block.content)}</span>`;

      default:
        return '';
    }
  }).join('\n');
};

// Parse HTML to blocks (for migration/loading)
export const htmlToBlocks = (html: string): RichTextBlock[] => {
  const blocks: RichTextBlock[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = doc.body.children;

  Array.from(elements).forEach(element => {
    const tagName = element.tagName.toLowerCase();
    
    // Heading
    if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        id: generateId(),
        type: 'heading',
        level,
        content: htmlToContent(element.innerHTML)
      });
    }
    
    // Paragraph or Callout
    else if (tagName === 'p') {
      const style = element.getAttribute('style') || '';
      const parent = element.parentElement;
      
      // Skip if inside a callout div
      if (parent && parent.classList.contains('study-callout')) {
        return;
      }
      
      // Check text alignment
      let align: 'left' | 'center' | 'right' = 'left';
      if (style.includes('text-align: center')) align = 'center';
      else if (style.includes('text-align: right')) align = 'right';
      
      blocks.push({
        id: generateId(),
        type: 'paragraph',
        content: htmlToContent(element.innerHTML),
        align
      });
    }
    
    // Callout div
    else if (tagName === 'div' && element.classList.contains('study-callout')) {
      const icon = element.querySelector('.callout-icon')?.textContent || '';
      const pElement = element.querySelector('p');
      const content = pElement ? htmlToContent(pElement.innerHTML) : htmlToContent(element.innerHTML);
      let style: 'green' | 'blue' | 'yellow' | 'red' = 'green';
      
      if (element.classList.contains('study-callout-blue')) style = 'blue';
      else if (element.classList.contains('study-callout-yellow')) style = 'yellow';
      else if (element.classList.contains('study-callout-red')) style = 'red';
      
      blocks.push({
        id: generateId(),
        type: 'callout',
        content,
        icon,
        style
      });
    }
    
    // Info Box
    else if (tagName === 'div' && element.classList.contains('study-management-richtext-info-box')) {
      const header = element.querySelector('.study-management-richtext-info-header')?.textContent || '';
      const items = Array.from(element.querySelectorAll('.study-management-richtext-info-item')).map(item => {
        const textElement = item.querySelector('.study-management-richtext-info-text');
        return {
          icon: item.querySelector('.study-management-richtext-info-icon')?.textContent || '',
          content: textElement ? htmlToContent(textElement.innerHTML) : ''
        };
      });
      
      blocks.push({
        id: generateId(),
        type: 'infoBox',
        header,
        items
      });
    }
    
    // Quote
    else if (tagName === 'blockquote') {
      const pElement = element.querySelector('p');
      const content = pElement ? htmlToContent(pElement.innerHTML) : htmlToContent(element.innerHTML);
      const author = element.querySelector('cite')?.textContent || '';
      
      blocks.push({
        id: generateId(),
        type: 'quote',
        content,
        author
      });
    }
    
    // List
    else if (tagName === 'ul' || tagName === 'ol') {
      const items = Array.from(element.querySelectorAll('li')).map(li => htmlToContent(li.innerHTML));
      
      blocks.push({
        id: generateId(),
        type: 'list',
        style: tagName === 'ol' ? 'number' : 'bullet',
        items
      });
    }
    
    // Code
    else if (tagName === 'pre') {
      const codeElement = element.querySelector('code');
      const code = codeElement?.textContent || element.textContent || '';
      const languageClass = codeElement?.className.match(/language-(\w+)/);
      const language = languageClass ? languageClass[1] : '';
      
      blocks.push({
        id: generateId(),
        type: 'code',
        code,
        language
      });
    }
    
    // Divider
    else if (tagName === 'hr') {
      blocks.push({
        id: generateId(),
        type: 'divider'
      });
    }
    
    // Image
    else if (tagName === 'figure') {
      const img = element.querySelector('img');
      if (img) {
        blocks.push({
          id: generateId(),
          type: 'image',
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          caption: element.querySelector('figcaption')?.textContent || ''
        });
      }
    }
  });

  return blocks;
};

// Escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
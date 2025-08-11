import React, { useState } from 'react';
import { 
  RichTextBlock, 
  RichTextSectionData,
  BlockAlign,
  HeadingLevel,
  CalloutStyle,
  ListStyle
} from '../../types/RichTextTypes';
import {
  createBlock,
  moveBlock,
  duplicateBlock,
  blocksToHTML,
  htmlToBlocks
} from '../../utils/RichTextHelpers';
import './RichTextSectionForm.css';

interface RichTextSectionFormProps {
  initialData?: {
    title?: string;
    content?: string;
    blocks?: RichTextBlock[];
    alignment?: BlockAlign;
    backgroundColor?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const RichTextSectionForm: React.FC<RichTextSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [backgroundColor, setBackgroundColor] = useState(initialData.backgroundColor || '#0a0a0a');
  
  // 블록 데이터로 초기화 (기존 HTML이 있으면 변환)
  const [blocks, setBlocks] = useState<RichTextBlock[]>(() => {
    if (initialData.blocks) {
      return initialData.blocks;
    }
    if (initialData.content) {
      return htmlToBlocks(initialData.content);
    }
    return [];
  });

  // 편집 중인 블록 ID
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (blocks.length === 0) {
      alert('내용을 추가해주세요.');
      return;
    }

    // 블록을 HTML로 변환하여 저장
    const content = blocksToHTML(blocks);
    
    onSave({
      title,
      content,
      blocks, // 블록 데이터도 함께 저장
      backgroundColor,
      theme: 'tecoteco'
    });
  };

  // 블록 추가
  const addBlock = (type: RichTextBlock['type']) => {
    const newBlock = createBlock(type);
    setBlocks([...blocks, newBlock]);
    setEditingBlockId(newBlock.id);
  };

  // 블록 업데이트
  const updateBlock = (id: string, updates: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  // 블록 삭제
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setEditingBlockId(null);
  };

  // 블록 복제
  const cloneBlock = (id: string) => {
    const blockIndex = blocks.findIndex(block => block.id === id);
    if (blockIndex !== -1) {
      const cloned = duplicateBlock(blocks[blockIndex]);
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, cloned);
      setBlocks(newBlocks);
    }
  };

  // 블록 이동
  const moveBlockUp = (id: string) => {
    const index = blocks.findIndex(block => block.id === id);
    if (index > 0) {
      setBlocks(moveBlock(blocks, index, index - 1));
    }
  };

  const moveBlockDown = (id: string) => {
    const index = blocks.findIndex(block => block.id === id);
    if (index < blocks.length - 1) {
      setBlocks(moveBlock(blocks, index, index + 1));
    }
  };

  // TecoTeco 예시 데이터 로드
  const loadExampleData = () => {
    setTitle('TecoTeco 소개');
    setBackgroundColor('#0a0a0a');
    
    const exampleBlocks: RichTextBlock[] = [
      {
        id: '1',
        type: 'heading',
        level: 2,
        text: '변화하는 세상에서 흔들리지 않을 \'나\'를 위한 스터디'
      },
      {
        id: '2',
        type: 'paragraph',
        text: '코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고, 개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?'
      },
      {
        id: '3',
        type: 'highlight',
        text: '변하지 않는 개발자의 핵심 역량',
        color: 'green'
      },
      {
        id: '4',
        type: 'heading',
        level: 3,
        text: '물고기를 잡는 방법을 익히는 것'
      },
      {
        id: '5',
        type: 'paragraph',
        text: '우리는 \'물고기 그 자체\'가 아닌, \'물고기를 잡는 방법\'에 집중합니다. 단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고 견고한 사고력과 논리력을 단련하는 것이 목표입니다.'
      },
      {
        id: '6',
        type: 'infoBox',
        header: '💡 핵심 포인트',
        items: [
          { icon: '📌', text: '단순 암기가 아닌 사고력 향상' },
          { icon: '🎯', text: 'AI와의 협업 능력 개발' },
          { icon: '🚀', text: '변화에 흔들리지 않는 개발자 핵심 역량' }
        ]
      },
      {
        id: '7',
        type: 'callout',
        text: '우리가 찾는 건 변화 속에서도 흔들리지 않을 \'나\', 생각하는 힘이에요.',
        icon: '✨',
        style: 'green'
      }
    ];
    
    setBlocks(exampleBlocks);
  };

  // 블록 렌더링
  const renderBlockEditor = (block: RichTextBlock) => {
    const isEditing = editingBlockId === block.id;

    return (
      <div 
        key={block.id} 
        className="study-management-richtext-block-item"
        onClick={() => setEditingBlockId(block.id)}
      >
        <div className="study-management-richtext-block-header">
          <span className="study-management-richtext-block-type">
            {getBlockTypeLabel(block.type)}
          </span>
          <div className="study-management-richtext-block-actions">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); moveBlockUp(block.id); }}
              className="study-management-richtext-block-btn"
              disabled={blocks.indexOf(block) === 0}
            >
              ↑
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); moveBlockDown(block.id); }}
              className="study-management-richtext-block-btn"
              disabled={blocks.indexOf(block) === blocks.length - 1}
            >
              ↓
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); cloneBlock(block.id); }}
              className="study-management-richtext-block-btn"
            >
              복제
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
              className="study-management-richtext-block-btn study-management-richtext-block-delete"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="study-management-richtext-block-content">
          {isEditing ? renderBlockForm(block) : renderBlockPreview(block)}
        </div>
      </div>
    );
  };

  // 블록 타입별 편집 폼
  const renderBlockForm = (block: RichTextBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="study-management-richtext-block-form">
            <select 
              value={block.level}
              onChange={(e) => updateBlock(block.id, { level: parseInt(e.target.value) as HeadingLevel })}
              className="study-management-richtext-select"
            >
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
            </select>
            <input
              type="text"
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              className="study-management-richtext-input"
              placeholder="제목 텍스트"
            />
          </div>
        );

      case 'paragraph':
        return (
          <div className="study-management-richtext-block-form">
            <select
              value={block.align || 'left'}
              onChange={(e) => updateBlock(block.id, { align: e.target.value as BlockAlign })}
              className="study-management-richtext-select"
            >
              <option value="left">왼쪽 정렬</option>
              <option value="center">가운데 정렬</option>
              <option value="right">오른쪽 정렬</option>
            </select>
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              className="study-management-richtext-textarea"
              placeholder="단락 내용"
              rows={3}
            />
          </div>
        );

      case 'callout':
        return (
          <div className="study-management-richtext-block-form">
            <div className="study-management-richtext-form-row">
              <input
                type="text"
                value={block.icon || ''}
                onChange={(e) => updateBlock(block.id, { icon: e.target.value })}
                className="study-management-richtext-input study-management-richtext-icon-input"
                placeholder="아이콘"
                style={{ width: '80px' }}
              />
              <select
                value={block.style || 'green'}
                onChange={(e) => updateBlock(block.id, { style: e.target.value as CalloutStyle })}
                className="study-management-richtext-select"
              >
                <option value="green">초록 (기본)</option>
                <option value="blue">파랑</option>
                <option value="yellow">노랑</option>
                <option value="red">빨강</option>
              </select>
            </div>
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              className="study-management-richtext-textarea"
              placeholder="강조할 내용"
              rows={2}
            />
          </div>
        );

      case 'list':
        return (
          <div className="study-management-richtext-block-form">
            <select
              value={block.style}
              onChange={(e) => updateBlock(block.id, { style: e.target.value as ListStyle })}
              className="study-management-richtext-select"
            >
              <option value="bullet">글머리 기호</option>
              <option value="number">번호 목록</option>
            </select>
            {block.items.map((item, index) => (
              <div key={index} className="study-management-richtext-list-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[index] = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="study-management-richtext-input"
                  placeholder={`항목 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = block.items.filter((_, i) => i !== index);
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="study-management-richtext-list-remove"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateBlock(block.id, { items: [...block.items, ''] })}
              className="study-management-richtext-add-list-item"
            >
              + 항목 추가
            </button>
          </div>
        );

      case 'infoBox':
        return (
          <div className="study-management-richtext-block-form">
            <input
              type="text"
              value={block.header || ''}
              onChange={(e) => updateBlock(block.id, { header: e.target.value })}
              className="study-management-richtext-input"
              placeholder="정보 박스 헤더"
            />
            {block.items.map((item, index) => (
              <div key={index} className="study-management-richtext-info-item-edit">
                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[index] = { ...newItems[index], icon: e.target.value };
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="study-management-richtext-input study-management-richtext-icon-input"
                  placeholder="아이콘"
                  style={{ width: '80px' }}
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[index] = { ...newItems[index], text: e.target.value };
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="study-management-richtext-input"
                  placeholder="정보 텍스트"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = block.items.filter((_, i) => i !== index);
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="study-management-richtext-list-remove"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateBlock(block.id, { items: [...block.items, { text: '' }] })}
              className="study-management-richtext-add-list-item"
            >
              + 정보 추가
            </button>
          </div>
        );

      case 'quote':
        return (
          <div className="study-management-richtext-block-form">
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              className="study-management-richtext-textarea"
              placeholder="인용문"
              rows={2}
            />
            <input
              type="text"
              value={block.author || ''}
              onChange={(e) => updateBlock(block.id, { author: e.target.value })}
              className="study-management-richtext-input"
              placeholder="작성자 (선택)"
            />
          </div>
        );

      case 'code':
        return (
          <div className="study-management-richtext-block-form">
            <input
              type="text"
              value={block.language || ''}
              onChange={(e) => updateBlock(block.id, { language: e.target.value })}
              className="study-management-richtext-input"
              placeholder="언어 (예: javascript, python)"
            />
            <textarea
              value={block.code}
              onChange={(e) => updateBlock(block.id, { code: e.target.value })}
              className="study-management-richtext-textarea study-management-richtext-code-editor"
              placeholder="코드"
              rows={4}
            />
          </div>
        );

      case 'image':
        return (
          <div className="study-management-richtext-block-form">
            <input
              type="text"
              value={block.src}
              onChange={(e) => updateBlock(block.id, { src: e.target.value })}
              className="study-management-richtext-input"
              placeholder="이미지 URL"
            />
            <input
              type="text"
              value={block.alt || ''}
              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
              className="study-management-richtext-input"
              placeholder="대체 텍스트"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
              className="study-management-richtext-input"
              placeholder="캡션 (선택)"
            />
          </div>
        );

      case 'highlight':
        return (
          <div className="study-management-richtext-block-form">
            <select
              value={block.color}
              onChange={(e) => updateBlock(block.id, { color: e.target.value as 'green' | 'blue' | 'yellow' })}
              className="study-management-richtext-select"
            >
              <option value="green">초록</option>
              <option value="blue">파랑</option>
              <option value="yellow">노랑</option>
            </select>
            <input
              type="text"
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              className="study-management-richtext-input"
              placeholder="강조할 텍스트"
            />
          </div>
        );

      case 'divider':
        return <div className="study-management-richtext-divider-preview">구분선</div>;

      default:
        return null;
    }
  };

  // 블록 미리보기
  const renderBlockPreview = (block: RichTextBlock) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
        return <HeadingTag>{block.text}</HeadingTag>;

      case 'paragraph':
        return <p style={{ textAlign: block.align }}>{block.text}</p>;

      case 'callout':
        return (
          <div className={`study-management-richtext-callout-preview callout-${block.style}`}>
            {block.icon && <span className="callout-icon">{block.icon}</span>}
            <span>{block.text}</span>
          </div>
        );

      case 'list':
        const ListTag = block.style === 'number' ? 'ol' : 'ul';
        return (
          <ListTag>
            {block.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ListTag>
        );

      case 'infoBox':
        return (
          <div className="study-management-richtext-info-preview">
            {block.header && <div className="info-header">{block.header}</div>}
            {block.items.map((item, index) => (
              <div key={index} className="info-item">
                {item.icon && <span className="info-icon">{item.icon}</span>}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        );

      case 'quote':
        return (
          <blockquote>
            <p>{block.text}</p>
            {block.author && <cite>— {block.author}</cite>}
          </blockquote>
        );

      case 'code':
        return (
          <pre>
            <code>{block.code}</code>
          </pre>
        );

      case 'image':
        return (
          <figure>
            {block.src && <img src={block.src} alt={block.alt} style={{ maxWidth: '100%' }} />}
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        );

      case 'highlight':
        return (
          <span className={`highlight-${block.color}`}>{block.text}</span>
        );

      case 'divider':
        return <hr />;

      default:
        return null;
    }
  };

  // 블록 타입 라벨
  const getBlockTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      heading: '제목',
      paragraph: '단락',
      callout: 'Callout',
      quote: '인용문',
      list: '목록',
      infoBox: '정보 박스',
      code: '코드',
      divider: '구분선',
      image: '이미지',
      highlight: '강조'
    };
    return labels[type] || type;
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-richtext-form">
      <div className="study-management-richtext-form-group">
        <label>섹션 제목 (선택)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 스터디를 통해 얻을 수 있는 것들"
          className="study-management-richtext-input"
        />
      </div>

      <div className="study-management-richtext-form-group">
        <label>콘텐츠 블록</label>
        
        {/* 블록 추가 버튼들 */}
        <div className="study-management-richtext-block-toolbar">
          <button type="button" onClick={() => addBlock('heading')} className="study-management-richtext-toolbar-btn">
            + 제목
          </button>
          <button type="button" onClick={() => addBlock('paragraph')} className="study-management-richtext-toolbar-btn">
            + 단락
          </button>
          <button type="button" onClick={() => addBlock('callout')} className="study-management-richtext-toolbar-btn study-management-richtext-special-btn">
            + Callout
          </button>
          <button type="button" onClick={() => addBlock('infoBox')} className="study-management-richtext-toolbar-btn study-management-richtext-special-btn">
            + 정보박스
          </button>
          <button type="button" onClick={() => addBlock('list')} className="study-management-richtext-toolbar-btn">
            + 목록
          </button>
          <button type="button" onClick={() => addBlock('quote')} className="study-management-richtext-toolbar-btn">
            + 인용문
          </button>
          <button type="button" onClick={() => addBlock('code')} className="study-management-richtext-toolbar-btn">
            + 코드
          </button>
          <button type="button" onClick={() => addBlock('highlight')} className="study-management-richtext-toolbar-btn">
            + 강조
          </button>
          <button type="button" onClick={() => addBlock('image')} className="study-management-richtext-toolbar-btn">
            + 이미지
          </button>
          <button type="button" onClick={() => addBlock('divider')} className="study-management-richtext-toolbar-btn">
            + 구분선
          </button>
        </div>

        {/* 블록 리스트 */}
        <div className="study-management-richtext-blocks-container">
          {blocks.length === 0 ? (
            <div className="study-management-richtext-empty-state">
              위의 버튼을 클릭하여 콘텐츠를 추가하세요
            </div>
          ) : (
            blocks.map(block => renderBlockEditor(block))
          )}
        </div>
      </div>

      <div className="study-management-richtext-form-group">
        <button 
          type="button" 
          onClick={loadExampleData}
          className="study-management-richtext-template-btn study-management-richtext-example"
        >
          TecoTeco 예시 데이터 불러오기
        </button>
      </div>

      <div className="study-management-richtext-form-row">
        <div className="study-management-richtext-form-group">
          <label>배경 색상</label>
          <div className="study-management-richtext-color-wrapper">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="study-management-richtext-color-picker"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="예: #0a0a0a"
              className="study-management-richtext-input study-management-richtext-color-text"
            />
          </div>
        </div>
      </div>

      <div className="study-management-richtext-form-group">
        <label>미리보기</label>
        <div 
          className="study-management-richtext-preview"
          style={{ 
            backgroundColor: backgroundColor || '#0a0a0a',
            padding: '20px',
            borderRadius: '8px'
          }}
        >
          {title && <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>{title}</h2>}
          <div dangerouslySetInnerHTML={{ __html: blocksToHTML(blocks) || '<p style="color: rgba(255, 255, 255, 0.5);">콘텐츠를 추가하면 여기에 미리보기가 표시됩니다.</p>' }} />
        </div>
      </div>

      <div className="study-management-richtext-form-actions">
        <button type="button" onClick={onCancel} className="study-management-richtext-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-richtext-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default RichTextSectionForm;
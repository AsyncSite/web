import React, { useState, useRef } from 'react';
import './RichTextSectionForm.css';
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate, systemDesignTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';

interface RichTextSectionFormProps {
  initialData?: {
    title?: string;
    content?: string;
    alignment?: 'left' | 'center' | 'right';
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
  console.log('===== RichTextSectionForm 컴포넌트 렌더링 =====');
  console.log('initialData:', initialData);
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [alignment, setAlignment] = useState(initialData.alignment || 'left');
  const [backgroundColor, setBackgroundColor] = useState(initialData.backgroundColor || '#0a0a0a');
  // 표준 테마로 고정
  const theme = 'standard';
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) {
      // Validation failed - content is required
      return;
    }

    onSave({
      title,
      content,
      alignment,
      backgroundColor,
      theme: 'standard'
    });
  };

  // 표준 예시 데이터 - templateData.ts에서 가져오기
  const loadExampleData = (templateType: string) => {
    console.log('=== loadExampleData 호출됨 ===');
    console.log('templateType:', templateType);
    console.log('mogakupTemplate 체크:', mogakupTemplate);
    console.log('bookStudyTemplate 체크:', bookStudyTemplate);

    if (!templateType) return;

    let richTextData;
    if (templateType === 'algorithm') {
      richTextData = algorithmTemplate.sections.richText;
    } else if (templateType === 'mogakup') {
      richTextData = mogakupTemplate?.sections?.richText;
    } else if (templateType === 'bookStudy') {
      richTextData = bookStudyTemplate?.sections?.richText;
    } else if (templateType === 'systemDesign') {
      richTextData = systemDesignTemplate?.sections?.richText;
    } else {
      return;
    }

    console.log('richTextData:', richTextData);

    if (!richTextData) {
      console.error('richTextData is undefined for', templateType);
      return;
    }

    setTitle(richTextData.title || '');
    setEditorMode('visual'); // 비주얼 모드로 전환
    setContent(richTextData.content || '');
    setAlignment((richTextData.alignment || 'left') as 'left' | 'center' | 'right');
    setBackgroundColor(richTextData.backgroundColor || '#0a0a0a');

    console.log('=== loadExampleData 완료 ===');
  };

  // Clear form and reset to initial state
  const handleClearTemplate = () => {
    setTitle(initialData.title || '');
    setContent(initialData.content || '');
    setAlignment(initialData.alignment || 'left');
    setBackgroundColor(initialData.backgroundColor || '#0a0a0a');
    setEditorMode('visual');
  };

  // 템플릿 예시
  const templates = [
    {
      name: '소개글',
      content: `<h3>스터디 소개</h3>
<p>여기에 스터디에 대한 자세한 소개를 작성하세요.</p>`
    },
    {
      name: '학습 목표',
      content: `<h3>학습 목표</h3>
<ul>
  <li>목표 1: </li>
  <li>목표 2: </li>
  <li>목표 3: </li>
</ul>`
    },
    {
      name: '참가 대상',
      content: `<h3>이런 분들께 추천합니다</h3>
<ul>
  <li>코딩 테스트를 준비하는 취준생</li>
  <li>알고리즘 실력을 향상시키고 싶은 개발자</li>
  <li>체계적으로 학습하고 싶은 분</li>
</ul>`
    }
  ];

  const applyTemplate = (templateContent: string) => {
    setContent(templateContent);
  };

  // 선택된 텍스트 감싸기
  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + (selectedText || '텍스트') + after;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + (selectedText || '텍스트').length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 커서 위치에 삽입
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + text + content.substring(start);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-richtext-form">
      <TemplateSelector
        onTemplateSelect={(templateType) => {
          console.log('RichTextSectionForm - onTemplateSelect prop 호출됨, templateType:', templateType);
          loadExampleData(templateType);
        }}
        onClear={handleClearTemplate}
      />

      <div className="study-management-richtext-form-group">
        <label>태그 헤더</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="스터디 소개"
          className="study-management-richtext-input"
        />
      </div>

      <div className="study-management-richtext-form-group">
        <label>에디터 모드</label>
        <div className="study-management-richtext-mode-selector">
          <button
            type="button"
            onClick={() => setEditorMode('visual')}
            className={`study-management-richtext-mode-btn ${editorMode === 'visual' ? 'active' : ''}`}
          >
            🎨 비주얼 에디터 (버튼으로 편집)
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('html')}
            className={`study-management-richtext-mode-btn ${editorMode === 'html' ? 'active' : ''}`}
          >
            📝 HTML 직접 입력
          </button>
        </div>
      </div>

      <div className="study-management-richtext-form-group">
        <label>템플릿 선택</label>
        <div className="study-management-richtext-template-buttons">
          {templates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyTemplate(template.content)}
              className="study-management-richtext-template-btn"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="study-management-richtext-form-group">
        <label>내용 {editorMode === 'html' ? '(HTML 직접 입력)' : '(비주얼 에디터)'} *</label>
        <div className="study-management-richtext-editor-wrapper">
          {editorMode === 'visual' && (
            <>
              {/* 제목 도구 */}
              <div className="study-management-richtext-toolbar">
                <span className="study-management-richtext-toolbar-label">제목:</span>
                <button type="button" onClick={() => insertAtCursor('<h2>큰 제목</h2>\n')} className="study-management-richtext-toolbar-btn">H2</button>
                <button type="button" onClick={() => insertAtCursor('<h3>중간 제목</h3>\n')} className="study-management-richtext-toolbar-btn">H3</button>
                <button type="button" onClick={() => insertAtCursor('<h4>작은 제목</h4>\n')} className="study-management-richtext-toolbar-btn">H4</button>
                <span className="study-management-richtext-toolbar-separator">|</span>
                <span className="study-management-richtext-toolbar-label">텍스트:</span>
                <button type="button" onClick={() => insertAtCursor('<p>단락</p>\n')} className="study-management-richtext-toolbar-btn">P</button>
                <button type="button" onClick={() => wrapSelection('<strong>', '</strong>')} className="study-management-richtext-toolbar-btn">B</button>
                <button type="button" onClick={() => wrapSelection('<em>', '</em>')} className="study-management-richtext-toolbar-btn">I</button>
                <button type="button" onClick={() => insertAtCursor('<br/>')} className="study-management-richtext-toolbar-btn">BR</button>
              </div>

              {/* 색상 하이라이트 도구 */}
              <div className="study-management-richtext-toolbar">
                <span className="study-management-richtext-toolbar-label">하이라이트:</span>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span style="color: rgb(195, 232, 141); font-weight: 600;">', '</span>')}
                  className="study-management-richtext-toolbar-btn study-management-richtext-color-btn"
                  style={{ color: '#c3e88d' }}
                >
                  초록강조
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span style="color: rgb(130, 170, 255); font-weight: 500;">', '</span>')}
                  className="study-management-richtext-toolbar-btn study-management-richtext-color-btn"
                  style={{ color: '#82aaff' }}
                >
                  파란강조
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span class="study-management-richtext-highlight">', '</span>')}
                  className="study-management-richtext-toolbar-btn study-management-richtext-color-btn"
                  style={{ color: '#ffea00' }}
                >
                  노란강조
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span class="study-management-richtext-text-highlight">', '</span>')}
                  className="study-management-richtext-toolbar-btn study-management-richtext-color-btn"
                  style={{ color: '#c3e88d' }}
                >
                  Hero강조
                </button>
              </div>

              {/* 리스트 도구 */}
              <div className="study-management-richtext-toolbar">
                <span className="study-management-richtext-toolbar-label">리스트:</span>
                <button type="button" onClick={() => insertAtCursor('<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ul>\n')} className="study-management-richtext-toolbar-btn">목록</button>
                <button type="button" onClick={() => insertAtCursor('<ol>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ol>\n')} className="study-management-richtext-toolbar-btn">순서목록</button>
                <button type="button" onClick={() => insertAtCursor('  <li>새 항목</li>\n')} className="study-management-richtext-toolbar-btn">항목추가</button>
              </div>

              {/* Hero 스타일 블록 */}
              <div className="study-management-richtext-toolbar">
                <span className="study-management-richtext-toolbar-label">Hero 블록:</span>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor(
                    '<div class="study-management-richtext-info-box">\n' +
                    '  <div class="study-management-richtext-info-header">섹션 제목</div>\n' +
                    '  <div class="study-management-richtext-info-content">\n' +
                    '    <p>내용을 입력하세요</p>\n' +
                    '  </div>\n' +
                    '</div>\n'
                  )}
                  className="study-management-richtext-toolbar-btn study-management-richtext-special-btn"
                >
                  정보박스
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor(
                    '<div class="study-management-richtext-info-item">\n' +
                    '  <span class="study-management-richtext-info-icon">📌</span>\n' +
                    '  <span class="study-management-richtext-info-text">아이콘과 텍스트</span>\n' +
                    '</div>\n'
                  )}
                  className="study-management-richtext-toolbar-btn study-management-richtext-special-btn"
                >
                  아이콘라인
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<blockquote>인용문</blockquote>\n')}
                  className="study-management-richtext-toolbar-btn"
                >
                  인용
                </button>
              </div>

              {/* 정렬 및 스타일 */}
              <div className="study-management-richtext-toolbar">
                <span className="study-management-richtext-toolbar-label">정렬:</span>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="text-align: left;">', '</div>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  왼쪽
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="text-align: center;">', '</div>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  가운데
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="text-align: right;">', '</div>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  오른쪽
                </button>
                <span className="study-management-richtext-toolbar-separator">|</span>
                <span className="study-management-richtext-toolbar-label">간격:</span>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="margin-top: 2rem;">', '</div>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  위간격
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="margin-bottom: 2rem;">', '</div>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  아래간격
                </button>
              </div>

              {/* 링크 및 미디어 */}
              <div className="study-management-richtext-toolbar">
                <span className="study-management-richtext-toolbar-label">미디어:</span>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<a href="URL주소">링크 텍스트</a>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  링크
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<img src="이미지URL" alt="설명" style="max-width: 100%;" />')}
                  className="study-management-richtext-toolbar-btn"
                >
                  이미지
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<code>코드</code>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  코드
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<pre><code>\n여러 줄\n코드 블록\n</code></pre>')}
                  className="study-management-richtext-toolbar-btn"
                >
                  코드블록
                </button>
              </div>
            </>
          )}
          
          {editorMode === 'html' && (
            <div className="study-management-richtext-html-notice">
              💡 HTML을 직접 입력하세요. 모든 HTML 태그와 스타일을 자유롭게 사용할 수 있습니다.
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={editorMode === 'html' 
              ? "HTML을 직접 입력하세요. 예: <h2>제목</h2>, <p>단락</p>, <div class='hero-info-box'>...</div>"
              : "위의 버튼을 사용하여 내용을 작성하거나, HTML을 직접 입력할 수도 있습니다."
            }
            className="study-management-richtext-textarea study-management-richtext-code-editor"
            rows={12}
            required
          />
        </div>
      </div>

      {/* 표준 테마로 고정됨 */}

      <div className="study-management-richtext-form-row">
        <div className="study-management-richtext-form-group">
          <label>텍스트 정렬</label>
          <select
            value={alignment}
            onChange={(e) => setAlignment(e.target.value as 'left' | 'center' | 'right')}
            className="study-management-richtext-select"
          >
            <option value="left">왼쪽 정렬</option>
            <option value="center">가운데 정렬</option>
            <option value="right">오른쪽 정렬</option>
          </select>
        </div>

        <div className="study-management-richtext-form-group">
          <label>배경 색상</label>
          <div className="study-management-richtext-color-wrapper">
            <input
              type="color"
              value={backgroundColor === '#0a0a0a' ? '#0a0a0a' : backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="study-management-richtext-color-picker"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="예: #0a0a0a, #121212"
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
            textAlign: alignment as any,
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {title && <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>{title}</h2>}
          <div dangerouslySetInnerHTML={{ __html: content || '<p style="color: rgba(255, 255, 255, 0.5);">내용을 입력하면 여기에 미리보기가 표시됩니다.</p>' }} />
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
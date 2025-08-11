import React, { useState, useRef } from 'react';
import './SectionForms.css';
import '../../sections/HeroSection.css'; // HeroSection 스타일 재사용

interface RichTextSectionFormProps {
  initialData?: {
    title?: string;
    content?: string;
    alignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    theme?: 'default' | 'tecoteco';
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
  const [content, setContent] = useState(initialData.content || '');
  const [alignment, setAlignment] = useState(initialData.alignment || 'left');
  const [backgroundColor, setBackgroundColor] = useState(initialData.backgroundColor || 'transparent');
  const [theme, setTheme] = useState(initialData.theme || 'default');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) {
      alert('내용은 필수 입력 항목입니다.');
      return;
    }

    onSave({
      title,
      content,
      alignment,
      backgroundColor,
      theme
    });
  };

  // TecoTeco 예시 데이터 - IntroSection 실제 내용
  const loadExampleData = () => {
    setTitle('TecoTeco 소개');
    setEditorMode('visual'); // 비주얼 모드로 전환
    setContent(`<h2 style="margin-bottom: 2rem;">변화하는 세상에서<br/>흔들리지 않을 '나'를 위한 스터디</h2>

<p>코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고, 개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?</p>

<p>TecoTeco는 이런 질문에서 출발했습니다. 기술이 아무리 발달해도 <span style="color: rgb(195, 232, 141); font-weight: 600;">변하지 않는 개발자의 핵심 역량</span>이 있다고 믿거든요.</p>

<h3 style="margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);">물고기를 잡는 방법을 익히는 것</h3>

<p>우리는 '물고기 그 자체'가 아닌, <span style="color: rgb(130, 170, 255); font-weight: 500;">'물고기를 잡는 방법'</span>에 집중합니다. 단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고 <span style="color: rgb(130, 170, 255); font-weight: 500;">견고한 사고력과 논리력</span>을 단련하는 것이 목표입니다.</p>

<p>매주 함께 모여 한 문제를 깊이 파고들고, 서로 다른 관점으로 접근해보며 사고의 폭을 넓혀갑니다. 왜 이 알고리즘을 선택했는지, 다른 방법은 없었는지, 이 문제에서 배울 수 있는 더 큰 인사이트는 무엇인지 함께 고민해요.</p>

<h3 style="margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);">물고기를 '잘' 잡는 방법을 모색하는 것</h3>

<p>AI를 배척하지 않고 <span style="color: rgb(130, 170, 255); font-weight: 500;">현명하게 활용하는 방법</span>을 함께 모색합니다. AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다. AI가 <span style="color: rgb(130, 170, 255); font-weight: 500;">우리의 통찰력을 확장시키는 강력한 파트너</span>가 될 수 있음을 증명해나가고 있어요.</p>

<div class="hero-info-box">
  <div class="info-section-header">💡 핵심 포인트</div>
  <div class="info-content-area">
    <div class="info-line-item">
      <span class="line-icon">📌</span>
      <span class="line-text">단순 암기가 아닌 <span class="highlight">사고력 향상</span></span>
    </div>
    <div class="info-line-item">
      <span class="line-icon">🎯</span>
      <span class="line-text">AI와의 <span class="highlight">협업 능력</span> 개발</span>
    </div>
    <div class="info-line-item">
      <span class="line-icon">🚀</span>
      <span class="line-text">변화에 흔들리지 않는 <span class="highlight">개발자 핵심 역량</span></span>
    </div>
  </div>
</div>

<p style="margin-top: 3rem; text-align: center; font-size: 1.1rem;">우리가 찾는 건 변화 속에서도 <span style="color: rgb(195, 232, 141); font-weight: 600;">흔들리지 않을 '나'</span><br/>생각하는 힘이에요.</p>`);
    setAlignment('left');
    setBackgroundColor('transparent');
    setTheme('tecoteco');
    
    // 사용자에게 안내 메시지
    alert('💡 TecoTeco 예시가 로드되었습니다!\n\n비주얼 에디터의 버튼들을 사용하여 이런 콘텐츠를 만들 수 있습니다.\nHTML 모드로 전환하면 코드를 직접 편집할 수도 있어요.');
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
    <form onSubmit={handleSubmit} className="section-form richtext-form">
      <div className="form-group">
        <label>섹션 제목 (선택)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 스터디를 통해 얻을 수 있는 것들"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>에디터 모드</label>
        <div className="editor-mode-selector">
          <button
            type="button"
            onClick={() => setEditorMode('visual')}
            className={`mode-btn ${editorMode === 'visual' ? 'active' : ''}`}
          >
            🎨 비주얼 에디터 (버튼으로 편집)
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('html')}
            className={`mode-btn ${editorMode === 'html' ? 'active' : ''}`}
          >
            📝 HTML 직접 입력
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>템플릿 선택</label>
        <div className="template-buttons">
          {templates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyTemplate(template.content)}
              className="template-btn"
            >
              {template.name}
            </button>
          ))}
          <button 
            type="button" 
            onClick={loadExampleData}
            className="template-btn example"
          >
            TecoTeco 예시
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>내용 {editorMode === 'html' ? '(HTML 직접 입력)' : '(비주얼 에디터)'} *</label>
        <div className="editor-wrapper">
          {editorMode === 'visual' && (
            <>
              {/* 제목 도구 */}
              <div className="editor-toolbar">
                <span className="toolbar-label">제목:</span>
                <button type="button" onClick={() => insertAtCursor('<h2>큰 제목</h2>\n')} className="toolbar-btn">H2</button>
                <button type="button" onClick={() => insertAtCursor('<h3>중간 제목</h3>\n')} className="toolbar-btn">H3</button>
                <button type="button" onClick={() => insertAtCursor('<h4>작은 제목</h4>\n')} className="toolbar-btn">H4</button>
                <span className="toolbar-separator">|</span>
                <span className="toolbar-label">텍스트:</span>
                <button type="button" onClick={() => insertAtCursor('<p>단락</p>\n')} className="toolbar-btn">P</button>
                <button type="button" onClick={() => wrapSelection('<strong>', '</strong>')} className="toolbar-btn">B</button>
                <button type="button" onClick={() => wrapSelection('<em>', '</em>')} className="toolbar-btn">I</button>
                <button type="button" onClick={() => insertAtCursor('<br/>')} className="toolbar-btn">BR</button>
              </div>

              {/* 색상 하이라이트 도구 */}
              <div className="editor-toolbar">
                <span className="toolbar-label">하이라이트:</span>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span style="color: rgb(195, 232, 141); font-weight: 600;">', '</span>')}
                  className="toolbar-btn color-btn"
                  style={{ color: '#c3e88d' }}
                >
                  초록강조
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span style="color: rgb(130, 170, 255); font-weight: 500;">', '</span>')}
                  className="toolbar-btn color-btn"
                  style={{ color: '#82aaff' }}
                >
                  파란강조
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span class="highlight">', '</span>')}
                  className="toolbar-btn color-btn"
                  style={{ color: '#ffea00' }}
                >
                  노란강조
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<span class="richtext-highlight">', '</span>')}
                  className="toolbar-btn color-btn"
                  style={{ color: '#c3e88d' }}
                >
                  Hero강조
                </button>
              </div>

              {/* 리스트 도구 */}
              <div className="editor-toolbar">
                <span className="toolbar-label">리스트:</span>
                <button type="button" onClick={() => insertAtCursor('<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ul>\n')} className="toolbar-btn">목록</button>
                <button type="button" onClick={() => insertAtCursor('<ol>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ol>\n')} className="toolbar-btn">순서목록</button>
                <button type="button" onClick={() => insertAtCursor('  <li>새 항목</li>\n')} className="toolbar-btn">항목추가</button>
              </div>

              {/* Hero 스타일 블록 */}
              <div className="editor-toolbar">
                <span className="toolbar-label">Hero 블록:</span>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor(
                    '<div class="hero-info-box">\n' +
                    '  <div class="info-section-header">섹션 제목</div>\n' +
                    '  <div class="info-content-area">\n' +
                    '    <p>내용을 입력하세요</p>\n' +
                    '  </div>\n' +
                    '</div>\n'
                  )}
                  className="toolbar-btn special-btn"
                >
                  정보박스
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor(
                    '<div class="info-line-item">\n' +
                    '  <span class="line-icon">📌</span>\n' +
                    '  <span class="line-text">아이콘과 텍스트</span>\n' +
                    '</div>\n'
                  )}
                  className="toolbar-btn special-btn"
                >
                  아이콘라인
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<blockquote>인용문</blockquote>\n')}
                  className="toolbar-btn"
                >
                  인용
                </button>
              </div>

              {/* 정렬 및 스타일 */}
              <div className="editor-toolbar">
                <span className="toolbar-label">정렬:</span>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="text-align: left;">', '</div>')}
                  className="toolbar-btn"
                >
                  왼쪽
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="text-align: center;">', '</div>')}
                  className="toolbar-btn"
                >
                  가운데
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="text-align: right;">', '</div>')}
                  className="toolbar-btn"
                >
                  오른쪽
                </button>
                <span className="toolbar-separator">|</span>
                <span className="toolbar-label">간격:</span>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="margin-top: 2rem;">', '</div>')}
                  className="toolbar-btn"
                >
                  위간격
                </button>
                <button 
                  type="button" 
                  onClick={() => wrapSelection('<div style="margin-bottom: 2rem;">', '</div>')}
                  className="toolbar-btn"
                >
                  아래간격
                </button>
              </div>

              {/* 링크 및 미디어 */}
              <div className="editor-toolbar">
                <span className="toolbar-label">미디어:</span>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<a href="URL주소">링크 텍스트</a>')}
                  className="toolbar-btn"
                >
                  링크
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<img src="이미지URL" alt="설명" style="max-width: 100%;" />')}
                  className="toolbar-btn"
                >
                  이미지
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<code>코드</code>')}
                  className="toolbar-btn"
                >
                  코드
                </button>
                <button 
                  type="button" 
                  onClick={() => insertAtCursor('<pre><code>\n여러 줄\n코드 블록\n</code></pre>')}
                  className="toolbar-btn"
                >
                  코드블록
                </button>
              </div>
            </>
          )}
          
          {editorMode === 'html' && (
            <div className="html-mode-notice">
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
            className="form-textarea code-editor"
            rows={12}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>테마 선택</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'default' | 'tecoteco')}
          className="form-select"
        >
          <option value="default">기본 테마</option>
          <option value="tecoteco">TecoTeco 테마 (어두운 배경)</option>
        </select>
        <p className="form-help-text">
          TecoTeco 테마를 선택하면 하드코딩된 페이지와 동일한 스타일이 적용됩니다.
        </p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>텍스트 정렬</label>
          <select
            value={alignment}
            onChange={(e) => setAlignment(e.target.value as 'left' | 'center' | 'right')}
            className="form-select"
          >
            <option value="left">왼쪽 정렬</option>
            <option value="center">가운데 정렬</option>
            <option value="right">오른쪽 정렬</option>
          </select>
        </div>

        <div className="form-group">
          <label>배경 색상 {theme === 'tecoteco' && '(TecoTeco 테마에서는 무시됨)'}</label>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="transparent 또는 #ffffff"
              className="form-input color-text"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>미리보기</label>
        <div 
          className="richtext-preview"
          style={{ 
            backgroundColor: backgroundColor === 'transparent' ? '#f5f5f5' : backgroundColor,
            textAlign: alignment as any,
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          {title && <h2 style={{ marginBottom: '20px' }}>{title}</h2>}
          <div dangerouslySetInnerHTML={{ __html: content || '<p style="color: #999;">내용을 입력하면 여기에 미리보기가 표시됩니다.</p>' }} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          취소
        </button>
        <button type="submit" className="save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default RichTextSectionForm;
import React, { useState } from 'react';
import './SectionForms.css';

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
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [alignment, setAlignment] = useState(initialData.alignment || 'left');
  const [backgroundColor, setBackgroundColor] = useState(initialData.backgroundColor || 'transparent');

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
      backgroundColor
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('스터디를 통해 얻을 수 있는 것들');
    setContent(`<h3>💡 체계적인 학습 경로</h3>
<p>혼자서는 막막한 알고리즘 학습, 검증된 커리큘럼과 단계별 학습으로 효율적으로 성장할 수 있습니다. 매주 새로운 주제를 깊이 있게 다루며, 이론과 실습을 균형있게 진행합니다.</p>

<h3>🤝 함께하는 동료</h3>
<p>같은 목표를 가진 동료들과 함께 학습하며 서로 동기부여가 되고, 막힐 때 도움을 주고받을 수 있습니다. 코드 리뷰를 통해 다양한 접근 방법을 배우고, 더 나은 코드를 작성하는 법을 익힙니다.</p>

<h3>📈 실력 향상</h3>
<ul>
  <li><strong>문제 해결 능력 향상:</strong> 다양한 알고리즘 문제를 풀며 사고력이 늘어납니다</li>
  <li><strong>코딩 테스트 대비:</strong> 실전과 같은 환경에서 연습하여 실제 시험에서도 당황하지 않습니다</li>
  <li><strong>시간 복잡도 분석:</strong> 효율적인 코드를 작성하는 능력을 기릅니다</li>
  <li><strong>자신감 상승:</strong> 체계적인 학습으로 코딩에 대한 자신감이 생깁니다</li>
</ul>

<h3>🎯 명확한 목표 달성</h3>
<p>12주라는 명확한 기간 동안 집중적으로 학습하여, 측정 가능한 성과를 얻을 수 있습니다. 많은 수료생들이 원하는 회사의 코딩 테스트를 통과하고, 개발자로서의 커리어를 시작했습니다.</p>

<blockquote>
  <p>"알고리즘은 단순한 코딩 테스트 통과 수단이 아닙니다. 논리적 사고력과 문제 해결 능력을 기르는 개발자의 기본기입니다."</p>
</blockquote>`);
    setAlignment('left');
    setBackgroundColor('transparent');
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
        <label>내용 (HTML 지원) *</label>
        <div className="editor-wrapper">
          <div className="editor-toolbar">
            <button type="button" onClick={() => setContent(content + '<h3>제목</h3>\n')} className="toolbar-btn">H3</button>
            <button type="button" onClick={() => setContent(content + '<p>단락</p>\n')} className="toolbar-btn">P</button>
            <button type="button" onClick={() => setContent(content + '<strong>굵게</strong>')} className="toolbar-btn">B</button>
            <button type="button" onClick={() => setContent(content + '<em>기울임</em>')} className="toolbar-btn">I</button>
            <button type="button" onClick={() => setContent(content + '<ul>\n  <li>항목</li>\n</ul>\n')} className="toolbar-btn">UL</button>
            <button type="button" onClick={() => setContent(content + '<ol>\n  <li>항목</li>\n</ol>\n')} className="toolbar-btn">OL</button>
            <button type="button" onClick={() => setContent(content + '<blockquote>인용</blockquote>\n')} className="toolbar-btn">Quote</button>
            <button type="button" onClick={() => setContent(content + '<a href="">링크</a>')} className="toolbar-btn">Link</button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="HTML 형식으로 내용을 입력하세요. 예: <p>단락</p>, <h3>제목</h3>, <ul><li>목록</li></ul>"
            className="form-textarea code-editor"
            rows={12}
            required
          />
        </div>
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
          <label>배경 색상</label>
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
import React, { useState } from 'react';

interface TemplateSelectorProps {
  onTemplateSelect: (templateType: string) => void;
  onClear: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  onClear
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = e.target.value;
    console.log('TemplateSelector - handleTemplateChange 호출됨');
    console.log('선택된 template:', template);
    setSelectedTemplate(template);
    if (template) {
      console.log('onTemplateSelect 호출 예정, template:', template);
      onTemplateSelect(template);
      console.log('onTemplateSelect 호출 완료');
    } else {
      console.log('template이 비어있어서 onTemplateSelect 호출 안함');
    }
  };

  const handleClearTemplate = () => {
    setSelectedTemplate('');
    onClear();
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '20px',
      gap: '8px'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))',
        border: '1px solid rgba(195, 232, 141, 0.3)',
        borderRadius: '6px'
      }}>
        <span style={{ fontSize: '16px' }}>✨</span>
        <select
          value={selectedTemplate}
          onChange={handleTemplateChange}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#C3E88D',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          <option value="" style={{ background: '#1a1f2e', color: 'rgba(255, 255, 255, 0.5)' }}>
            템플릿 선택...
          </option>
          <option value="algorithm" style={{ background: '#1a1f2e', color: '#C3E88D' }}>
            알고리즘 스터디
          </option>
          <option value="mogakup" style={{ background: '#1a1f2e', color: '#C3E88D' }}>
            모각업
          </option>
          <option value="bookStudy" style={{ background: '#1a1f2e', color: '#C3E88D' }}>
            북스터디
          </option>
          <option value="systemDesign" style={{ background: '#1a1f2e', color: '#C3E88D' }}>
            시스템 디자인
          </option>
        </select>
      </div>
      {selectedTemplate && (
        <button
          type="button"
          onClick={handleClearTemplate}
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 69, 58, 0.1)',
            border: '1px solid rgba(255, 69, 58, 0.3)',
            borderRadius: '6px',
            color: '#ff453a',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 69, 58, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 69, 58, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 69, 58, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 69, 58, 0.3)';
          }}
        >
          <span style={{ fontSize: '14px' }}>✕</span>
          초기화
        </button>
      )}
    </div>
  );
};

export default TemplateSelector;
import React, { useState } from 'react';
import './SectionForms.css';

interface CTASectionFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CTASectionForm: React.FC<CTASectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [subtitle, setSubtitle] = useState(initialData.subtitle || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || '지금 신청하기');
  const [buttonLink, setButtonLink] = useState(initialData.buttonLink || '#apply');
  const [backgroundColor, setBackgroundColor] = useState(initialData.backgroundColor || '#C3E88D');
  const [textColor, setTextColor] = useState(initialData.textColor || '#1a1a1a');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      alert('제목은 필수 입력 항목입니다.');
      return;
    }

    onSave({
      title,
      subtitle,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('지금이 바로 시작할 때입니다!');
    setSubtitle('12주 후, 완전히 달라진 당신의 코딩 실력을 만나보세요');
    setButtonText('지금 바로 신청하기');
    setButtonLink('#apply');
    setBackgroundColor('#C3E88D');
    setTextColor('#1a1a1a');
  };

  // 프리셋 색상 조합
  const colorPresets = [
    { bg: '#C3E88D', text: '#1a1a1a', name: '기본 (녹색)' },
    { bg: '#89DDFF', text: '#1a1a1a', name: '블루' },
    { bg: '#FF6B6B', text: '#ffffff', name: '레드' },
    { bg: '#FFD93D', text: '#1a1a1a', name: '옐로우' },
    { bg: '#A78BFA', text: '#ffffff', name: '퍼플' },
    { bg: '#1a1a1a', text: '#C3E88D', name: '다크' }
  ];

  const applyColorPreset = (bg: string, text: string) => {
    setBackgroundColor(bg);
    setTextColor(text);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form cta-form">
      <div className="form-group">
        <label>제목 (행동 유도 문구) *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 지금이 바로 시작할 때입니다!"
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>부제목</label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="예: 12주 후, 완전히 달라진 당신의 코딩 실력을 만나보세요"
          className="form-textarea"
          rows={2}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>버튼 텍스트</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="예: 지금 바로 신청하기"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>버튼 링크</label>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="예: #apply 또는 /study/apply"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label>색상 프리셋</label>
        <div className="color-presets">
          {colorPresets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyColorPreset(preset.bg, preset.text)}
              className="preset-btn"
              style={{ 
                backgroundColor: preset.bg, 
                color: preset.text,
                border: `2px solid ${preset.bg === backgroundColor ? '#ffffff' : 'transparent'}`
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>배경 색상</label>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#C3E88D"
              className="form-input color-text"
            />
          </div>
        </div>

        <div className="form-group">
          <label>텍스트 색상</label>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              placeholder="#1a1a1a"
              className="form-input color-text"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>미리보기</label>
        <div 
          className="cta-preview"
          style={{ 
            backgroundColor, 
            color: textColor,
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{title || '제목을 입력하세요'}</h2>
          {subtitle && <p style={{ margin: '0 0 20px 0', fontSize: '16px', opacity: 0.9 }}>{subtitle}</p>}
          <button 
            style={{ 
              backgroundColor: textColor,
              color: backgroundColor,
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {buttonText || '버튼 텍스트'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <button 
          type="button" 
          onClick={loadExampleData}
          className="example-btn"
        >
          예시 데이터 불러오기
        </button>
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

export default CTASectionForm;
import React, { useState } from 'react';
import './CTASectionForm.css';

interface CTASectionFormProps {
  initialData?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CTASectionForm: React.FC<CTASectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '함께하고 싶으신가요?');
  const [description, setDescription] = useState(initialData.description || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || '리더에게 연락하기');
  const [buttonUrl, setButtonUrl] = useState(initialData.buttonUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !buttonText) {
      alert('제목과 버튼 텍스트는 필수입니다.');
      return;
    }

    onSave({
      title,
      description,
      buttonText,
      buttonUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-cta-form">
      <div className="study-management-cta-form-group">
        <label>CTA 제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 함께 화이트보드 앞에서 만나요!"
          className="study-management-cta-input"
          required
        />
      </div>

      <div className="study-management-cta-form-group">
        <label>설명 (선택사항)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="추가 설명 텍스트"
          className="study-management-cta-textarea"
          rows={2}
        />
      </div>

      <div className="study-management-cta-form-group">
        <label>버튼 텍스트 *</label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="예: 리더에게 커피챗 요청하기 ☕"
          className="study-management-cta-input"
          required
        />
      </div>

      <div className="study-management-cta-form-group">
        <label>버튼 링크 URL <span style={{ color: '#89DDFF' }}>(권장)</span></label>
        <input
          type="text"
          value={buttonUrl}
          onChange={(e) => setButtonUrl(e.target.value)}
          placeholder="https://open.kakao.com/o/..."
          className="study-management-cta-input"
        />
        <span className="study-management-cta-help">
          💡 카카오톡 오픈채팅방 URL 또는 연락 페이지 링크를 입력하세요.
        </span>
      </div>

      <div className="study-management-cta-form-actions">
        <button type="button" onClick={onCancel} className="study-management-cta-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-cta-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default CTASectionForm;

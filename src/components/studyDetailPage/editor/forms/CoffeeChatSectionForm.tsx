import React, { useState } from 'react';
import './CoffeeChatSectionForm.css';

interface CoffeeChatSectionFormProps {
  initialData?: {
    title?: string;
    description?: string;
    buttonText?: string;
    kakaoOpenChatUrl?: string;
    tagHeader?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CoffeeChatSectionForm: React.FC<CoffeeChatSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '당신의 합류를 기다려요!');
  const [description, setDescription] = useState(initialData.description || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || '리더에게 커피챗 요청하기 ☕');
  const [kakaoOpenChatUrl, setKakaoOpenChatUrl] = useState(initialData.kakaoOpenChatUrl || '');
  const [tagHeader, setTagHeader] = useState(initialData.tagHeader || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kakaoOpenChatUrl.trim()) {
      alert('카카오톡 오픈채팅 URL은 필수 입력 항목입니다.');
      return;
    }

    onSave({
      title,
      description,
      buttonText,
      kakaoOpenChatUrl,
      tagHeader
    });
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-coffee-chat-form">
      <div className="study-management-coffee-chat-form-group">
        <label>태그 헤더 (선택사항)</label>
        <input
          type="text"
          value={tagHeader}
          onChange={(e) => setTagHeader(e.target.value)}
          placeholder="예: 함께해요"
          className="study-management-coffee-chat-input"
        />
      </div>

      <div className="study-management-coffee-chat-form-group">
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 당신의 합류를 기다려요!"
          className="study-management-coffee-chat-input"
        />
      </div>

      <div className="study-management-coffee-chat-form-group">
        <label>설명 (선택사항)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="추가 설명을 입력하세요"
          className="study-management-coffee-chat-textarea"
          rows={3}
        />
      </div>

      <div className="study-management-coffee-chat-form-group">
        <label>버튼 텍스트</label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="예: 리더에게 커피챗 요청하기 ☕"
          className="study-management-coffee-chat-input"
        />
      </div>

      <div className="study-management-coffee-chat-form-group">
        <label>카카오톡 오픈채팅 URL <span style={{ color: '#ff6b6b' }}>*</span></label>
        <input
          type="text"
          value={kakaoOpenChatUrl}
          onChange={(e) => setKakaoOpenChatUrl(e.target.value)}
          placeholder="https://open.kakao.com/o/g..."
          className="study-management-coffee-chat-input"
          required
        />
        <span className="study-management-coffee-chat-help">
          💡 카카오톡 오픈채팅방 URL을 입력해주세요. 버튼 클릭 시 이 링크로 이동합니다.
        </span>
      </div>

      <div className="study-management-coffee-chat-form-actions">
        <button type="button" onClick={onCancel} className="study-management-coffee-chat-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-coffee-chat-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default CoffeeChatSectionForm;

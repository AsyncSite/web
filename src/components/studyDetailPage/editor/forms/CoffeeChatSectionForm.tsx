import React, { useState } from 'react';
import './FAQSectionForm.css'; // 스타일 재사용
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';

interface CoffeeChatSectionFormProps {
  initialData?: {
    title?: string;
    tagHeader?: string;
    description?: string;
    buttonText?: string;
    kakaoOpenChatUrl?: string;
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
  const [tagHeader, setTagHeader] = useState(initialData.tagHeader || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || '리더에게 커피챗 요청하기 ☕');
  const [kakaoOpenChatUrl, setKakaoOpenChatUrl] = useState(initialData.kakaoOpenChatUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      title,
      tagHeader,
      description,
      buttonText,
      kakaoOpenChatUrl,
    });
  };

  const loadExampleData = (templateType: string) => {
    if (!templateType) return;

    let coffeeChatData;
    if (templateType === 'algorithm') {
      coffeeChatData = algorithmTemplate.sections.coffeeChat;
    } else if (templateType === 'mogakup') {
      coffeeChatData = mogakupTemplate.sections.coffeeChat;
    } else if (templateType === 'bookStudy') {
      coffeeChatData = bookStudyTemplate.sections.coffeeChat;
    } else {
      return;
    }

    if (!coffeeChatData) return;

    setTitle(coffeeChatData.title);
    setTagHeader(coffeeChatData.tagHeader || '');
    setDescription(coffeeChatData.description);
    setButtonText(coffeeChatData.buttonText);
    setKakaoOpenChatUrl(coffeeChatData.kakaoOpenChatUrl);
  };

  const handleClearTemplate = () => {
    setTitle(initialData?.title || '');
    setTagHeader(initialData?.tagHeader || '');
    setDescription(initialData?.description || '');
    setButtonText(initialData?.buttonText || '');
    setKakaoOpenChatUrl(initialData?.kakaoOpenChatUrl || '');
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-faq-form">
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <TemplateSelector
          onTemplateSelect={loadExampleData}
          onClear={handleClearTemplate}
        />
      </div>

      <div className="study-management-faq-form-group">
        <label>태그 헤더</label>
        <input
          type="text"
          value={tagHeader}
          onChange={(e) => setTagHeader(e.target.value)}
          placeholder="예: 참가 신청"
          className="study-management-faq-input"
        />
      </div>

      <div className="study-management-faq-form-group">
        <label>제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 당신의 합류를 기다려요!"
          className="study-management-faq-input"
          required
        />
      </div>

      <div className="study-management-faq-form-group">
        <label>설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 궁금한 점이 있으시다면 편하게 연락주세요."
          className="study-management-faq-textarea"
          rows={3}
        />
      </div>

      <div className="study-management-faq-form-group">
        <label>버튼 텍스트 *</label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="예: 리더에게 커피챗 요청하기 ☕"
          className="study-management-faq-input"
          required
        />
      </div>

      <div className="study-management-faq-form-group">
        <label>카카오톡 오픈채팅 URL <span style={{ color: '#89DDFF' }}>*</span></label>
        <input
          type="url"
          value={kakaoOpenChatUrl}
          onChange={(e) => setKakaoOpenChatUrl(e.target.value)}
          placeholder="https://open.kakao.com/o/g..."
          className="study-management-faq-input"
          required
        />
        <span className="study-management-faq-help">
          💡 카카오톡 오픈채팅방 URL을 입력해주세요. 버튼 클릭 시 이 링크로 이동합니다.
        </span>
      </div>

      <div className="study-management-faq-form-actions">
        <button type="button" onClick={onCancel} className="study-management-faq-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-faq-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default CoffeeChatSectionForm;

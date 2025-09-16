import React, { useState } from 'react';
import './FAQSectionForm.css';
import { algorithmTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionFormProps {
  initialData?: {
    title?: string;
    tagHeader?: string;
    faqs?: FAQItem[];
    items?: FAQItem[]; // FAQSection uses 'items' not 'faqs'
    showIcons?: boolean;
    showJoinCTA?: boolean;
    joinTitle?: string;
    joinDescription?: string;
    joinButtonText?: string;
    joinButtonAction?: string; // Deprecated
    kakaoOpenChatUrl?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const FAQSectionForm: React.FC<FAQSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '자주 묻는 질문');
  const [tagHeader, setTagHeader] = useState(initialData.tagHeader || '');
  const [showIcons, setShowIcons] = useState(initialData.showIcons || false);
  const [showJoinCTA, setShowJoinCTA] = useState(initialData.showJoinCTA || false);
  const [joinTitle, setJoinTitle] = useState(initialData.joinTitle || '당신의 합류를 기다려요!');
  const [joinDescription, setJoinDescription] = useState(initialData.joinDescription || '');
  const [joinButtonText, setJoinButtonText] = useState(initialData.joinButtonText || '리더에게 커피챗 요청하기 ☕');
  const [joinButtonAction, setJoinButtonAction] = useState(initialData.joinButtonAction || ''); // Deprecated
  const [kakaoOpenChatUrl, setKakaoOpenChatUrl] = useState(initialData.kakaoOpenChatUrl || '');
  const [faqs, setFaqs] = useState<FAQItem[]>(
    // FAQSection uses 'items' not 'faqs'
    initialData.items || initialData.faqs || [
      { question: '', answer: '', category: '' }
    ]
  );

  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '', category: '' }]);
  };

  const handleRemoveFAQ = (index: number) => {
    if (faqs.length > 1) {
      const newFaqs = faqs.filter((_, i) => i !== index);
      setFaqs(newFaqs);
    }
  };

  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty FAQs
    const validFaqs = faqs.filter(faq => faq.question && faq.answer);
    
    if (validFaqs.length === 0) {
      // Validation failed - at least one FAQ is required
      return;
    }

    onSave({
      title,
      tagHeader,
      showIcons,
      showJoinCTA,
      joinTitle,
      joinDescription,
      joinButtonText,
      joinButtonAction, // Deprecated but kept for backward compatibility
      kakaoOpenChatUrl,
      items: validFaqs, // FAQSection expects 'items' not 'faqs'
    });
  };

  // 일반 예시 데이터
  const loadExampleData = (templateType: string) => {
    if (!templateType) return;

    if (templateType === 'algorithm') {
    setTitle('자주 묻는 질문');
    setTagHeader('궁금증 해결');
    setFaqs([
      {
        question: '프로그래밍 초보자도 참여할 수 있나요?',
        answer: '네, 가능합니다! 기본적인 프로그래밍 문법만 알고 있다면 충분히 따라올 수 있도록 커리큘럼이 구성되어 있습니다. 처음에는 어렵게 느껴질 수 있지만, 함께 학습하며 성장할 수 있습니다.',
        category: '참가 자격'
      },
      {
        question: '스터디 시간에 참석하지 못하면 어떻게 되나요?',
        answer: '부득이한 사정으로 참석하지 못하는 경우, 스터디 자료와 녹화본(가능한 경우)을 제공합니다. 다만, 실시간 참여를 통한 토론과 피드백이 중요하므로 가급적 참석을 권장합니다.',
        category: '스터디 진행'
      },
      {
        question: '스터디 비용은 어떻게 되나요?',
        answer: '현재는 무료로 진행되고 있습니다. 다만, 스터디룸 대여나 특별 세션이 있을 경우 소정의 비용이 발생할 수 있으며, 이는 사전에 공지됩니다.',
        category: '비용'
      },
      {
        question: '사전 학습이 필요한가요?',
        answer: '특별한 사전 학습은 필요하지 않습니다. 다만, 사용하실 프로그래밍 언어의 기본 문법은 숙지하고 계시면 좋습니다. 스터디 시작 전 준비 자료를 제공할 예정입니다.',
        category: '준비사항'
      },
      {
        question: '수료 기준은 어떻게 되나요?',
        answer: '전체 세션의 80% 이상 참석하고, 주어진 과제를 성실히 수행하신 분들께 수료증을 발급해드립니다. 또한 우수 참가자에게는 별도의 혜택이 제공됩니다.',
        category: '수료'
      },
      {
        question: '스터디 후 네트워킹 기회가 있나요?',
        answer: '네, 스터디 종료 후에도 슬랙 채널을 통해 지속적으로 소통할 수 있으며, 정기적인 오프라인 모임도 계획하고 있습니다. 함께 성장하는 개발자 네트워크를 만들어갑니다.',
        category: '네트워킹'
      }
    ]);
    }
    // 추후 다른 템플릿 추가
    // else if (templateType === 'mogakko') { ... }
  };
  
  // Clear form and reset to initial state
  const handleClearTemplate = () => {
    setTitle(initialData?.title || '');
    setTagHeader(initialData?.tagHeader || '');
    setShowIcons(initialData?.showIcons !== false);
    setShowJoinCTA(initialData?.showJoinCTA || false);
    setJoinTitle(initialData?.joinTitle || '');
    setJoinDescription(initialData?.joinDescription || '');
    setJoinButtonText(initialData?.joinButtonText || '');
    setKakaoOpenChatUrl(initialData?.kakaoOpenChatUrl || '');
    setFaqs(initialData?.items || []);
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-faq-form">
      {/* 예시 데이터 버튼 - 우측 정렬 */}
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
          placeholder="예: 궁금증 해결"
          className="study-management-faq-input"
        />
      </div>
      
      <div className="study-management-faq-form-group">
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 자주 묻는 질문"
          className="study-management-faq-input"
        />
      </div>
      
      <div className="study-management-faq-form-group">
        <label>
          <input
            type="checkbox"
            checked={showIcons}
            onChange={(e) => setShowIcons(e.target.checked)}
          />
          Q/A 아이콘 표시
        </label>
      </div>

      <div className="study-management-faq-form-group">
        <div className="study-management-faq-group-header">
          <label>FAQ 목록</label>
        </div>
        
        <div className="study-management-faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="study-management-faq-item">
              <div className="study-management-faq-item-header">
                <h4>FAQ {index + 1}</h4>
                {faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFAQ(index)}
                    className="study-management-faq-remove-button"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="study-management-faq-item-fields">
                <div className="study-management-faq-field">
                  <label>카테고리</label>
                  <input
                    type="text"
                    value={faq.category}
                    onChange={(e) => handleFAQChange(index, 'category', e.target.value)}
                    placeholder="예: 참가 자격"
                    className="study-management-faq-input"
                  />
                </div>
                
                <div className="study-management-faq-field">
                  <label>질문 *</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                    placeholder="예: 프로그래밍 초보자도 참여할 수 있나요?"
                    className="study-management-faq-input"
                    required
                  />
                </div>
                
                <div className="study-management-faq-field">
                  <label>답변 *</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                    placeholder="예: 네, 가능합니다! 기본적인 프로그래밍 문법만..."
                    className="study-management-faq-textarea"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={handleAddFAQ}
          className="study-management-faq-add-button"
        >
          + FAQ 추가
        </button>
      </div>
      
      <div className="study-management-faq-form-group">
        <label className="study-management-faq-checkbox-label">
          <input
            type="checkbox"
            checked={showJoinCTA}
            onChange={(e) => setShowJoinCTA(e.target.checked)}
            className="study-management-faq-checkbox"
          />
          <span className="study-management-faq-checkbox-text">Join CTA 블록 표시</span>
        </label>
      </div>
      
      {showJoinCTA && (
        <>
          <div className="study-management-faq-form-group">
            <label>Join CTA 제목</label>
            <input
              type="text"
              value={joinTitle}
              onChange={(e) => setJoinTitle(e.target.value)}
              placeholder="예: 당신의 합류를 기다려요!"
              className="study-management-faq-input"
            />
          </div>
          
          <div className="study-management-faq-form-group">
            <label>Join CTA 설명 (선택사항)</label>
            <textarea
              value={joinDescription}
              onChange={(e) => setJoinDescription(e.target.value)}
              placeholder="추가 설명 텍스트"
              className="study-management-faq-textarea"
              rows={2}
            />
          </div>
          
          <div className="study-management-faq-form-group">
            <label>버튼 텍스트</label>
            <input
              type="text"
              value={joinButtonText}
              onChange={(e) => setJoinButtonText(e.target.value)}
              placeholder="예: 리더에게 커피챗 요청하기 ☕"
              className="study-management-faq-input"
            />
          </div>

          <div className="study-management-faq-form-group">
            <label>카카오톡 오픈채팅 URL <span style={{ color: '#89DDFF' }}>(필수)</span></label>
            <input
              type="text"
              value={kakaoOpenChatUrl}
              onChange={(e) => setKakaoOpenChatUrl(e.target.value)}
              placeholder="https://open.kakao.com/o/g..."
              className="study-management-faq-input"
            />
            <span className="study-management-faq-help">
              💡 카카오톡 오픈채팅방 URL을 입력해주세요. 버튼 클릭 시 이 링크로 이동합니다.
            </span>
          </div>
        </>
      )}

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

export default FAQSectionForm;
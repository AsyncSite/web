import React, { useState } from 'react';
import './FAQSectionForm.css';
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate } from '../templateData';
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
      items: validFaqs, // FAQSection expects 'items' not 'faqs'
    });
  };

  // 일반 예시 데이터
  const loadExampleData = (templateType: string) => {
    if (!templateType) return;

    let faqData;
    if (templateType === 'algorithm') {
      faqData = algorithmTemplate.sections.faq;
    } else if (templateType === 'mogakup') {
      faqData = mogakupTemplate.sections.faq;
    } else if (templateType === 'bookStudy') {
      faqData = bookStudyTemplate.sections.faq;
    } else {
      return;
    }

    if (!faqData) return;

    setTitle(faqData.title);
    setTagHeader(faqData.tagHeader);
    setFaqs(faqData.items);
    setShowIcons(faqData.showIcons || false);
  };
  
  // Clear form and reset to initial state
  const handleClearTemplate = () => {
    setTitle(initialData?.title || '');
    setTagHeader(initialData?.tagHeader || '');
    setShowIcons(initialData?.showIcons !== false);
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
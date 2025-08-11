import React, { useState } from 'react';
import RichTextDisplay from '../../common/RichTextDisplay';
import './FAQSection.css';

interface FAQSectionProps {
  data: {
    items: Array<{
      question: string;
      answer: string;
      id?: number | string;
    }>;
    title?: string;
    tagHeader?: string;
    theme?: 'default' | 'tecoteco' | 'modern';
    showIcons?: boolean; // Q/A 아이콘 표시 여부
    // Join CTA 블록 (TecoTeco 테마용)
    showJoinCTA?: boolean;
    joinTitle?: string;
    joinDescription?: string;
    joinButtonText?: string;
    joinButtonAction?: string;
  };
}

const FAQSection: React.FC<FAQSectionProps> = ({ data }) => {
  const { 
    items = [], 
    title = '자주 묻는 질문',
    tagHeader,
    theme = 'default',
    showIcons = false,
    showJoinCTA = false,
    joinTitle = 'TecoTeco, 당신의 합류를 기다려요!',
    joinDescription = '',
    joinButtonText = '@renechoi에게 커피챗 요청하기 ☕',
    joinButtonAction = '@renechoi에게 커피챗 요청!'
  } = data;
  
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  if (items.length === 0) {
    return null;
  }
  
  // TecoTeco 테마일 때는 다른 클래스명과 구조 사용
  if (theme === 'tecoteco') {
    return (
      <section className="tecoteco-faq-join-section">
        {tagHeader && <div className="section-tag-header">{tagHeader}</div>}
        {title && <h2 className="section-title">{title}</h2>}
        
        <div className="tecoteco-faq-items">
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className={`tecoteco-faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <div
                className="tecoteco-faq-question"
                onClick={() => handleToggle(index)}
                role="button"
                aria-expanded={openIndex === index}
              >
                {showIcons && <span className="tecoteco-faq-icon">Q.</span>}
                <span className="tecoteco-faq-question-text">{item.question}</span>
                <span className="tecoteco-faq-toggle-icon">{openIndex === index ? '▲' : '▼'}</span>
              </div>
              {openIndex === index && (
                <div className="tecoteco-faq-answer">
                  {showIcons && <span className="tecoteco-faq-icon">A.</span>}
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {showJoinCTA && (
          <div className="join-cta-block">
            <h3 className="join-cta-title">{joinTitle}</h3>
            {joinDescription && <p className="join-description">{joinDescription}</p>}
            <button 
              className="join-contact-button" 
              onClick={() => alert(joinButtonAction)}
            >
              {joinButtonText}
            </button>
          </div>
        )}
      </section>
    );
  }
  
  // 기본 스타일
  return (
    <div className={`study-detail-faq-section ${theme}-theme`}>
      <div className="faq-container">
        {tagHeader && <div className="faq-tag-header">{tagHeader}</div>}
        {title && <h2 className="faq-title">{title}</h2>}
        
        <div className="faq-list">
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => handleToggle(index)}
              >
                {showIcons && <span className="faq-q-icon">Q.</span>}
                <span className="faq-question-text">{item.question}</span>
                <span className="faq-toggle-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              
              {openIndex === index && (
                <div className="faq-answer">
                  {showIcons && <span className="faq-a-icon">A.</span>}
                  <div className="faq-answer-text">
                    <RichTextDisplay content={item.answer} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
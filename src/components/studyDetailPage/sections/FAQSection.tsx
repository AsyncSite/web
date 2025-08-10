import React, { useState } from 'react';
import RichTextDisplay from '../../common/RichTextDisplay';
import './FAQSection.css';

interface FAQSectionProps {
  data: {
    items: Array<{
      question: string;
      answer: string;
    }>;
    title?: string;
  };
}

const FAQSection: React.FC<FAQSectionProps> = ({ data }) => {
  const { items = [], title = '자주 묻는 질문' } = data;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  if (items.length === 0) {
    return null;
  }
  
  return (
    <div className="study-detail-faq-section">
      <div className="faq-container">
        {title && <h2 className="faq-title">{title}</h2>}
        
        <div className="faq-list">
          {items.map((item, index) => (
            <div 
              key={index}
              className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => handleToggle(index)}
              >
                <span>{item.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              
              {openIndex === index && (
                <div className="faq-answer">
                  <RichTextDisplay content={item.answer} />
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
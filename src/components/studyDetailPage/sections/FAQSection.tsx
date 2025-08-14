import React, { useState } from 'react';
import RichTextDisplay from '../../common/RichTextDisplay';
import styles from './FAQSection.module.css';

interface FAQSectionProps {
  data: {
    items: Array<{
      question: string;
      answer: string;
      id?: number | string;
    }>;
    title?: string;
    tagHeader?: string;
    // theme removed - using standard styles
    showIcons?: boolean; // Q/A 아이콘 표시 여부
    // Join CTA 블록 (표준 스타일)
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
    showIcons = false,
    showJoinCTA = false,
    joinTitle = '당신의 합류를 기다려요!',
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
  
  return (
    <section className={styles.studyDetailFaqSection}>
        {tagHeader && <div className={styles.sectionTagHeader}>{tagHeader}</div>}
        {title && <h2 className={styles.sectionTitle}>{title}</h2>}
        
        <div className={styles.faqItems}>
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
            >
              <div
                className={styles.faqQuestion}
                onClick={() => handleToggle(index)}
                role="button"
                aria-expanded={openIndex === index}
              >
                {showIcons && <span className={styles.faqIcon}>Q.</span>}
                <span className={styles.faqQuestionText}>{item.question}</span>
                <span className={styles.faqToggleIcon}>{openIndex === index ? '▲' : '▼'}</span>
              </div>
              {openIndex === index && (
                <div className={styles.faqAnswer}>
                  {showIcons && <span className={styles.faqIcon}>A.</span>}
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {showJoinCTA && (
          <div className={styles.joinCtaBlock}>
            <h3 className={styles.joinCtaTitle}>{joinTitle}</h3>
            {joinDescription && <p className={styles.joinDescription}>{joinDescription}</p>}
            <button 
              className={styles.joinContactButton} 
              onClick={() => alert(joinButtonAction)}
            >
              {joinButtonText}
            </button>
          </div>
        )}
    </section>
  );
};

export default FAQSection;
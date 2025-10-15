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
    showIcons?: boolean; // Q/A 아이콘 표시 여부
  };
}

const FAQSection: React.FC<FAQSectionProps> = ({ data }) => {
  const {
    items = [],
    title = '자주 묻는 질문',
    tagHeader,
    showIcons = false
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
                  <p style={{whiteSpace: "break-spaces"}}>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
    </section>
  );
};

export default FAQSection;
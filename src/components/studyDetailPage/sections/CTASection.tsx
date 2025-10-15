import React from 'react';
import styles from './CTASection.module.css';

interface CTASectionProps {
  data: {
    title: string;
    description?: string;
    buttonText: string;
    buttonUrl?: string; // 카카오톡 오픈채팅 URL 또는 다른 URL
  };
}

const CTASection: React.FC<CTASectionProps> = ({ data }) => {
  const {
    title = '함께하고 싶으신가요?',
    description = '',
    buttonText = '리더에게 연락하기',
    buttonUrl = ''
  } = data;

  const handleButtonClick = () => {
    if (buttonUrl) {
      window.open(buttonUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaContainer}>
        <h3 className={styles.ctaTitle}>{title}</h3>
        {description && <p className={styles.ctaDescription}>{description}</p>}
        <button
          className={styles.ctaButton}
          onClick={handleButtonClick}
          disabled={!buttonUrl}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CTASection;

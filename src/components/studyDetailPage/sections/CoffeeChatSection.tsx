import React from 'react';
import styles from './CoffeeChatSection.module.css';

interface CoffeeChatSectionProps {
  data: {
    title?: string;
    tagHeader?: string;
    description?: string;
    buttonText?: string;
    kakaoOpenChatUrl?: string;
  };
}

const CoffeeChatSection: React.FC<CoffeeChatSectionProps> = ({ data }) => {
  const {
    title = '당신의 합류를 기다려요!',
    tagHeader,
    description = '',
    buttonText = '리더에게 커피챗 요청하기 ☕',
    kakaoOpenChatUrl = ''
  } = data;

  const handleButtonClick = () => {
    if (kakaoOpenChatUrl) {
      window.open(kakaoOpenChatUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('카카오톡 오픈채팅 링크가 설정되지 않았습니다.');
    }
  };

  return (
    <section className={styles.coffeeChatSection}>
      {tagHeader && <div className={styles.sectionTagHeader}>{tagHeader}</div>}
      <div className={styles.coffeeChatContainer}>
        <h2 className={styles.coffeeChatTitle}>{title}</h2>
        {description && <p className={styles.coffeeChatDescription}>{description}</p>}
        <button
          className={styles.coffeeChatButton}
          onClick={handleButtonClick}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CoffeeChatSection;

import React from 'react';
import styles from './CoffeeChatSection.module.css';

interface CoffeeChatSectionProps {
  data: {
    title?: string;
    description?: string;
    buttonText?: string;
    kakaoOpenChatUrl?: string;
    tagHeader?: string;
  };
}

const CoffeeChatSection: React.FC<CoffeeChatSectionProps> = ({ data }) => {
  const {
    title = '당신의 합류를 기다려요!',
    description = '',
    buttonText = '리더에게 커피챗 요청하기 ☕',
    kakaoOpenChatUrl = '',
    tagHeader
  } = data;

  return (
    <section className={styles.coffeeChatSection}>
      {tagHeader && <div className={styles.sectionTagHeader}>{tagHeader}</div>}
      <div className={styles.coffeeChatBlock}>
        <h3 className={styles.coffeeChatTitle}>{title}</h3>
        {description && <p className={styles.coffeeChatDescription}>{description}</p>}
        <button
          className={styles.coffeeChatButton}
          onClick={() => {
            if (kakaoOpenChatUrl) {
              window.open(kakaoOpenChatUrl, '_blank', 'noopener,noreferrer');
            } else {
              alert('카카오톡 오픈채팅 URL이 설정되지 않았습니다.');
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CoffeeChatSection;

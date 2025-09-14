import React from 'react';
import styles from './DocuMentor.module.css';

interface Props {
  isAuthenticated: boolean;
  user: any;
}

function HeroSection({ isAuthenticated, user }: Props): React.ReactNode {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.logo}>도큐멘토 ✏️</h1>
        <p className={styles.tagline}>AI가 당신의 글쓰기 친구가 되어드려요!</p>
        
        {/* Event Banner */}
        <div className={styles.eventBanner}>
          <span className={styles.eventEmoji}>🎉</span>
          <span className={styles.eventText}>9월 31일까지 무제한 무료!</span>
          <span className={styles.eventEmoji}>🎉</span>
        </div>
        
        {isAuthenticated && user && (
          <div className={styles.greeting}>
            {getGreeting()}, {user.name || user.username}님! 👋
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroSection;
import React from 'react';
import styles from './DocuMentor.module.css';

function CommunitySection(): React.ReactNode {
  return (
    <div className={styles.ctaSection}>
      <div className={styles.ctaContent}>
        <h4 className={styles.ctaTitle}>
          <span className={styles.ctaEmoji}>💬</span>
          도큐멘토 사용자 커뮤니티
        </h4>
        <p className={styles.ctaDescription}>
          다른 사용자들과 글쓰기 팁을 공유하고, 도큐멘토 활용법을 배워보세요!
        </p>
        <a 
          href="https://open.kakao.com/o/gXXXXXXX" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.kakaoButton}
        >
          <span className={styles.kakaoIcon}>💬</span>
          카카오톡 오픈채팅 참여하기
        </a>
        <p className={styles.ctaNote}>
          💡 200명이 넘는 작가님들이 함께 성장하고 있어요!
        </p>
      </div>
    </div>
  );
}

export default CommunitySection;
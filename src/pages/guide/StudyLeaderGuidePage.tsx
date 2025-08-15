import React from 'react';
import styles from './StudyLeaderGuidePage.module.css';

const StudyLeaderGuidePage: React.FC = () => {
  return (
    <div className={styles.guidePage}>
      <div className={styles.guideHero}>
        <h1 className={styles.guideTitle}>스터디 리더 가이드</h1>
        <p className={styles.guideSubtitle}>리더를 위한 운영 가이드와 도구 모음</p>
      </div>

      <div className={styles.guideContent}>
        <div className={`${styles.guideCard} ${styles.comingSoon}`}>
          <div className={styles.guideCardIcon}>👑</div>
          <h3 className={styles.guideCardTitle}>준비 중입니다</h3>
          <p className={styles.guideCardDescription}>
            더 나은 경험을 위해 콘텐츠를 제작 중입니다. 곧 공개됩니다!
          </p>
          <span className={styles.guideBadge}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default StudyLeaderGuidePage;

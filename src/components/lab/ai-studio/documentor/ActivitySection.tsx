import React, { useState, useEffect } from 'react';
import { getRandomActivity, ActivityData } from './mockActivityData';
import styles from './ActivitySection.module.css';

function ActivitySection(): React.ReactNode {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 통계 데이터 (하드코딩)
  const todayCount = Math.floor(127 + Math.random() * 50); // 127-177 랜덤
  const currentUsers = Math.floor(12 + Math.random() * 8); // 12-20 랜덤
  
  // 초기 활동 3개 설정
  useEffect(() => {
    const initialActivities: ActivityData[] = [];
    const usedIds = new Set<number>();
    
    for (let i = 0; i < 3; i++) {
      let activity = getRandomActivity();
      while (usedIds.has(activity.id)) {
        activity = getRandomActivity();
      }
      usedIds.add(activity.id);
      initialActivities.push(activity);
    }
    
    setActivities(initialActivities);
  }, []);
  
  // 5초마다 새로운 활동 추가
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setActivities(prev => {
          const newActivity = getRandomActivity();
          // 맨 앞에 새 활동 추가, 마지막 제거
          return [newActivity, ...prev.slice(0, 2)];
        });
        setIsAnimating(false);
      }, 300);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className={styles.activitySection}>
      <div className={styles.container}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <span className={styles.liveIndicator}>
              <span className={styles.liveDot}></span>
              LIVE
            </span>
            <h2 className={styles.title}>지금 이 순간, 도큐멘토와 함께</h2>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{todayCount}</span>
              <span className={styles.statLabel}>오늘 사용</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{currentUsers}</span>
              <span className={styles.statLabel}>지금 작성 중</span>
            </div>
          </div>
        </div>
        
        {/* 활동 리스트 */}
        <div className={styles.activitiesContainer}>
          <div className={`${styles.activitiesList} ${isAnimating ? styles.animating : ''}`}>
            {activities.map((activity, index) => (
              <div 
                key={`${activity.id}-${index}`}
                className={`${styles.activityCard} ${index === 0 ? styles.newest : ''}`}
              >
                <div className={styles.activityEmoji}>{activity.emoji}</div>
                
                <div className={styles.activityContent}>
                  <div className={styles.activityHeader}>
                    <span className={styles.activityUser}>{activity.user}</span>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                  
                  <div className={styles.activityAction}>
                    {activity.action}
                  </div>
                  
                  <div className={styles.activityResult}>
                    ✨ {activity.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 하단 메시지 */}
        <div className={styles.bottomMessage}>
          <span className={styles.pulse}>🔥</span>
          <span>실제 사용자들의 실시간 활동입니다</span>
        </div>
      </div>
    </section>
  );
}

export default ActivitySection;
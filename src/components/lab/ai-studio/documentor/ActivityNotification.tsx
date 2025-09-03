import React, { useState, useEffect, useCallback } from 'react';
import { getRandomActivity, getTimeText, ActivityData } from './mockActivityData';
import styles from './ActivityNotification.module.css';

interface Props {
  isEnabled?: boolean;
}

function ActivityNotification({ isEnabled = true }: Props): React.ReactNode {
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [queue, setQueue] = useState<ActivityData[]>([]);
  
  // 사용된 활동 ID 추적 (중복 방지)
  const [recentIds, setRecentIds] = useState<Set<number>>(new Set());

  // 새로운 활동 가져오기
  const getNextActivity = useCallback(() => {
    let activity = getRandomActivity();
    let attempts = 0;
    
    // 최근에 표시된 활동은 제외
    while (recentIds.has(activity.id) && attempts < 10) {
      activity = getRandomActivity();
      attempts++;
    }
    
    // 시간 텍스트 랜덤화
    activity = { ...activity, time: getTimeText() };
    
    // 최근 ID 업데이트 (최대 5개 유지)
    setRecentIds(prev => {
      const newSet = new Set(prev);
      newSet.add(activity.id);
      if (newSet.size > 5) {
        const firstId = newSet.values().next().value;
        if (firstId !== undefined) {
          newSet.delete(firstId);
        }
      }
      return newSet;
    });
    
    return activity;
  }, [recentIds]);

  // 알림 표시 사이클
  useEffect(() => {
    if (!isEnabled) return;

    // 초기 딜레이 (3초 후 첫 알림)
    const initialTimer = setTimeout(() => {
      const activity = getNextActivity();
      setCurrentActivity(activity);
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(initialTimer);
  }, [isEnabled, getNextActivity]);

  // 알림 자동 순환
  useEffect(() => {
    if (!isEnabled || !currentActivity) return;

    // 7초 후 사라지기
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 7000);

    // 8초 후 다음 알림 준비
    const nextTimer = setTimeout(() => {
      const activity = getNextActivity();
      setCurrentActivity(activity);
      setIsVisible(true);
    }, 8000 + Math.random() * 4000); // 8-12초 랜덤 간격

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentActivity, isEnabled, getNextActivity]);

  // 닫기 버튼 핸들러
  const handleClose = () => {
    setIsVisible(false);
    // 2초 후 다음 알림
    setTimeout(() => {
      const activity = getNextActivity();
      setCurrentActivity(activity);
      setIsVisible(true);
    }, 2000);
  };

  if (!isEnabled || !currentActivity) return null;

  return (
    <div className={styles.notificationContainer}>
      <div className={`${styles.notification} ${isVisible ? styles.show : ''}`}>
        <div className={styles.iconWrapper}>
          <span className={styles.emoji}>{currentActivity.emoji}</span>
        </div>
        
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.user}>{currentActivity.user}</span>
            <span className={styles.time}>{currentActivity.time}</span>
          </div>
          
          <div className={styles.action}>
            {currentActivity.action}
          </div>
          
          <div className={styles.result}>
            ✨ {currentActivity.result}
          </div>
        </div>

        <button 
          className={styles.closeButton} 
          onClick={handleClose}
          aria-label="알림 닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default ActivityNotification;
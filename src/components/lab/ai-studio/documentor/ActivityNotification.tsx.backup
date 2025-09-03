import React, { useState, useEffect } from 'react';
import styles from './ActivityNotification.module.css';

interface Activity {
  user: string;
  action: string;
  time: string;
  emoji: string;
}

const activities: Activity[] = [
  { user: 'k***@gmail.com', action: '님의 블로그 글이 분석되었어요', time: '방금 전', emoji: '📝' },
  { user: 's***@naver.com', action: '님이 리뷰 결과를 받았어요', time: '1분 전', emoji: '✨' },
  { user: 'min***@daum.net', action: '님의 글 분석이 완료됐어요', time: '3분 전', emoji: '📖' },
  { user: 'j***@company.co.kr', action: '님이 피드백을 받았어요', time: '방금', emoji: '💼' },
  { user: 'hello***@gmail.com', action: '님의 자소서가 검토되었어요', time: '2분 전', emoji: '📑' },
  { user: 'dev***@naver.com', action: '님이 문체 분석을 받았어요', time: '6분 전', emoji: '📧' },
  { user: 'writer***@gmail.com', action: '님의 콘텐츠가 분석됐어요', time: '4분 전', emoji: '✍️' },
  { user: 'park***@hanmail.net', action: '님이 글쓰기 피드백을 받았어요', time: '방금 전', emoji: '🎯' },
  { user: 'marketing***@corp.com', action: '님의 카피가 분석됐어요', time: '7분 전', emoji: '📊' },
  { user: 'blog***@naver.com', action: '님이 리뷰를 받았어요', time: '5분 전', emoji: '🌟' },
  { user: 'contact***@gmail.com', action: '님의 글이 검토되었어요', time: '방금', emoji: '📌' },
  { user: 'test***@outlook.com', action: '님이 분석 결과를 받았어요', time: '8분 전', emoji: '📈' },
];

function ActivityNotification(): React.ReactNode {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activityHistory, setActivityHistory] = useState<number[]>([]);

  useEffect(() => {
    const showNotification = () => {
      // 최근 3개와 겹치지 않게 선택
      let availableIndices = activities.map((_, i) => i).filter(
        i => !activityHistory.slice(-3).includes(i)
      );
      
      if (availableIndices.length === 0) {
        availableIndices = activities.map((_, i) => i);
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      
      setActivityHistory(prev => [...prev.slice(-3), randomIndex]);
      setCurrentActivity(activities[randomIndex]);
      setIsVisible(true);

      // 8초 후 사라짐 (더 여유있게)
      setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    };

    // 첫 알림은 6-12초 사이 랜덤
    const firstTimeout = setTimeout(() => {
      showNotification();
    }, 6000 + Math.random() * 6000);

    // 이후 12-30초 사이 랜덤 간격
    const interval = setInterval(() => {
      showNotification();
    }, 12000 + Math.random() * 18000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [activityHistory]);

  if (!currentActivity) return null;

  return (
    <div className={`${styles.notificationContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.notification}>
        <div className={styles.avatarCircle}>
          <span className={styles.emoji}>{currentActivity.emoji}</span>
        </div>
        <div className={styles.content}>
          <div className={styles.message}>
            <strong>{currentActivity.user}</strong>
            {currentActivity.action}
          </div>
          <div className={styles.time}>{currentActivity.time}</div>
        </div>
        <div className={styles.closeButton} onClick={() => setIsVisible(false)}>×</div>
      </div>
    </div>
  );
}

export default ActivityNotification;
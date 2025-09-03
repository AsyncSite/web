import React, { useState, useEffect } from 'react';
import styles from './MiniActivityToast.module.css';

const activities = [
  { text: '방금 누군가 블로그 글 리뷰를 받았어요', emoji: '📝' },
  { text: '2분 전 자소서가 개선되었어요', emoji: '✨' },
  { text: '방금 마케팅 카피가 분석되었어요', emoji: '📊' },
  { text: '1분 전 논문 초고 검토가 완료됐어요', emoji: '📚' },
  { text: '방금 이메일 문체가 개선되었어요', emoji: '✉️' },
  { text: '3분 전 프레젠테이션 스크립트 분석 완료', emoji: '🎯' },
  { text: '방금 뉴스레터가 더 매력적으로 변했어요', emoji: '📰' },
  { text: '2분 전 제품 설명이 개선되었어요', emoji: '💡' },
];

function MiniActivityToast(): React.ReactNode {
  const [currentActivity, setCurrentActivity] = useState<typeof activities[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastIndex, setLastIndex] = useState(-1);
  
  useEffect(() => {
    const showNotification = () => {
      // 이전과 다른 랜덤 액티비티 선택
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * activities.length);
      } while (newIndex === lastIndex && activities.length > 1);
      
      setLastIndex(newIndex);
      setCurrentActivity(activities[newIndex]);
      setIsVisible(true);
      
      // 3초 후 사라짐
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };
    
    // 초기 실행
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 2000); // 페이지 로드 2초 후 첫 알림
    
    // 반복 실행 (5-8초 랜덤 간격)
    const interval = setInterval(() => {
      if (!isVisible) {
        showNotification();
      }
    }, 5000 + Math.random() * 3000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isVisible, lastIndex]);
  
  if (!currentActivity || !isVisible) return null;
  
  return (
    <div className={`${styles.toastContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.toast}>
        <span className={styles.emoji}>{currentActivity.emoji}</span>
        <span className={styles.text}>{currentActivity.text}</span>
      </div>
    </div>
  );
}

export default MiniActivityToast;
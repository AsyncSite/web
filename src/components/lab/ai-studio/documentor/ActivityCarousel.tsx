import React, { useState, useEffect, useRef } from 'react';
import { ActivityData, MOCK_ACTIVITIES } from './mockActivityData';
import styles from './ActivityCarousel.module.css';

function ActivityCarousel(): React.ReactNode {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 두 배로 늘려서 무한 스크롤 효과
  const doubledActivities = [...MOCK_ACTIVITIES, ...MOCK_ACTIVITIES];
  
  useEffect(() => {
    if (!scrollRef.current || isPaused) return;
    
    const scrollContainer = scrollRef.current;
    let scrollPos = 0;
    
    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollPos += 0.5; // 스크롤 속도
        
        // 첫 번째 세트가 끝나면 처음으로 리셋
        if (scrollPos >= scrollContainer.scrollWidth / 2) {
          scrollPos = 0;
        }
        
        scrollContainer.scrollLeft = scrollPos;
      }
    };
    
    const intervalId = setInterval(scroll, 20); // 20ms마다 실행으로 부드럽게
    
    return () => clearInterval(intervalId);
  }, [isPaused]);
  
  return (
    <div className={styles.carouselSection}>
      <div className={styles.container}>
        {/* 헤더 - 심플하게 */}
        <div className={styles.header}>
          <h2 className={styles.title}>최근 도큐멘토 활동</h2>
          <p className={styles.subtitle}>
            다양한 분야의 글쓰기가 도큐멘토와 함께 개선되고 있어요
          </p>
        </div>
        
        {/* 캐러셀 */}
        <div className={styles.carouselWrapper}>
          <div className={styles.fadeLeft}></div>
          <div className={styles.fadeRight}></div>
          
          <div 
            ref={scrollRef}
            className={styles.carouselTrack}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {doubledActivities.map((activity, index) => (
              <div 
                key={`${activity.id}-${index}`}
                className={styles.activityItem}
              >
                <div className={styles.itemHeader}>
                  <span className={styles.emoji}>{activity.emoji}</span>
                  <span className={styles.user}>{activity.user}</span>
                </div>
                
                <div className={styles.itemContent}>
                  <div className={styles.action}>{activity.action}</div>
                  <div className={styles.divider}>→</div>
                  <div className={styles.result}>{activity.result}</div>
                </div>
                
                <div className={styles.itemFooter}>
                  <span className={styles.time}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default ActivityCarousel;
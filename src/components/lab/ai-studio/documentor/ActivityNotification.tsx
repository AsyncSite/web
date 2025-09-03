import React, { useState, useEffect } from 'react';
import styles from './ActivityNotification.module.css';

interface Activity {
  user: string;
  action: string;
  time: string;
  emoji: string;
  reviewType: 'overall' | 'category' | 'strength' | 'growth' | 'detailed';
  reviewContent: string;
  score?: number;
}

const activities: Activity[] = [
  // 전체 평가
  { 
    user: 'k***@gmail.com', 
    action: '님의 블로그 글이 분석되었어요', 
    time: '1시간 전', 
    emoji: '📝',
    reviewType: 'overall',
    reviewContent: '전반적으로 잘 쓰셨어요! 👏 몇 가지만 보완하면 완벽한 글이 될 거예요'
  },
  
  // 카테고리별 점수
  { 
    user: 's***@naver.com', 
    action: '님이 리뷰 결과를 받았어요', 
    time: '30분 전', 
    emoji: '✨',
    reviewType: 'category',
    reviewContent: '가독성 3점! 문단이 조금 길어요. 나누면 더 술술 읽힐 거예요',
    score: 3
  },
  
  // 강점
  { 
    user: 'm***@gmail.com', 
    action: '님의 글 분석이 완료됐어요', 
    time: '2시간 전', 
    emoji: '📖',
    reviewType: 'strength',
    reviewContent: '도입부가 매력적이고 흥미로워요! 예시가 구체적이라 이해가 쉬워요'
  },
  
  // 개선점
  { 
    user: 'j***@naver.com', 
    action: '님이 피드백을 받았어요', 
    time: '45분 전', 
    emoji: '💼',
    reviewType: 'growth',
    reviewContent: '긴 문단을 2-3개로 나누고, 소제목을 추가하면 더 좋겠어요'
  },
  
  // 상세 리뷰
  { 
    user: 'h***@gmail.com', 
    action: '님의 자소서가 검토되었어요', 
    time: '1시간 30분 전', 
    emoji: '📑',
    reviewType: 'detailed',
    reviewContent: '첫 문단이 자연스럽고 친근해요! 다만 본문 전환이 조금 급작스러워요'
  },
  
  // 카테고리별 점수 (제목)
  { 
    user: 'd***@naver.com', 
    action: '님이 문체 분석을 받았어요', 
    time: '3시간 전', 
    emoji: '📧',
    reviewType: 'category',
    reviewContent: '제목 매력도 4점! 클릭하고 싶은 제목이에요. 조금만 더 구체적이면 완벽할 거예요',
    score: 4
  },
  
  // 강점 (감정 전달)
  { 
    user: 'w***@gmail.com', 
    action: '님의 콘텐츠가 분석됐어요', 
    time: '1시간 15분 전', 
    emoji: '✍️',
    reviewType: 'strength',
    reviewContent: '진정성이 느껴져요! 친근한 어투로 거리감이 없어요'
  },
  
  // 개선점 (구조)
  { 
    user: 'p***@naver.com', 
    action: '님이 글쓰기 피드백을 받았어요', 
    time: '2시간 30분 전', 
    emoji: '🎯',
    reviewType: 'growth',
    reviewContent: '전체적인 흐름은 좋아요! 소제목을 추가하면 더 좋겠어요'
  },
  
  // 카테고리별 점수 (첫인상)
  { 
    user: 'm***@a****.com', 
    action: '님이 카피가 분석됐어요', 
    time: '4시간 전', 
    emoji: '📊',
    reviewType: 'category',
    reviewContent: '첫인상 5점! 도입부가 재밌어서 계속 읽고 싶어져요',
    score: 5
  },
  
  // 상세 리뷰 (마무리)
  { 
    user: 'b***@gmail.com', 
    action: '님이 리뷰를 받았어요', 
    time: '1시간 45분 전', 
    emoji: '🌟',
    reviewType: 'detailed',
    reviewContent: '마무리가 조금 아쉬워요. 독자에게 생각할 거리를 던져주면 어떨까요?'
  },
  
  // 강점 (예시)
  { 
    user: 'c***@naver.com', 
    action: '님의 글이 검토되었어요', 
    time: '2시간 15분 전', 
    emoji: '📌',
    reviewType: 'strength',
    reviewContent: '예시가 구체적이라 이해가 쉬워요! 개인적인 경험이 설득력을 높여줬어요'
  },
  
  // 개선점 (참여 유도)
  { 
    user: 't***@h****.com', 
    action: '님이 분석 결과를 받았어요', 
    time: '3시간 30분 전', 
    emoji: '📈',
    reviewType: 'growth',
    reviewContent: '마무리에 독자 참여 유도 문구를 넣어보세요. 댓글 참여도 유도할 수 있을 거예요'
  },

  // 추가 다양한 조합들
  
  // 브런치 에세이
  { 
    user: 'l***@gmail.com', 
    action: '님의 브런치 에세이가 분석되었어요', 
    time: '25분 전', 
    emoji: '📚',
    reviewType: 'overall',
    reviewContent: '감동적인 에세이네요! 🥺 개인적 경험이 잘 녹아들어 있어요'
  },
  
  // 티스토리 블로그
  { 
    user: 'n***@naver.com', 
    action: '님의 티스토리 글이 검토되었어요', 
    time: '1시간 20분 전', 
    emoji: '🌿',
    reviewType: 'category',
    reviewContent: '구조/흐름 4점! 논리적이지만 중간에 예시를 더 넣으면 좋겠어요',
    score: 4
  },
  
  // 인스타그램 캡션
  { 
    user: 'r***@gmail.com', 
    action: '님의 인스타그램 캡션이 분석됐어요', 
    time: '15분 전', 
    emoji: '📸',
    reviewType: 'strength',
    reviewContent: '해시태그 활용이 완벽해요! 📱 도달률이 높을 것 같아요'
  },
  
  // 유튜브 스크립트
  { 
    user: 'q***@naver.com', 
    action: '님의 유튜브 스크립트가 리뷰되었어요', 
    time: '2시간 45분 전', 
    emoji: '🎬',
    reviewType: 'detailed',
    reviewContent: '말하기 톤이 자연스러워요! 다만 도입부가 조금 길어요'
  },
  
  // 회사 보고서
  { 
    user: 'u***@c****.com', 
    action: '님의 보고서가 검토되었어요', 
    time: '3시간 15분 전', 
    emoji: '📊',
    reviewType: 'category',
    reviewContent: '논리성 5점! 데이터 분석이 탄탄해요. 결론 부분만 강화하면 완벽해요',
    score: 5
  },
  
  // 자기소개서
  { 
    user: 'v***@gmail.com', 
    action: '님의 자기소개서가 분석되었어요', 
    time: '50분 전', 
    emoji: '💼',
    reviewType: 'strength',
    reviewContent: '임팩트 있는 경험이 잘 드러나요! 구체적인 수치가 인상적이에요'
  },
  
  // 학술 논문
  { 
    user: 'x***@a****.com', 
    action: '님의 논문 초록이 검토되었어요', 
    time: '4시간 20분 전', 
    emoji: '🎓',
    reviewType: 'growth',
    reviewContent: '학술적 톤은 좋아요! 다만 일반인도 이해할 수 있게 조금 더 쉽게 써보세요'
  },
  
  // 마케팅 카피
  { 
    user: 'y***@naver.com', 
    action: '님의 광고 카피가 분석되었어요', 
    time: '1시간 5분 전', 
    emoji: '🛍️',
    reviewType: 'category',
    reviewContent: '감정 어필 4점! 구매 욕구를 자극하는 문구가 좋아요',
    score: 4
  },
  
  // 웹소설
  { 
    user: 'z***@gmail.com', 
    action: '님의 웹소설이 리뷰되었어요', 
    time: '2시간 50분 전', 
    emoji: '🗡️',
    reviewType: 'detailed',
    reviewContent: '몰입감 있는 설정이 좋아요! 캐릭터 대화를 더 자연스럽게 해보세요'
  },
  
  // 링크드인 프로필
  { 
    user: 'a***@l****.com', 
    action: '님의 프로필이 검토되었어요', 
    time: '35분 전', 
    emoji: '💼',
    reviewType: 'strength',
    reviewContent: '키워드 최적화가 완벽해요! 검색 노출이 많이 될 것 같아요'
  },
  
  // 이메일 템플릿
  { 
    user: 'e***@naver.com', 
    action: '님의 이메일이 분석되었어요', 
    time: '1시간 10분 전', 
    emoji: '📧',
    reviewType: 'growth',
    reviewContent: '전문적인 톤이 좋아요! 다만 인사말을 조금 더 따뜻하게 해보세요'
  },
  
  // 프레젠테이션
  { 
    user: 'f***@gmail.com', 
    action: '님의 발표 자료가 리뷰되었어요', 
    time: '3시간 5분 전', 
    emoji: '📈',
    reviewType: 'category',
    reviewContent: '구조화 5점! 핵심 메시지가 명확해요. 시각적 요소만 보강하면 완벽해요',
    score: 5
  },
  
  // 쇼핑몰 상품 설명
  { 
    user: 'g***@naver.com', 
    action: '님의 상품 설명이 분석되었어요', 
    time: '20분 전', 
    emoji: '🛒',
    reviewType: 'strength',
    reviewContent: '상품 특징이 잘 드러나요! 고객 관점에서 쓴 게 인상적이에요'
  },
  
  // 뉴스레터
  { 
    user: 'i***@n****.com', 
    action: '님의 뉴스레터가 검토되었어요', 
    time: '1시간 35분 전', 
    emoji: '📰',
    reviewType: 'detailed',
    reviewContent: '정보 전달이 명확해요! 다만 독자 참여를 유도하는 질문을 추가해보세요'
  },
  
  // SNS 광고
  { 
    user: 'o***@gmail.com', 
    action: '님의 SNS 광고가 분석되었어요', 
    time: '40분 전', 
    emoji: '📱',
    reviewType: 'category',
    reviewContent: '클릭률 예상 4점! 호기심을 자극하는 제목이 좋아요',
    score: 4
  },
  
  // 기술 블로그
  { 
    user: 'w***@t****.com', 
    action: '님의 기술 블로그가 리뷰되었어요', 
    time: '2시간 25분 전', 
    emoji: '💻',
    reviewType: 'growth',
    reviewContent: '기술적 내용이 정확해요! 초보자도 이해할 수 있게 예시를 더 넣어보세요'
  },
  
  // 여행 후기
  { 
    user: 's***@naver.com', 
    action: '님의 여행 후기가 분석되었어요', 
    time: '1시간 50분 전', 
    emoji: '✈️',
    reviewType: 'strength',
    reviewContent: '생생한 경험이 잘 전달돼요! 사진과 함께 보면 더 좋을 것 같아요'
  },
  
  // 요리 레시피
  { 
    user: 'c***@gmail.com', 
    action: '님의 레시피가 검토되었어요', 
    time: '55분 전', 
    emoji: '🍳',
    reviewType: 'detailed',
    reviewContent: '단계별 설명이 자세해요! 다만 조리 시간을 더 정확하게 표기해보세요'
  },
  
  // 운동 루틴
  { 
    user: 'h***@f****.com', 
    action: '님의 운동 가이드가 분석되었어요', 
    time: '3시간 40분 전', 
    emoji: '💪',
    reviewType: 'category',
    reviewContent: '안전성 고려 5점! 초보자도 따라하기 쉬워요',
    score: 5
  },
  
  // 투자 관련 글
  { 
    user: 'j***@naver.com', 
    action: '님의 투자 글이 리뷰되었어요', 
    time: '1시간 25분 전', 
    emoji: '📈',
    reviewType: 'growth',
    reviewContent: '정보가 유용해요! 다만 투자 위험성도 함께 언급해보세요'
  },
  
  // 육아 일기
  { 
    user: 'k***@gmail.com', 
    action: '님의 육아 일기가 분석되었어요', 
    time: '2시간 10분 전', 
    emoji: '👶',
    reviewType: 'strength',
    reviewContent: '진솔한 육아 경험이 좋아요! 다른 부모님들에게 도움이 될 것 같아요'
  },
  
  // 독서 후기
  { 
    user: 'l***@b****.com', 
    action: '님의 독서 후기가 검토되었어요', 
    time: '4시간 10분 전', 
    emoji: '📖',
    reviewType: 'detailed',
    reviewContent: '책의 핵심을 잘 파악했어요! 개인적 소감을 조금 더 넣어보세요'
  },
  
  // 게임 리뷰
  { 
    user: 'm***@naver.com', 
    action: '님의 게임 리뷰가 분석되었어요', 
    time: '30분 전', 
    emoji: '🎮',
    reviewType: 'category',
    reviewContent: '객관적 평가 4점! 장단점이 균형있게 잘 정리됐어요',
    score: 4
  },
  
  // 반려동물 일기
  { 
    user: 'n***@gmail.com', 
    action: '님의 반려동물 일기가 리뷰되었어요', 
    time: '1시간 40분 전', 
    emoji: '🐕',
    reviewType: 'strength',
    reviewContent: '사랑스러운 일상이 잘 담겨있어요! 🥰 독자들이 따뜻해질 것 같아요'
  },
  
  // 취미 공유
  { 
    user: 'o***@h****.com', 
    action: '님의 취미 글이 분석되었어요', 
    time: '2시간 35분 전', 
    emoji: '🎨',
    reviewType: 'growth',
    reviewContent: '취미에 대한 열정이 느껴져요! 초보자를 위한 팁을 더 추가해보세요'
  },
  
  // 건강 정보
  { 
    user: 'p***@naver.com', 
    action: '님의 건강 정보가 검토되었어요', 
    time: '3시간 25분 전', 
    emoji: '🏥',
    reviewType: 'detailed',
    reviewContent: '의학적 정보가 정확해요! 다만 전문의 상담을 권한다는 문구를 추가해보세요'
  },
  
  // 환경 관련 글
  { 
    user: 'q***@gmail.com', 
    action: '님의 환경 글을 분석했어요', 
    time: '45분 전', 
    emoji: '🌱',
    reviewType: 'strength',
    reviewContent: '환경 의식이 잘 드러나요! 실천 가능한 방법들이 좋아요'
  },
  
  // 문화 리뷰
  { 
    user: 'r***@c****.com', 
    action: '님의 문화 리뷰가 리뷰되었어요', 
    time: '1시간 15분 전', 
    emoji: '🎭',
    reviewType: 'category',
    reviewContent: '예술적 감상 5점! 작품에 대한 깊이 있는 이해가 인상적이에요',
    score: 5
  }
];

function ActivityNotification(): React.ReactNode {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activityHistory, setActivityHistory] = useState<number[]>([]);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const showNotification = () => {
      // 이미 표시 중이거나 전환 중이면 무시
      if (isVisible || isTransitioning) {
        return;
      }

      // 이전 타이머 정리
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }

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
      setIsTransitioning(true);
      setIsVisible(true);

      // 8초 후 사라짐
      const timeout = setTimeout(() => {
        setIsVisible(false);
        // CSS transition 완료 후 전환 상태 해제
        setTimeout(() => {
          setIsTransitioning(false);
        }, 600); // CSS transition 시간과 맞춤
      }, 8000);
      
      setHideTimeout(timeout);
    };

    // 첫 알림은 3-6초 사이 랜덤 (더 빠르게)
    const firstTimeout = setTimeout(() => {
      showNotification();
    }, 3000 + Math.random() * 3000);

    // 이후 8-18초 사이 랜덤 간격 (더 빠르게)
    const interval = setInterval(() => {
      showNotification();
    }, 8000 + Math.random() * 10000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

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
          {/* 구체적인 리뷰 내용 추가 */}
          <div className={styles.reviewContent}>
            {currentActivity.reviewContent}
          </div>
          <div className={styles.time}>{currentActivity.time}</div>
        </div>
        <div className={styles.closeButton} onClick={() => {
          // 수동 닫기 시 타이머도 정리
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            setHideTimeout(null);
          }
          setIsVisible(false);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 600);
        }}>×</div>
      </div>
    </div>
  );
}

export default ActivityNotification;

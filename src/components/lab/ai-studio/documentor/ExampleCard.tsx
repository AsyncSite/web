import React from 'react';
import styles from './DocuMentor.module.css';

function ExampleCard(): React.ReactNode {
  return (
    <div className={styles.exampleSection}>
      <h3 className={styles.exampleTitle}>이렇게 리뷰해드려요 📝</h3>
      
      <div className={styles.exampleCard}>
        <div className={styles.scoreCircle}>78점</div>
        
        <div className={styles.feedbackSection}>
          <h4 className={styles.feedbackTitle}>
            <span>😊</span> 잘하신 점
          </h4>
          <div className={styles.feedbackItem}>
            ✨ 도입부가 재밌어서 계속 읽고 싶어져요!
          </div>
          <div className={styles.feedbackItem}>
            ✨ 예시가 구체적이라 이해가 쉬워요
          </div>
        </div>
        
        <div className={styles.feedbackSection}>
          <h4 className={styles.feedbackTitle}>
            <span>🛠️</span> 개선하면 좋을 점
          </h4>
          <div className={styles.feedbackItem}>
            💭 3번째 문단이 너무 길어요. 나누면 읽기 편할 것 같아요
          </div>
          <div className={styles.feedbackItem}>
            💭 전문용어를 쉽게 풀어서 설명해주세요
          </div>
          <div className={styles.feedbackItem}>
            💭 마무리가 조금 허전해요. 정리를 추가하면 어떨까요?
          </div>
        </div>
        
        <div className={styles.feedbackSection}>
          <h4 className={styles.feedbackTitle}>
            <span>💡</span> 이렇게 해보세요
          </h4>
          <div className={styles.feedbackItem}>
            🎯 중간에 소제목 2-3개를 넣어보세요
          </div>
          <div className={styles.feedbackItem}>
            🎯 마지막에 "이 글이 도움이 되셨나요?" 같은 질문을 추가해보세요
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExampleCard;
import React from 'react';
import StarRating from './StarRating';
import styles from './DocuMentor.module.css';

function ExampleCard(): React.ReactNode {
  const ratings = [
    { label: '제목 매력도', rating: 4, comment: '클릭하고 싶은 제목이에요! 조금만 더 구체적이면 완벽할 거예요' },
    { label: '첫인상', rating: 5, comment: '도입부가 재밌어서 계속 읽고 싶어져요!' },
    { label: '가독성', rating: 3, comment: '문단이 조금 길어요. 나누면 더 술술 읽힐 거예요' },
    { label: '구조/흐름', rating: 4, comment: '전체적인 흐름은 좋아요! 소제목을 추가하면 더 좋겠어요' },
    { label: '감정 전달', rating: 4, comment: '진정성이 느껴져요. 마무리를 조금 더 강화하면 어떨까요?' }
  ];

  return (
    <div className={styles.exampleSection}>
      <h3 className={styles.exampleTitle}>이렇게 리뷰해드려요 ✨</h3>
      
      <div className={styles.exampleCard}>
        {/* Overall Assessment */}
        <div className={styles.overallRating}>
          <h4 className={styles.overallTitle}>전반적으로 잘 쓰셨어요! 👏</h4>
          <p className={styles.overallDesc}>
            몇 가지만 보완하면 정말 완벽한 글이 될 거예요
          </p>
        </div>

        {/* Category Ratings */}
        <div className={styles.ratingsContainer}>
          {ratings.map((item, index) => (
            <StarRating 
              key={index}
              label={item.label}
              rating={item.rating}
              comment={item.comment}
            />
          ))}
        </div>
        
        {/* Key Strengths */}
        <div className={styles.feedbackSection}>
          <h4 className={styles.feedbackTitle}>
            <span>💪</span> 특히 잘하신 부분
          </h4>
          <div className={styles.feedbackItem}>
            ✨ 도입부가 매력적이고 흥미로워요
          </div>
          <div className={styles.feedbackItem}>
            ✨ 예시가 구체적이라 이해가 쉬워요
          </div>
          <div className={styles.feedbackItem}>
            ✨ 진정성 있는 톤이 좋아요
          </div>
        </div>
        
        {/* Growth Opportunities */}
        <div className={styles.feedbackSection}>
          <h4 className={styles.feedbackTitle}>
            <span>🌱</span> 성장 포인트
          </h4>
          <div className={styles.feedbackItem}>
            📍 긴 문단을 2-3개로 나누어보세요
          </div>
          <div className={styles.feedbackItem}>
            📍 중간에 소제목을 추가해보세요
          </div>
          <div className={styles.feedbackItem}>
            📍 마무리에 독자 참여 유도 문구를 넣어보세요
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExampleCard;
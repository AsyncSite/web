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

        {/* Detailed Review */}
        <div className={styles.detailedReview}>
          <h4 className={styles.detailedReviewTitle}>
            <span>🔍</span> 상세 리뷰
          </h4>
          <div className={styles.detailedReviewContent}>
            <div className={styles.reviewParagraph}>
              <strong>첫 문단</strong>의 "요즘 날씨가 정말 좋네요"라는 도입부가 자연스럽고 친근해서 좋았어요. 
              독자와의 거리를 좁히는 훌륭한 시작입니다. 다만 본문으로 넘어가는 전환이 조금 급작스러운 느낌이 있어요.
            </div>
            <div className={styles.reviewParagraph}>
              <strong>중간 부분</strong>에서 개인적인 경험을 예시로 든 것이 설득력을 높여줬어요. 
              "제가 작년에 겪었던 일인데..."로 시작하는 부분이 특히 인상적이었습니다. 
              하지만 이 부분이 300자가 넘어서 호흡이 길어요. 2-3개 문단으로 나누면 더 읽기 편할 거예요.
            </div>
            <div className={styles.reviewParagraph}>
              <strong>마무리</strong>가 조금 아쉬워요. "그래서 결론은..." 같은 직접적인 표현보다는 
              자연스럽게 정리하면서 독자에게 생각할 거리를 던져주면 어떨까요? 
              예를 들어 "여러분은 어떻게 생각하시나요?" 같은 질문으로 끝내면 댓글 참여도 유도할 수 있을 거예요.
            </div>
            <div className={styles.reviewHighlight}>
              💡 <strong>핵심 조언:</strong> 전체적으로 좋은 글이지만, 문단 분리와 소제목 활용으로 가독성을 높이면 
              독자들이 끝까지 집중해서 읽을 수 있을 거예요!
            </div>
          </div>
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
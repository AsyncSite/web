import React from 'react';
import styles from './DocuMentor.module.css';

function UserReviews(): React.ReactNode {
  const reviews = [
    {
      name: '김민수',
      role: '블로거',
      content: '도큐멘토 덕분에 블로그 조회수가 3배나 늘었어요! 특히 제목 개선 제안이 정말 도움됐습니다.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: '이서연',
      role: '마케터',
      content: '구체적인 피드백이 인상적이에요. 어디를 어떻게 고쳐야 할지 명확하게 알려줘서 좋았습니다.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: '박준호',
      role: '프리랜서',
      content: '클라이언트에게 보낼 글을 검토받는 용도로 사용 중이에요. 문체와 톤 분석이 특히 유용해요!',
      rating: 4,
      avatar: '🧑‍💻'
    },
    {
      name: '최지원',
      role: '대학생',
      content: '과제나 자소서 쓸 때 정말 유용해요. AI가 놓치기 쉬운 부분까지 꼼꼼히 체크해줍니다.',
      rating: 5,
      avatar: '👩‍🎓'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
        {i < rating ? '⭐' : '☆'}
      </span>
    ));
  };

  return (
    <div className={styles.userReviewsSection}>
      <h3 className={styles.userReviewsTitle}>실제 사용자들의 이야기 💬</h3>
      
      <div className={styles.reviewsGrid}>
        {reviews.map((review, index) => (
          <div key={index} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewerAvatar}>{review.avatar}</span>
                <div>
                  <div className={styles.reviewerName}>{review.name}</div>
                  <div className={styles.reviewerRole}>{review.role}</div>
                </div>
              </div>
              <div className={styles.reviewRating}>
                {renderStars(review.rating)}
              </div>
            </div>
            <p className={styles.reviewContent}>
              "{review.content}"
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h4 className={styles.ctaTitle}>
            <span className={styles.ctaEmoji}>💬</span>
            도큐멘토 사용자 커뮤니티
          </h4>
          <p className={styles.ctaDescription}>
            다른 사용자들과 글쓰기 팁을 공유하고, 도큐멘토 활용법을 배워보세요!
          </p>
          <a 
            href="https://open.kakao.com/o/gXXXXXXX" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.kakaoButton}
          >
            <span className={styles.kakaoIcon}>💬</span>
            카카오톡 오픈채팅 참여하기
          </a>
          <p className={styles.ctaNote}>
            💡 200명이 넘는 작가님들이 함께 성장하고 있어요!
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserReviews;
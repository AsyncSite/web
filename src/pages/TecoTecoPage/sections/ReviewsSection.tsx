// src/pages/TecoTecoPage/sections/ReviewsSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { tecotecoKeywords, tecotecoReviews } from '../utils/constants';
import { Review } from '../utils/types';
import './ReviewsSection.css';

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="tecoteco-review-card">
    <div className="tecoteco-review-header">
      <span className="tecoteco-reviewer-name">{review.name}</span>
      <span className="tecoteco-review-meta">
        모임에 {review.attendCount}회 참석하고 작성한 후기예요. {review.timeAgo}
      </span>
    </div>
    <h4 className="tecoteco-review-title">{review.title}</h4>
    <p className="tecoteco-review-content">{review.content}</p>
    <div className="tecoteco-review-footer">
      <div className="tecoteco-review-emojis">
        {review.emojis.map((emoji, idx) => (
          <span key={idx}>{emoji}</span>
        ))}
      </div>
      <span className="tecoteco-review-likes">🧡 {review.likes}</span>
    </div>
  </div>
);

export const ReviewsSection: React.FC = () => {
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3); // 초기 3개만 표시
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const sectionRef = useRef<HTMLElement>(null);

  const handleViewMore = () => {
    setIsLoading(true);

    // 자연스러운 로딩 효과를 위한 딜레이
    setTimeout(() => {
      const nextCount = Math.min(visibleReviewsCount + 5, tecotecoReviews.length);
      setVisibleReviewsCount(nextCount);
      setIsLoading(false);
    }, 500);
  };

  // 새로운 리뷰가 로드되면 스크롤을 새로운 리뷰 위치로 부드럽게 이동
  useEffect(() => {
    if (visibleReviewsCount > 3 && sectionRef.current) {
      const newReviewsStartIndex = visibleReviewsCount - 5;
      const reviewCards = sectionRef.current.querySelectorAll('.tecoteco-review-card');
      const targetCard = reviewCards[Math.max(newReviewsStartIndex, 3)];

      if (targetCard) {
        setTimeout(() => {
          targetCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    }
  }, [visibleReviewsCount]);

  const hasMoreReviews = visibleReviewsCount < tecotecoReviews.length;
  const remainingReviews = tecotecoReviews.length - visibleReviewsCount;

  return (
    <section className="tecoteco-reviews-section" ref={sectionRef}>
      <div className="section-tag-header">솔직한 후기</div>
      <h2 className="section-title">
        가장 진솔한 이야기, <br /> TecoTeco 멤버들의 목소리 🗣️
      </h2>
      <p className="section-subtitle">
        숫자와 코드만으로는 설명할 수 없는 <span className="highlight">우리 모임의 진짜 가치</span>
        를 들어보세요.
      </p>

      <div className="tecoteco-keywords-list">
        {tecotecoKeywords.map((keyword, index) => (
          <span key={index} className="tecoteco-keyword-tag">
            {keyword}
          </span>
        ))}
      </div>

      <div className={`tecoteco-reviews-grid ${isLoading ? 'loading' : ''}`}>
        {tecotecoReviews.slice(0, visibleReviewsCount).map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}

        {/* 로딩 중일 때 스켈레톤 카드들 */}
        {isLoading &&
          Array.from({ length: Math.min(5, remainingReviews) }).map((_, index) => (
            <div key={`skeleton-${index}`} className="tecoteco-review-card skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton-name"></div>
                <div className="skeleton-meta"></div>
              </div>
              <div className="skeleton-title"></div>
              <div className="skeleton-content">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton-emojis"></div>
                <div className="skeleton-likes"></div>
              </div>
            </div>
          ))}
      </div>

      {hasMoreReviews && !isLoading && (
        <div className="tecoteco-view-all-reviews-wrapper">
          <button
            className="tecoteco-view-all-reviews-button"
            onClick={handleViewMore}
            disabled={isLoading}
          >
            <span className="button-text">
              후기 더 보기
              <span className="remaining-count">({remainingReviews}개 남음)</span>
            </span>
            <span className="button-icon">📝</span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>더 많은 후기를 불러오는 중...</span>
        </div>
      )}

      {!hasMoreReviews && visibleReviewsCount > 3 && (
        <div className="all-reviews-loaded">
          <span className="completion-message">✨ 모든 후기를 확인했어요!</span>
          <p className="thank-you-message">소중한 후기를 남겨주신 모든 멤버분들께 감사드려요 💝</p>
        </div>
      )}
    </section>
  );
};

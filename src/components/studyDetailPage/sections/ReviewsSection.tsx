import React, { useState, useEffect, useRef } from 'react';
import { ReviewSectionData, Review } from '../types/reviewTypes';
import { CATEGORY_LABELS } from '../../../types/reviewTags';
import './ReviewsSection.css';

interface ReviewsSectionProps {
  data: ReviewSectionData;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="study-detail-review-card">
    <div className="study-detail-review-header">
      <div className="study-detail-reviewer-info">
        {review.userProfileImage && (
          <img 
            src={review.userProfileImage} 
            alt={review.userName}
            className="study-detail-reviewer-avatar" 
          />
        )}
        <div className="study-detail-reviewer-details">
          <span className="study-detail-reviewer-name">{review.userName}</span>
          {review.isVerified && <span className="study-detail-verified-badge">✓ 인증</span>}
        </div>
      </div>
      <span className="study-detail-review-meta">
        {review.attendCount && `모임에 ${review.attendCount}회 참석 · `}
        {review.timeAgo || new Date(review.createdAt).toLocaleDateString()}
      </span>
    </div>
    
    <div className="study-detail-review-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={`study-detail-star ${star <= review.rating ? 'filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
    
    <h4 className="study-detail-review-title">{review.title}</h4>
    <p className="study-detail-review-content">{review.content}</p>
    
    <div className="study-detail-review-footer">
      {review.tags && review.tags.length > 0 && (
        <div className="study-detail-review-tags">
          {review.tags.map((tag, idx) => (
            <span key={idx} className="study-detail-review-tag" title={tag.description}>
              <span className="study-detail-tag-emoji">{tag.emoji}</span>
              <span className="study-detail-tag-label">{tag.label}</span>
            </span>
          ))}
        </div>
      )}
      {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
        <span className="study-detail-review-helpful">
          도움이 돼요 {review.helpfulCount}
        </span>
      )}
    </div>
  </div>
);

const ReviewStats: React.FC<{ stats: ReviewSectionData['stats'] }> = ({ stats }) => {
  if (!stats) return null;
  
  const maxCount = Math.max(...Object.values(stats.ratingDistribution));
  
  return (
    <div className="study-detail-review-stats">
      <div className="study-detail-stats-summary">
        <div className="study-detail-average-rating">
          <span className="study-detail-rating-number">{stats.averageRating.toFixed(1)}</span>
          <div className="study-detail-rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className={`study-detail-star ${star <= Math.round(stats.averageRating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="study-detail-total-reviews">
          총 {stats.totalReviews}개의 리뷰
        </div>
        {stats.recommendationRate && (
          <div className="study-detail-recommendation-rate">
            <strong>{stats.recommendationRate}%</strong>가 추천
          </div>
        )}
      </div>
      
      <div className="study-detail-rating-distribution">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="study-detail-rating-bar">
            <span className="study-detail-rating-label">{rating}점</span>
            <div className="study-detail-bar-container">
              <div 
                className="study-detail-bar-fill"
                style={{ 
                  width: `${maxCount > 0 ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / maxCount) * 100 : 0}%` 
                }}
              />
            </div>
            <span className="study-detail-rating-count">
              {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ data }) => {
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(data.displayCount || 3);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(data.reviews || []);
  const sectionRef = useRef<HTMLElement>(null);
  
  // 정렬 적용
  useEffect(() => {
    if (data.reviews) {
      let sortedReviews = [...data.reviews];
      
      switch (data.sortBy) {
        case 'latest':
          sortedReviews.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'helpful':
          sortedReviews.sort((a, b) => 
            (b.helpfulCount || 0) - (a.helpfulCount || 0)
          );
          break;
        case 'rating_high':
          sortedReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_low':
          sortedReviews.sort((a, b) => a.rating - b.rating);
          break;
      }
      
      setReviews(sortedReviews);
    }
  }, [data.reviews, data.sortBy]);
  
  if (!data.enabled) {
    return null;
  }
  
  const handleViewMore = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const nextCount = Math.min(visibleReviewsCount + 5, reviews.length);
      setVisibleReviewsCount(nextCount);
      setIsLoading(false);
    }, 500);
  };
  
  const hasMoreReviews = visibleReviewsCount < reviews.length;
  const remainingReviews = reviews.length - visibleReviewsCount;
  
  // 태그 통계 계산
  const tagStats = reviews.reduce((acc, review) => {
    review.tags?.forEach(tag => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      const existing = acc[tag.category].find(t => t.id === tag.id);
      if (existing) {
        existing.count++;
      } else {
        acc[tag.category].push({ ...tag, count: 1 });
      }
    });
    return acc;
  }, {} as Record<string, Array<any>>);
  
  // 인기 태그 추출 (상위 10개)
  const popularTags = Object.values(tagStats)
    .flat()
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return (
    <section className="study-detail-reviews-section" ref={sectionRef}>
      <div className="study-detail-section-header">
        <h2 className="study-detail-section-title">{data.title}</h2>
        {data.subtitle && (
          <p className="study-detail-section-subtitle">{data.subtitle}</p>
        )}
      </div>
      
      {data.showStats && data.stats && (
        <ReviewStats stats={data.stats} />
      )}
      
      {popularTags.length > 0 && (
        <div className="study-detail-popular-tags">
          <h3 className="study-detail-tags-title">자주 언급된 키워드</h3>
          <div className="study-detail-tags-list">
            {popularTags.map((tag, idx) => (
              <span key={idx} className="study-detail-popular-tag">
                <span className="study-detail-tag-emoji">{tag.emoji}</span>
                <span className="study-detail-tag-label">{tag.label}</span>
                <span className="study-detail-tag-count">({tag.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {reviews.length > 0 ? (
        <>
          <div className={`study-detail-reviews-grid ${isLoading ? 'loading' : ''}`}>
            {reviews.slice(0, visibleReviewsCount).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            
            {isLoading && 
              Array.from({ length: Math.min(5, remainingReviews) }).map((_, index) => (
                <div key={`skeleton-${index}`} className="study-detail-review-card skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-name"></div>
                      <div className="skeleton-meta"></div>
                    </div>
                  </div>
                  <div className="skeleton-rating"></div>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                  <div className="skeleton-tags"></div>
                </div>
              ))
            }
          </div>
          
          {hasMoreReviews && !isLoading && (
            <div className="study-detail-view-more-wrapper">
              <button
                className="study-detail-view-more-button"
                onClick={handleViewMore}
                disabled={isLoading}
              >
                <span>후기 더 보기</span>
                <span className="study-detail-remaining-count">
                  ({remainingReviews}개 남음)
                </span>
              </button>
            </div>
          )}
          
          {isLoading && (
            <div className="study-detail-loading-indicator">
              <div className="study-detail-loading-spinner"></div>
              <span>더 많은 후기를 불러오는 중...</span>
            </div>
          )}
          
          {!hasMoreReviews && visibleReviewsCount > 3 && (
            <div className="study-detail-all-loaded">
              <span className="study-detail-completion-message">
                ✨ 모든 후기를 확인했어요!
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="study-detail-no-reviews">
          <p>아직 작성된 후기가 없습니다.</p>
          <p className="study-detail-no-reviews-sub">
            첫 번째 후기를 남겨주세요!
          </p>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
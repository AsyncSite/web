import React from 'react';
import { ReviewStatistics as ReviewStats, ReviewType } from '../../api/reviewService';
import './Review.css';

interface ReviewStatisticsProps {
  statistics: ReviewStats;
}

const ReviewStatistics: React.FC<ReviewStatisticsProps> = ({ statistics }) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="stars-display">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <span key={i} className="star filled">★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} className="star half">★</span>;
          } else {
            return <span key={i} className="star empty">★</span>;
          }
        })}
      </div>
    );
  };

  const getReviewTypeLabel = (type: ReviewType) => {
    switch (type) {
      case ReviewType.OVERALL:
        return '종합';
      case ReviewType.CONTENT:
        return '콘텐츠';
      case ReviewType.OPERATION:
        return '운영';
      default:
        return type;
    }
  };

  const maxRatingCount = Math.max(...Object.values(statistics.ratingDistribution || {}));

  return (
    <div className="review-statistics">
      <div className="stats-summary">
        <div className="average-rating">
          <div className="rating-number">{statistics.averageRating.toFixed(1)}</div>
          {renderStars(statistics.averageRating)}
          <div className="total-reviews">{statistics.totalReviews}개의 리뷰</div>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = statistics.ratingDistribution?.[rating] || 0;
            const percentage = statistics.totalReviews > 0 
              ? (count / statistics.totalReviews) * 100 
              : 0;
            const barWidth = maxRatingCount > 0 
              ? (count / maxRatingCount) * 100 
              : 0;

            return (
              <div key={rating} className="rating-bar-item">
                <span className="rating-label">{rating}점</span>
                <div className="rating-bar-container">
                  <div 
                    className="rating-bar-fill" 
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="rating-count">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>

        {statistics.typeDistribution && Object.keys(statistics.typeDistribution).length > 0 && (
          <div className="type-distribution">
            <h4>리뷰 유형별 분포</h4>
            <div className="type-chips">
              {Object.entries(statistics.typeDistribution).map(([type, count]) => (
                <div key={type} className="type-chip">
                  <span className="type-label">
                    {getReviewTypeLabel(type as ReviewType)}
                  </span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStatistics;
import React, { useState } from 'react';
import { ReviewResponse, ReviewType } from '../../api/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import './Review.css';

interface ReviewItemProps {
  review: ReviewResponse;
  onEdit?: (review: ReviewResponse) => void;
  onDelete?: (reviewId: string) => void;
  onLike?: (reviewId: string) => void;
  onUnlike?: (reviewId: string) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onEdit,
  onDelete,
  onLike,
  onUnlike
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(review.isLikedByMe || false);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [isProcessing, setIsProcessing] = useState(false);

  const isOwner = user?.email === review.reviewerId || user?.username === review.reviewerId;

  const handleLikeToggle = async () => {
    if (!onLike || !onUnlike || isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (isLiked) {
        await onUnlike(review.id);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await onLike(review.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setIsLiked(review.isLikedByMe || false);
      setLikeCount(review.likeCount);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
        ★
      </span>
    ));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? '방금 전' : `${minutes}분 전`;
      }
      return `${hours}시간 전`;
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="review-author">
          <div className="author-avatar">
            {review.reviewerName?.[0] || '?'}
          </div>
          <div className="author-info">
            <div className="author-name">{review.reviewerName}</div>
            <div className="review-meta">
              <span className="review-type">{getReviewTypeLabel(review.type)}</span>
              <span className="review-date">{formatDate(review.createdAt)}</span>
              {review.attendanceCount > 0 && (
                <span className="attendance-badge">
                  참석 {review.attendanceCount}회
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="review-rating">
          {renderStars(review.rating)}
        </div>
      </div>

      <div className="review-content">
        <h4 className="review-title">{review.title}</h4>
        <p className="review-text">{review.content}</p>
        
        {review.tags && review.tags.length > 0 && (
          <div className="review-tags">
            {review.tags.map((tag, index) => (
              <span key={index} className="review-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="review-actions">
        <button
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeToggle}
          disabled={isProcessing || !user}
          title={!user ? '로그인이 필요합니다' : ''}
        >
          <span className="like-icon">👍</span>
          <span className="like-count">{likeCount}</span>
        </button>

        {isOwner && (
          <div className="owner-actions">
            {onEdit && (
              <button
                className="edit-button"
                onClick={() => onEdit(review)}
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                className="delete-button"
                onClick={() => {
                  if (window.confirm('리뷰를 삭제하시겠습니까?')) {
                    onDelete(review.id);
                  }
                }}
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
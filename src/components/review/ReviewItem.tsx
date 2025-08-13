import React, { useState } from 'react';
import { ReviewResponse, ReviewType } from '../../api/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import { REVIEW_TAGS } from '../../types/reviewTags';
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

  // 태그 처리 함수 - 연결된 태그 문자열을 개별 태그로 분리
  const processReviewTags = (tags: string[]): string[] => {
    // 만약 tags가 단일 요소 배열이고 그 요소가 연결된 태그들이면 분리
    if (tags.length === 1 && typeof tags[0] === 'string') {
      const singleTag = tags[0];
      
      // REVIEW_TAGS의 키가 아니면서 대문자와 언더스코어로만 구성된 경우
      // 연결된 태그로 간주
      if (!REVIEW_TAGS[singleTag] && /^[A-Z_]+$/.test(singleTag)) {
        return splitConcatenatedTags(singleTag);
      }
    }
    
    // 일반적인 경우 - 각 태그를 확인
    return tags.flatMap(tag => {
      // REVIEW_TAGS에 없고 대문자/언더스코어로만 구성되어 있으면 분리 시도
      if (!REVIEW_TAGS[tag] && /^[A-Z_]+$/.test(tag) && tag.length > 10) {
        return splitConcatenatedTags(tag);
      }
      return tag;
    });
  };

  // 연결된 태그 문자열을 개별 태그로 분리
  const splitConcatenatedTags = (concatenatedTag: string): string[] => {
    // REVIEW_TAGS에서 가져오기
    const knownTagIds = Object.keys(REVIEW_TAGS);
    const result: string[] = [];
    let remaining = concatenatedTag;
    
    // 가장 긴 태그부터 매칭 시도
    const sortedTags = knownTagIds.sort((a, b) => b.length - a.length);
    
    while (remaining.length > 0) {
      let matched = false;
      
      for (const tagId of sortedTags) {
        if (remaining.startsWith(tagId)) {
          result.push(tagId);
          remaining = remaining.substring(tagId.length);
          matched = true;
          break;
        }
      }
      
      // 매칭되지 않으면 남은 전체를 추가하고 종료
      if (!matched) {
        // 남은 부분이 있으면 그대로 추가
        if (remaining.length > 0) {
          result.push(remaining);
        }
        break;
      }
    }
    
    return result.length > 0 ? result : [concatenatedTag];
  };

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
            {processReviewTags(review.tags).map((tagId, index) => {
              // REVIEW_TAGS에서 태그 정보 가져오기 (ReviewWritePage와 동일한 방식)
              const tag = REVIEW_TAGS[tagId];
              
              // 태그 정보가 있으면 이모지와 라벨 표시
              if (tag) {
                return (
                  <span key={index} className="review-tag">
                    <span className="tag-emoji">{tag.emoji}</span>
                    <span className="tag-label">{tag.label}</span>
                  </span>
                );
              }
              
              // 태그 정보가 없으면 원본 표시 (폴백)
              return (
                <span key={index} className="review-tag">
                  {tagId}
                </span>
              );
            })}
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
                onClick={() => onDelete(review.id)}
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
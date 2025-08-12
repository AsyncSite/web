import React, { useState, useEffect } from 'react';
import reviewService, { ReviewResponse, ReviewType, ReviewSearchParams } from '../../api/reviewService';
import ReviewItem from './ReviewItem';
import './Review.css';

interface ReviewListProps {
  studyId: string;
  onEditReview?: (review: ReviewResponse) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ studyId, onEditReview }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<ReviewSearchParams>({
    size: 10,
    sort: 'createdAt,desc'
  });

  useEffect(() => {
    loadReviews();
  }, [studyId, currentPage, filters]);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getReviews(studyId, {
        ...filters,
        page: currentPage
      });
      setReviews(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setError('리뷰를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      await reviewService.likeReview(reviewId);
      // Update local state optimistically
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, isLikedByMe: true, likeCount: review.likeCount + 1 }
          : review
      ));
    } catch (error) {
      console.error('Failed to like review:', error);
      throw error;
    }
  };

  const handleUnlike = async (reviewId: string) => {
    try {
      await reviewService.unlikeReview(reviewId);
      // Update local state optimistically
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, isLikedByMe: false, likeCount: Math.max(0, review.likeCount - 1) }
          : review
      ));
    } catch (error) {
      console.error('Failed to unlike review:', error);
      throw error;
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  const handleFilterChange = (newFilters: Partial<ReviewSearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleSortChange = (sortOption: string) => {
    let sort = 'createdAt,desc';
    switch (sortOption) {
      case 'latest':
        sort = 'createdAt,desc';
        break;
      case 'oldest':
        sort = 'createdAt,asc';
        break;
      case 'rating-high':
        sort = 'rating,desc';
        break;
      case 'rating-low':
        sort = 'rating,asc';
        break;
      case 'likes':
        sort = 'likeCount,desc';
        break;
    }
    handleFilterChange({ sort });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="review-list-loading">
        <div className="loading-spinner">리뷰를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-list-error">
        <p>{error}</p>
        <button onClick={loadReviews}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="review-list">
      <div className="review-list-header">
        <h3 className="review-list-title">
          리뷰 ({totalElements}개)
        </h3>
        
        <div className="review-filters">
          <select
            className="filter-select"
            onChange={(e) => handleFilterChange({ 
              type: e.target.value ? e.target.value as ReviewType : undefined 
            })}
            defaultValue=""
          >
            <option value="">모든 유형</option>
            <option value={ReviewType.OVERALL}>종합 리뷰</option>
            <option value={ReviewType.CONTENT}>콘텐츠 리뷰</option>
            <option value={ReviewType.OPERATION}>운영 리뷰</option>
          </select>

          <select
            className="filter-select"
            onChange={(e) => handleFilterChange({ 
              minRating: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            defaultValue=""
          >
            <option value="">모든 평점</option>
            <option value="5">5점</option>
            <option value="4">4점 이상</option>
            <option value="3">3점 이상</option>
          </select>

          <select
            className="sort-select"
            onChange={(e) => handleSortChange(e.target.value)}
            defaultValue="latest"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="rating-high">평점 높은순</option>
            <option value="rating-low">평점 낮은순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="review-list-empty">
          <p>아직 작성된 리뷰가 없습니다.</p>
          <p>첫 번째 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <>
          <div className="review-items">
            {reviews.map(review => (
              <ReviewItem
                key={review.id}
                review={review}
                onEdit={onEditReview}
                onDelete={handleDelete}
                onLike={handleLike}
                onUnlike={handleUnlike}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="review-pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                이전
              </button>
              
              <span className="pagination-info">
                {currentPage + 1} / {totalPages}
              </span>
              
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;
import React, { useState, useEffect } from 'react';
import { 
  ReviewSectionData, 
  Review, 
  ReviewStats,
  sampleReviews,
  sampleReviewStats
} from '../../types/reviewTypes';
import reviewService, { ReviewResponse, ReviewStatistics } from '../../../../api/reviewService';
import './ReviewSectionForm.css';

interface ReviewSectionFormProps {
  studyId?: string;
  initialData?: ReviewSectionData;
  onSave: (data: ReviewSectionData) => void;
  onCancel: () => void;
}

const ReviewSectionForm: React.FC<ReviewSectionFormProps> = ({
  studyId,
  initialData,
  onSave,
  onCancel
}) => {
  // 기본 상태
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);
  const [title, setTitle] = useState(initialData?.title || '수강생 후기');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [showStats, setShowStats] = useState(initialData?.showStats ?? true);
  const [displayCount, setDisplayCount] = useState(initialData?.displayCount || 10);
  const [sortBy, setSortBy] = useState<ReviewSectionData['sortBy']>(initialData?.sortBy || 'latest');
  
  // 실제 리뷰 데이터 (API에서 가져올 예정)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | undefined>();
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // 컴포넌트 마운트 시 리뷰 데이터 로드
  useEffect(() => {
    if (studyId && enabled) {
      loadReviews();
    }
  }, [studyId, enabled]);
  
  // 정렬 방식이나 표시 개수 변경 시 리뷰 다시 로드
  useEffect(() => {
    if (studyId && enabled) {
      loadReviews();
    }
  }, [sortBy, displayCount]);

  const loadReviews = async () => {
    if (!studyId) return;
    
    setIsLoadingReviews(true);
    try {
      // 리뷰 목록 가져오기
      const reviewsResponse = await reviewService.getReviews(studyId, {
        page: 0,
        size: displayCount,
        sort: sortBy === 'latest' ? 'createdAt,desc' : 
              sortBy === 'helpful' ? 'likeCount,desc' :
              sortBy === 'rating_high' ? 'rating,desc' : 'rating,asc'
      });
      
      // 리뷰 통계 가져오기
      const statsResponse = await reviewService.getReviewStatistics(studyId);
      
      // ReviewResponse를 Review 타입으로 변환
      const transformedReviews: Review[] = reviewsResponse.content.map((r: ReviewResponse) => ({
        id: r.id,
        userId: r.reviewerId,
        userName: r.reviewerName,
        userProfileImage: undefined, // API에서 제공 안됨
        rating: r.rating,
        title: r.title || '', // 제목 추가
        content: r.content,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        isVerified: r.attendanceCount > 0, // 출석 기록이 있으면 인증된 것으로 간주
        attendCount: r.attendanceCount, // 참석 횟수 추가
        helpfulCount: r.likeCount,
        tags: r.tags ? r.tags.map(tagId => {
          // 태그 ID를 실제 태그 객체로 변환 (임시)
          // TODO: 백엔드에서 태그 정보도 함께 전달받도록 수정
          return {
            id: tagId,
            category: 'ATMOSPHERE' as any,
            label: tagId,
            emoji: '✨'
          };
        }) : undefined,
        timeAgo: undefined // 프론트에서 계산
      }));
      
      // ReviewStatistics를 ReviewStats 타입으로 변환
      const transformedStats: ReviewStats = {
        averageRating: statsResponse.averageRating,
        totalReviews: statsResponse.totalReviews,
        ratingDistribution: {
          5: statsResponse.ratingDistribution[5] || 0,
          4: statsResponse.ratingDistribution[4] || 0,
          3: statsResponse.ratingDistribution[3] || 0,
          2: statsResponse.ratingDistribution[2] || 0,
          1: statsResponse.ratingDistribution[1] || 0
        },
        recommendationRate: Math.round((statsResponse.averageRating / 5) * 100) // 5점 만점 기준 추천율 계산
      };
      
      setReviews(transformedReviews);
      setStats(transformedStats);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // 에러 시 샘플 데이터 사용 (개발 편의를 위해)
      setReviews(sampleReviews);
      setStats(sampleReviewStats);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: ReviewSectionData = {
      enabled,
      title,
      subtitle,
      showStats,
      stats,
      displayCount,
      sortBy,
      // reviews는 저장하지 않음 (항상 API에서 실시간으로 가져옴)
    };

    onSave(data);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="study-management-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`study-management-review-star ${star <= rating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-review-form">
      {/* 섹션 활성화 토글 */}
      <div className="study-management-review-section-toggle">
        <label className="study-management-review-toggle-container">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="study-management-review-toggle-input"
          />
          <span className="study-management-review-toggle-slider"></span>
          <span className="study-management-review-toggle-label">
            리뷰 섹션 표시
          </span>
        </label>
        <p className="study-management-review-toggle-description">
          사용자들이 작성한 실제 리뷰를 스터디 페이지에 표시합니다.
        </p>
      </div>

      {enabled && (
        <>
          {/* 섹션 제목 설정 */}
          <div className="study-management-review-form-group">
            <label>섹션 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 수강생 후기, 참여자 리뷰"
              className="study-management-review-input"
            />
          </div>

          <div className="study-management-review-form-group">
            <label>부제목 (선택)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="예: 실제 참여자들의 생생한 후기를 확인해보세요"
              className="study-management-review-input"
            />
          </div>

          {/* 표시 옵션 */}
          <div className="study-management-review-options-section">
            <h4>표시 옵션</h4>
            
            <div className="study-management-review-options-grid">
              <div className="study-management-review-option">
                <label>
                  <input
                    type="checkbox"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                  />
                  통계 표시
                </label>
                <span className="study-management-review-option-help">
                  평균 평점, 총 리뷰 수 등을 표시합니다
                </span>
              </div>

              <div className="study-management-review-option">
                <label>표시할 리뷰 개수</label>
                <input
                  type="number"
                  value={displayCount}
                  onChange={(e) => setDisplayCount(parseInt(e.target.value) || 10)}
                  min="1"
                  max="50"
                  className="study-management-review-input-small"
                />
              </div>

              <div className="study-management-review-option">
                <label>정렬 방식</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ReviewSectionData['sortBy'])}
                  className="study-management-review-select"
                >
                  <option value="latest">최신순</option>
                  <option value="helpful">도움순</option>
                  <option value="rating_high">평점 높은순</option>
                  <option value="rating_low">평점 낮은순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 리뷰 미리보기 */}
          <div className="study-management-review-preview-section">
            <div className="study-management-review-preview-header">
              <h4>리뷰 미리보기</h4>
              <span className="study-management-review-preview-badge">
                읽기 전용
              </span>
            </div>
            <p className="study-management-review-preview-description">
              실제 사용자 리뷰는 수정할 수 없으며, 자동으로 동기화됩니다.
            </p>

            {/* 통계 미리보기 */}
            {showStats && stats && (
              <div className="study-management-review-stats-preview">
                <div className="study-management-review-stats-summary">
                  <div className="study-management-review-stats-rating">
                    <span className="study-management-review-stats-number">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    {renderStarRating(Math.round(stats.averageRating))}
                    <span className="study-management-review-stats-count">
                      ({stats.totalReviews}개 리뷰)
                    </span>
                  </div>
                  {stats.recommendationRate && (
                    <div className="study-management-review-stats-recommend">
                      <span className="study-management-review-stats-percent">
                        {stats.recommendationRate}%
                      </span>
                      <span className="study-management-review-stats-label">
                        추천율
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 평점 분포 */}
                <div className="study-management-review-stats-distribution">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="study-management-review-stats-bar">
                      <span className="study-management-review-stats-bar-label">
                        {rating}★
                      </span>
                      <div className="study-management-review-stats-bar-track">
                        <div 
                          className="study-management-review-stats-bar-fill"
                          style={{ 
                            width: `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="study-management-review-stats-bar-count">
                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 리뷰 목록 미리보기 */}
            <div className="study-management-review-list-preview">
              {isLoadingReviews ? (
                <div className="study-management-review-loading">
                  리뷰를 불러오는 중...
                </div>
              ) : reviews.length > 0 ? (
                reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="study-management-review-item-preview">
                    <div className="study-management-review-item-header">
                      <img 
                        src={review.userProfileImage || `https://ui-avatars.com/api/?name=${review.userName}`}
                        alt={review.userName}
                        className="study-management-review-item-avatar"
                      />
                      <div className="study-management-review-item-user">
                        <div className="study-management-review-item-name">
                          {review.userName}
                          {review.isVerified && (
                            <span className="study-management-review-item-verified" title="인증된 수강생">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="study-management-review-item-meta">
                          {renderStarRating(review.rating)}
                          <span className="study-management-review-item-date">
                            {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h5 className="study-management-review-item-title">{review.title}</h5>
                    )}
                    
                    <div className="study-management-review-item-content">
                      {review.content}
                    </div>
                    
                    {review.tags && review.tags.length > 0 && (
                      <div className="study-management-review-item-tags">
                        {review.tags.map((tag, index) => (
                          <span key={index} className="study-management-review-item-tag" title={tag.description}>
                            <span className="study-management-review-tag-emoji">{tag.emoji}</span>
                            <span className="study-management-review-tag-label">{tag.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {review.helpfulCount && review.helpfulCount > 0 && (
                      <div className="study-management-review-item-helpful">
                        👍 {review.helpfulCount}명에게 도움이 됨
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="study-management-review-empty">
                  아직 작성된 리뷰가 없습니다.
                  <br />
                  <span className="study-management-review-empty-sub">
                    사용자가 리뷰를 작성하면 자동으로 표시됩니다.
                  </span>
                </div>
              )}
              
              {reviews.length > 3 && (
                <div className="study-management-review-more">
                  ... 그 외 {reviews.length - 3}개의 리뷰가 더 있습니다
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 폼 액션 */}
      <div className="study-management-review-form-actions">
        <button 
          type="button" 
          onClick={onCancel}
          className="study-management-review-cancel-btn"
        >
          취소
        </button>
        <button 
          type="submit"
          className="study-management-review-save-btn"
        >
          저장
        </button>
      </div>
    </form>
  );
};

export default ReviewSectionForm;
import React, { useState, useEffect, useRef } from 'react';
import { ReviewSectionData, Review } from '../types/reviewTypes';
import { CATEGORY_LABELS, REVIEW_TAGS } from '../../../types/reviewTags';
import reviewService from '../../../api/reviewService';
import './ReviewsSection.css';

interface ReviewsSectionProps {
  data: ReviewSectionData;
  studyId?: string;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="tecoteco-review-card">
    <div className="tecoteco-review-header">
      <span className="tecoteco-reviewer-name">{review.userName}</span>
      <span className="tecoteco-review-meta">
        모임에 {review.attendCount || 0}회 참석하고 작성한 후기예요. {review.timeAgo || new Date(review.createdAt).toLocaleDateString()}
      </span>
    </div>
    <h4 className="tecoteco-review-title">{review.title}</h4>
    <p className="tecoteco-review-content">{review.content}</p>
    <div className="tecoteco-review-footer">
      <div className="tecoteco-review-emojis">
        {review.tags && review.tags.length > 0 ? (
          review.tags.slice(0, 3).map((tag, idx) => {
            // tag.label에서 이모지만 추출 (첫 번째 공백 전까지)
            const emoji = tag.label ? tag.label.split(' ')[0] : tag.emoji;
            return <span key={idx}>{emoji}</span>;
          })
        ) : (
          ['😃', '✨', '🔥'].map((emoji, idx) => (
            <span key={idx}>{emoji}</span>
          ))
        )}
      </div>
      <span className="tecoteco-review-likes">🧡 {review.helpfulCount || 0}</span>
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

// 연결된 태그 문자열을 개별 태그로 분리하는 헬퍼 함수
const splitConcatenatedTags = (concatenatedTag: string): string[] => {
  // 이미 개별 태그인 경우 (REVIEW_TAGS에 존재)
  if (REVIEW_TAGS[concatenatedTag]) {
    return [concatenatedTag];
  }
  
  // 연결된 태그 분리 (예: "CHALLENGINGEXCITING_ATMOSPHERECOMFORTABLE_ATMOSPHERE")
  const knownTagIds = Object.keys(REVIEW_TAGS);
  const result: string[] = [];
  let remaining = concatenatedTag;
  
  // 가장 긴 태그부터 매칭 시도 (EXCITING_ATMOSPHERE가 EXCITING보다 먼저 매칭되도록)
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
      if (remaining.length > 0) {
        result.push(remaining);
      }
      break;
    }
  }
  
  return result.length > 0 ? result : [concatenatedTag];
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ data, studyId }) => {
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(data.displayCount || 3);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(data.reviews || []);
  const [dynamicReviews, setDynamicReviews] = useState<any[]>([]);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  
  // studyId가 있으면 API에서 리뷰 동적으로 로드
  useEffect(() => {
    const loadReviews = async () => {
      if (studyId) {
        try {
          const response = await reviewService.getReviews(studyId);
          // API 응답을 ReviewsSection 형식으로 변환
          const apiReviews = response.content.map((r: any) => ({
            id: r.id,
            userName: r.authorName || r.reviewerName, // authorName 우선 사용
            userProfileImage: null,
            isVerified: true,
            rating: r.rating,
            title: r.title,
            content: r.content,
            tags: r.tags?.flatMap((tagString: string) => {
              // 연결된 태그 문자열 처리
              const processedTags = splitConcatenatedTags(tagString);
              return processedTags.map(tagId => {
                const tagInfo = REVIEW_TAGS[tagId];
                if (tagInfo) {
                  return {
                    id: tagInfo.id,
                    label: `${tagInfo.emoji} ${tagInfo.label}`,
                    emoji: tagInfo.emoji,
                    category: tagInfo.category,
                    description: tagInfo.description || ''
                  };
                }
                // 알 수 없는 태그는 그대로 반환
                return {
                  id: tagId,
                  label: tagId,
                  emoji: '',
                  category: 'general',
                  description: ''
                };
              });
            }) || [],
            attendCount: r.attendCountSnapshot || r.attendanceCount || 0,
            helpfulCount: r.likeCount || 0,
            createdAt: r.createdAt,
            timeAgo: r.timeAgo || r.createdAt
          }));
          setDynamicReviews(apiReviews);
        } catch (error) {
          console.error('Failed to load reviews:', error);
        }
      }
    };
    
    loadReviews();
  }, [studyId]);

  // 키워드 추출 로직 - 항상 리뷰 데이터에서만 추출
  useEffect(() => {
    if (reviews.length > 0) {
      // 리뷰 데이터에서 태그 추출
      const tagCounts: Record<string, number> = {};
      reviews.forEach(review => {
        review.tags?.forEach(tag => {
          const key = tag.emoji ? `${tag.emoji} ${tag.label}` : tag.label;
          tagCounts[key] = (tagCounts[key] || 0) + 1;
        });
      });
      
      // 상위 10개 키워드 추출
      const topKeywords = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword]) => keyword);
      
      setExtractedKeywords(topKeywords);
    }
  }, [reviews]);

  // 정렬 적용 - dynamicReviews가 있으면 사용, 없으면 data.reviews 사용
  useEffect(() => {
    const reviewsToSort = dynamicReviews.length > 0 ? dynamicReviews : (data.reviews || []);
    if (reviewsToSort.length > 0) {
      let sortedReviews = [...reviewsToSort];
      
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
  }, [data.reviews, data.sortBy, dynamicReviews]);
  
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
  
  // 기본 키워드 (키워드가 없을 때 사용)
  const defaultKeywords = [
    '😌 편안한 분위기',
    '💥 사고의 확장',
    '🤗 배려왕 멤버',
    '🥳 즐거운 분위기',
    '📝 꼼꼼한 코드 리뷰',
    '👩‍💻 실전 코딩',
    '🧠 논리적 사고력',
    '🗣️ 커뮤니케이션 역량',
    '🤖 AI 활용',
    '🌱 함께 성장'
  ];
  
  // 키워드는 항상 추출된 것만 사용 (기본 키워드 사용하지 않음)
  const displayKeywords = extractedKeywords;

  return (
    <section className="study-detail-reviews-section tecoteco-reviews-section" ref={sectionRef}>
      {data.tagHeader && (
        <div className="section-tag-header">{data.tagHeader}</div>
      )}
      
      <h2 className="section-title" dangerouslySetInnerHTML={{ 
        __html: data.title || '리뷰' 
      }} />
      
      {data.subtitle && (
        <p className="section-subtitle" dangerouslySetInnerHTML={{ __html: data.subtitle }} />
      )}
      
      {data.showKeywords !== false && displayKeywords.length > 0 && (
        <div className="tecoteco-keywords-list">
          {displayKeywords.map((keyword, index) => (
            <span key={index} className="tecoteco-keyword-tag">
              {keyword}
            </span>
          ))}
        </div>
      )}
      
      <div className={`tecoteco-reviews-grid ${isLoading ? 'loading' : ''}`}>
        {reviews.slice(0, visibleReviewsCount).map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
        
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
          ))
        }
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

export default ReviewsSection;
import React, { useState, useEffect } from 'react';
import StudyDetailRichTextEditor from '../../../common/richtext/StudyDetailRichTextEditor';
import { RichTextData } from '../../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../../common/richtext/RichTextConverter';
import {
  ReviewSectionData,
  Review,
  ReviewStats
} from '../../types/reviewTypes';
import reviewService, { ReviewResponse, ReviewStatistics } from '../../../../api/reviewService';
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate, systemDesignTemplate, turningPageTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';
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
  const [tagHeader, setTagHeader] = useState(initialData?.tagHeader || '');
  
  // Title과 Subtitle을 RichText로 관리
  const [title, setTitle] = useState<RichTextData | string>(
    initialData?.title ? 
      (typeof initialData.title === 'string' ? RichTextConverter.fromHTML(initialData.title) : initialData.title)
      : ''
  );
  const [subtitle, setSubtitle] = useState<RichTextData | string>(
    initialData?.subtitle ?
      (typeof initialData.subtitle === 'string' ? RichTextConverter.fromHTML(initialData.subtitle) : initialData.subtitle)
      : ''
  );
  
  const [showStats, setShowStats] = useState(initialData?.showStats ?? true);
  const [showKeywords, setShowKeywords] = useState(initialData?.showKeywords ?? true);
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [displayCount, setDisplayCount] = useState(initialData?.displayCount || 10);
  const [sortBy, setSortBy] = useState<ReviewSectionData['sortBy']>(initialData?.sortBy || 'latest');
  
  // 실제 리뷰 데이터 (API에서 가져올 예정)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | undefined>();
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);

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
      
      // 리뷰 태그에서 키워드 자동 추출
      extractKeywordsFromReviews(transformedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // 에러 시 빈 데이터 설정
      setReviews([]);
      setStats(undefined);
      setExtractedKeywords([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // 리뷰 태그에서 키워드 추출
  const extractKeywordsFromReviews = (reviewList: Review[]) => {
    const tagCounts: Record<string, number> = {};
    
    reviewList.forEach(review => {
      review.tags?.forEach(tag => {
        const key = tag.emoji ? `${tag.emoji} ${tag.label}` : tag.label;
        tagCounts[key] = (tagCounts[key] || 0) + 1;
      });
    });
    
    // 상위 10개 키워드 추출 (빈도순)
    const topKeywords = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
    
    setExtractedKeywords(topKeywords);
    
    // keywords가 비어있으면 자동으로 설정
    if (keywords.length === 0) {
      setKeywords(topKeywords);
    }
  };


  // 예시 데이터 로드 - templateData.ts에서 가져오기
  const loadExampleData = (templateType: string) => {
    if (!templateType) return;

    let reviewData;
    if (templateType === 'algorithm') {
      reviewData = algorithmTemplate.sections.review;
    } else if (templateType === 'mogakup') {
      reviewData = mogakupTemplate.sections.review;
    } else if (templateType === 'bookStudy') {
      reviewData = bookStudyTemplate.sections.review;
    } else if (templateType === 'systemDesign') {
      reviewData = systemDesignTemplate.sections.review;
    } else if (templateType === 'turningPage') {
      reviewData = turningPageTemplate.sections.review;
    } else {
      return;
    }

    if (!reviewData) return;

    setTagHeader(reviewData.tagHeader);
    setTitle(RichTextConverter.fromHTML(reviewData.title));
    setSubtitle(RichTextConverter.fromHTML(reviewData.subtitle));
    setShowKeywords(reviewData.showKeywords);
    setDisplayCount(reviewData.displayCount);
    setSortBy(reviewData.sortBy as ReviewSectionData['sortBy']);
    setShowStats(reviewData.showStats);

    // 리뷰 데이터 변환 (templateData 형식을 Review 타입으로)
    const templateReviews: Review[] = reviewData.reviews.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      rating: r.rating,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt,
      attendCount: r.attendCount,
      helpfulCount: r.helpfulCount,
      tags: r.tags.map(tag => ({
        ...tag,
        category: tag.category as any
      })),
      timeAgo: r.timeAgo
    }));

    setReviews(templateReviews);

    // 리뷰에서 키워드 자동 추출
    extractKeywordsFromReviews(templateReviews);

      // 템플릿의 기본 키워드 사용
      if (reviewData.keywords) {
        setKeywords(reviewData.keywords);
      }
  };

  // Clear form and reset to initial state
  const handleClearTemplate = () => {
    setEnabled(initialData?.enabled ?? true);
    setTagHeader(initialData?.tagHeader || '');
    setTitle(initialData?.title ?
      (typeof initialData.title === 'string' ? RichTextConverter.fromHTML(initialData.title) : initialData.title)
      : '');
    setSubtitle(initialData?.subtitle ?
      (typeof initialData.subtitle === 'string' ? RichTextConverter.fromHTML(initialData.subtitle) : initialData.subtitle)
      : '');
    setShowStats(initialData?.showStats ?? true);
    setShowKeywords(initialData?.showKeywords ?? true);
    setKeywords(initialData?.keywords || []);
    setDisplayCount(initialData?.displayCount || 10);
    setSortBy(initialData?.sortBy || 'latest');
    setReviews([]);
    setStats(undefined);
    setExtractedKeywords([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // RichText를 HTML로 변환하여 저장
    const data: ReviewSectionData = {
      enabled,
      tagHeader,
      title: typeof title === 'string' ? title : RichTextConverter.toHTML(title),
      subtitle: typeof subtitle === 'string' ? subtitle : RichTextConverter.toHTML(subtitle),
      showStats,
      showKeywords,
      keywords,
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
      {/* 예시 데이터 템플릿 선택 - 우측 정렬 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <TemplateSelector
          onTemplateSelect={loadExampleData}
          onClear={handleClearTemplate}
        />
      </div>

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
          {/* 태그 헤더 설정 */}
          <div className="study-management-review-form-group">
            <label>태그 헤더</label>
            <input
              type="text"
              value={tagHeader}
              onChange={(e) => setTagHeader(e.target.value)}
              placeholder="솔직한 후기"
              className="study-management-review-input"
            />
          </div>

          {/* 섹션 제목 - Rich Text Editor */}
          <div className="study-management-review-form-group">
            <label>제목 *</label>
            <StudyDetailRichTextEditor
              value={title}
              onChange={setTitle}
              placeholder="예: 가장 진솔한 이야기, 멤버들의 목소리 🗣️"
              toolbar={['break', 'bold', 'italic', 'highlight', 'color']}
              singleLine={false}
            />
          </div>

          {/* 부제목 - Rich Text Editor */}
          <div className="study-management-review-form-group">
            <label>부제목</label>
            <StudyDetailRichTextEditor
              value={subtitle}
              onChange={setSubtitle}
              placeholder="예: 숫자와 코드만으로는 설명할 수 없는 우리 모임의 진짜 가치를 들어보세요."
              toolbar={['break', 'bold', 'italic', 'highlight', 'color']}
              singleLine={false}
            />
          </div>

          {/* 키워드 설정 */}
          <div className="study-management-review-form-group">
            <label>
              <input
                type="checkbox"
                checked={showKeywords}
                onChange={(e) => setShowKeywords(e.target.checked)}
              />
              키워드 표시
            </label>
          </div>

          {showKeywords && (
            <div className="study-management-review-form-group">
              <label>키워드 목록 (리뷰에서 자동 추출)</label>
              
              {/* 자동 추출된 키워드 표시 - 읽기 전용 */}
              {extractedKeywords.length > 0 ? (
                <div style={{ 
                  padding: '15px',
                  background: 'rgba(195, 232, 141, 0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(195, 232, 141, 0.2)'
                }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#888', 
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#C3E88D', fontWeight: '600' }}>✨ 자동 추출된 인기 키워드</span>
                    <br />
                    <span style={{ fontSize: '0.8rem' }}>
                      실제 리뷰어들이 가장 많이 사용한 태그에서 추출됩니다
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {extractedKeywords.map((keyword, index) => (
                      <span 
                        key={index}
                        style={{
                          padding: '6px 12px',
                          background: '#3a3a3a',
                          borderRadius: '20px',
                          color: '#f0f0f0',
                          fontSize: '0.9rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid rgba(195, 232, 141, 0.3)'
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '10px', 
                    background: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#ffc107'
                  }}>
                    ⚠️ 키워드는 실제 리뷰 데이터에서 자동으로 추출되며, 수동으로 편집할 수 없습니다.
                    <br />
                    리뷰어가 태그를 추가하면 자동으로 업데이트됩니다.
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '20px',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  아직 리뷰가 없어 키워드를 추출할 수 없습니다.
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>
                    리뷰가 작성되면 자동으로 키워드가 표시됩니다.
                  </span>
                </div>
              )}
            </div>
          )}

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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TemplateHeader, Footer } from '../components/layout';
import studyService, { Study } from '../api/studyService';
import reviewService, { CreateReviewRequest, ReviewType } from '../api/reviewService';
import { 
  REVIEW_TAGS, 
  ReviewTagCategory, 
  CATEGORY_LABELS, 
  TAG_SELECTION_RULES,
  getTagsByCategory 
} from '../types/reviewTags';
import './ReviewWritePage.css';

const ReviewWritePage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchStudy = async () => {
      if (!studyId) {
        navigate('/users/me');
        return;
      }

      // Skip check during auth loading
      if (authLoading) {
        return;
      }

      // Check for user after loading is complete
      if (!user) {
        navigate('/login', { state: { from: `/study/${studyId}/review/write` } });
        return;
      }

      try {
        // studyId가 slug일 수도 있으므로 처리
        let studyData = null;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studyId);
        
        if (isUUID) {
          studyData = await studyService.getStudyById(studyId);
        } else {
          studyData = await studyService.getStudyBySlug(studyId);
        }
        
        if (!studyData) {
          alert('존재하지 않는 스터디입니다.');
          navigate('/users/me');
          return;
        }
        
        setStudy(studyData);
        
        // 기존 리뷰 확인
        try {
          const myReviews = await reviewService.getMyReviews();
          const existingStudyReview = myReviews.find(
            (review: any) => review.studyId === studyData.id && 
                           review.type === ReviewType.STUDY_EXPERIENCE
          );
          
          if (existingStudyReview) {
            setExistingReview(existingStudyReview);
            setIsEditMode(true);
            setRating(existingStudyReview.rating);
            setContent(existingStudyReview.content);
            setSelectedTags(new Set(existingStudyReview.tags || []));
            console.log('Existing review found, switching to edit mode:', existingStudyReview);
          }
        } catch (error) {
          console.log('No existing reviews or failed to fetch:', error);
          // 기존 리뷰가 없어도 계속 진행
        }
      } catch (error) {
        console.error('Failed to fetch study:', error);
        alert('스터디 정보를 불러올 수 없습니다.');
        navigate('/users/me');
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [studyId, authLoading, user, navigate]);

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = new Set(selectedTags);
    
    if (newSelectedTags.has(tagId)) {
      newSelectedTags.delete(tagId);
    } else {
      if (newSelectedTags.size >= TAG_SELECTION_RULES.maxTags) {
        alert(`최대 ${TAG_SELECTION_RULES.maxTags}개의 태그만 선택할 수 있습니다.`);
        return;
      }
      
      const tag = REVIEW_TAGS[tagId];
      const sameCategoryTags = Array.from(newSelectedTags).filter(
        id => REVIEW_TAGS[id].category === tag.category
      );
      
      if (sameCategoryTags.length >= TAG_SELECTION_RULES.maxPerCategory) {
        alert(`${CATEGORY_LABELS[tag.category]} 카테고리에서는 최대 ${TAG_SELECTION_RULES.maxPerCategory}개까지만 선택할 수 있습니다.`);
        return;
      }
      
      newSelectedTags.add(tagId);
    }
    
    setSelectedTags(newSelectedTags);
  };

  const getCategoryTagCount = (category: ReviewTagCategory) => {
    return Array.from(selectedTags).filter(
      id => REVIEW_TAGS[id].category === category
    ).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!study || !user) return;
    
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    
    try {
      if (isEditMode && existingReview) {
        // 수정 모드
        const updateData = {
          title: `${study.name} 리뷰`,
          content,
          rating,
          tags: Array.from(selectedTags)
        };
        
        console.log('Updating review:', existingReview.id, updateData);
        await reviewService.updateReview(existingReview.id, updateData);
        alert('리뷰가 성공적으로 수정되었습니다!');
      } else {
        // 생성 모드
        const reviewData: CreateReviewRequest = {
          type: ReviewType.STUDY_EXPERIENCE,  // 백엔드 enum에 맞게 변경
          title: `${study.name} 리뷰`,
          rating,
          content,
          tags: Array.from(selectedTags)
        };
        
        console.log('Sending review data:', reviewData);
        console.log('Study ID:', study.id);
        
        await reviewService.createReview(study.id, reviewData);
        alert('리뷰가 성공적으로 작성되었습니다!');
      }
      navigate('/users/me');
    } catch (error: any) {
      console.error('Failed to create/update review:', error);
      
      // 409 Conflict - 중복 리뷰 (백엔드 수정 후)
      if (error.response?.status === 409) {
        alert('이미 이 스터디에 대한 후기를 작성하셨습니다.\n\n기존 리뷰를 수정하시려면 마이페이지에서 리뷰 수정 버튼을 클릭해주세요.');
        navigate('/users/me');
      } 
      // 백엔드가 아직 수정 안 된 경우 500 에러 처리
      else if (error.response?.status === 500 && 
          (error.response?.data?.message?.includes('already exists') || 
           error.message?.includes('already exists'))) {
        alert('이미 이 스터디에 대한 후기를 작성하셨습니다.\n\n페이지를 새로고침하여 수정 모드로 전환됩니다.');
        window.location.reload();
      } else {
        alert(`리뷰 ${isEditMode ? '수정' : '작성'} 중 오류가 발생했습니다.\n\n${error.response?.data?.message || error.message || '잠시 후 다시 시도해주세요.'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="review-write-page">
        <TemplateHeader />
        <main className="page-content">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>스터디 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!study) {
    return null;
  }

  return (
    <div className="review-write-page">
      <TemplateHeader />
      <main className="page-content">
        <div className="container">
          <div className="review-write-container">
            <div className="review-write-header">
              <button 
                onClick={() => navigate('/users/me')} 
                className="back-button"
              >
                ← 돌아가기
              </button>
              <h1>{isEditMode ? '리뷰 수정' : '리뷰 작성'}</h1>
              <div className="study-info">
                <h2>{study.name} {study.generation > 1 && `${study.generation}기`}</h2>
                <p className="study-tagline">{study.tagline}</p>
                {isEditMode && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '8px',
                    color: '#ffc107'
                  }}>
                    ⚠️ 이미 작성하신 리뷰가 있습니다. 기존 리뷰를 수정합니다.
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label>평점</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">{rating}점</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">리뷰 내용</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="스터디에 대한 솔직한 후기를 남겨주세요."
                  rows={10}
                  maxLength={1000}
                  required
                />
                <span className="char-count">{content.length}/1000</span>
              </div>

              <div className="form-group">
                <label>태그 선택 (선택사항)</label>
                <div className="tag-selection-info">
                  <span>최대 {TAG_SELECTION_RULES.maxTags}개 선택 가능</span>
                  <span className="selected-count">
                    {selectedTags.size}개 선택됨
                  </span>
                </div>
                
                {selectedTags.size > 0 && (
                  <div className="selected-tags">
                    {Array.from(selectedTags).map(tagId => {
                      const tag = REVIEW_TAGS[tagId];
                      return (
                        <span key={tagId} className="selected-tag-chip">
                          <span className="tag-emoji">{tag.emoji}</span>
                          <span className="tag-label">{tag.label}</span>
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tagId)}
                            className="remove-tag"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="toggle-tag-selector-button"
                >
                  {showTagSelector ? '태그 선택 닫기' : '태그 선택하기'}
                </button>
                
                {showTagSelector && (
                  <div className="tag-selector">
                    {Object.values(ReviewTagCategory).map(category => (
                      <div key={category} className="tag-category">
                        <h4 className="category-title">
                          {CATEGORY_LABELS[category]}
                          <span className="category-count">
                            ({getCategoryTagCount(category)}/{TAG_SELECTION_RULES.maxPerCategory})
                          </span>
                        </h4>
                        <div className="tag-grid">
                          {getTagsByCategory(category).map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              className={`tag-option ${selectedTags.has(tag.id) ? 'selected' : ''}`}
                              onClick={() => handleTagToggle(tag.id)}
                              title={tag.description}
                              disabled={
                                !selectedTags.has(tag.id) && 
                                (selectedTags.size >= TAG_SELECTION_RULES.maxTags ||
                                 getCategoryTagCount(category) >= TAG_SELECTION_RULES.maxPerCategory)
                              }
                            >
                              <span className="tag-emoji">{tag.emoji}</span>
                              <span className="tag-label">{tag.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => navigate('/users/me')}
                  className="cancel-button"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? (isEditMode ? '수정 중...' : '작성 중...') : (isEditMode ? '리뷰 수정하기' : '리뷰 작성하기')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewWritePage;
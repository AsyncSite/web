import React, { useState, useEffect } from 'react';
import { ReviewType, CreateReviewRequest, UpdateReviewRequest, ReviewResponse } from '../../api/reviewService';
import { 
  REVIEW_TAGS, 
  ReviewTag, 
  ReviewTagCategory, 
  CATEGORY_LABELS, 
  TAG_SELECTION_RULES,
  getTagsByCategory 
} from '../../types/reviewTags';
import './Review.css';

interface ReviewFormProps {
  studyId: string;
  existingReview?: ReviewResponse;
  onSubmit: (data: CreateReviewRequest | UpdateReviewRequest) => Promise<void>;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  studyId,
  existingReview,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateReviewRequest>({
    type: existingReview?.type || ReviewType.OVERALL,
    title: existingReview?.title || '',
    content: existingReview?.content || '',
    rating: existingReview?.rating || 5,
    tags: existingReview?.tags || []
  });
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(existingReview?.tags || [])
  );
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (formData.title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    } else if (formData.content.length > 1000) {
      newErrors.content = '내용은 1000자 이내로 입력해주세요';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = '평점은 1-5 사이여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Update review - only send changed fields
        const updateData: UpdateReviewRequest = {};
        if (formData.title !== existingReview.title) updateData.title = formData.title;
        if (formData.content !== existingReview.content) updateData.content = formData.content;
        if (formData.rating !== existingReview.rating) updateData.rating = formData.rating;
        if (JSON.stringify(formData.tags) !== JSON.stringify(existingReview.tags)) {
          updateData.tags = formData.tags;
        }
        await onSubmit(updateData);
      } else {
        // Create new review
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('리뷰 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = new Set(selectedTags);
    
    if (newSelectedTags.has(tagId)) {
      // 태그 제거
      newSelectedTags.delete(tagId);
    } else {
      // 태그 추가 전 검증
      if (newSelectedTags.size >= TAG_SELECTION_RULES.maxTags) {
        alert(`최대 ${TAG_SELECTION_RULES.maxTags}개의 태그만 선택할 수 있습니다.`);
        return;
      }
      
      // 같은 카테고리 태그 개수 확인
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
    setFormData(prev => ({ ...prev, tags: Array.from(newSelectedTags) }));
  };

  const getSelectedTagsCount = () => {
    return selectedTags.size;
  };

  const getCategoryTagCount = (category: ReviewTagCategory) => {
    return Array.from(selectedTags).filter(
      id => REVIEW_TAGS[id].category === category
    ).length;
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="form-title">
        {existingReview ? '리뷰 수정' : '리뷰 작성'}
      </h3>

      {!existingReview && (
        <div className="form-group">
          <label htmlFor="review-type">리뷰 유형</label>
          <select
            id="review-type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ReviewType }))}
          >
            <option value={ReviewType.OVERALL}>종합 리뷰</option>
            <option value={ReviewType.CONTENT}>콘텐츠 리뷰</option>
            <option value={ReviewType.OPERATION}>운영 리뷰</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="review-rating">평점</label>
        <div className="rating-selector">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              className={`star-button ${star <= formData.rating ? 'filled' : ''}`}
              onClick={() => handleRatingClick(star)}
            >
              ★
            </button>
          ))}
          <span className="rating-text">{formData.rating}점</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="review-title">제목 *</label>
        <input
          id="review-title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="리뷰 제목을 입력해주세요"
          maxLength={100}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
        <span className="char-count">{formData.title.length}/100</span>
      </div>

      <div className="form-group">
        <label htmlFor="review-content">내용 *</label>
        <textarea
          id="review-content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="스터디 경험을 자유롭게 작성해주세요"
          rows={6}
          maxLength={1000}
        />
        {errors.content && <span className="error-message">{errors.content}</span>}
        <span className="char-count">{formData.content.length}/1000</span>
      </div>

      <div className="form-group">
        <label>태그 선택 (선택)</label>
        <div className="tag-selection-info">
          <span>최대 {TAG_SELECTION_RULES.maxTags}개 선택 가능</span>
          <span className="selected-count">
            {getSelectedTagsCount()}개 선택됨
          </span>
        </div>
        
        {/* 선택된 태그 표시 */}
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
        
        {/* 태그 선택기 */}
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
                        (getSelectedTagsCount() >= TAG_SELECTION_RULES.maxTags ||
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
          onClick={onCancel}
          className="cancel-button"
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '제출 중...' : existingReview ? '수정하기' : '작성하기'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
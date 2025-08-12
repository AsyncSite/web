import React, { useState, useEffect } from 'react';
import { ReviewType, CreateReviewRequest, UpdateReviewRequest, ReviewResponse } from '../../api/reviewService';
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
  const [tagInput, setTagInput] = useState('');
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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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
        <label htmlFor="review-tags">태그 (선택)</label>
        <div className="tag-input-wrapper">
          <input
            id="review-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder="태그를 입력하고 Enter를 누르세요"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="add-tag-button"
          >
            추가
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="tag-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag-chip">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
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
import React, { useState } from 'react';
import './SectionForms.css';

interface Review {
  author: string;
  rating: number;
  content: string;
  date?: string;
  avatar?: string;
}

interface ReviewsSectionFormProps {
  initialData?: {
    title?: string;
    reviews?: Review[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ReviewsSectionForm: React.FC<ReviewsSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '참가자 후기');
  const [reviews, setReviews] = useState<Review[]>(
    initialData.reviews || [
      { author: '', rating: 5, content: '', date: '', avatar: '' }
    ]
  );

  const handleAddReview = () => {
    setReviews([...reviews, { author: '', rating: 5, content: '', date: '', avatar: '' }]);
  };

  const handleRemoveReview = (index: number) => {
    if (reviews.length > 1) {
      const newReviews = reviews.filter((_, i) => i !== index);
      setReviews(newReviews);
    }
  };

  const handleReviewChange = (index: number, field: keyof Review, value: any) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    setReviews(newReviews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty reviews
    const validReviews = reviews.filter(review => review.author && review.content);
    
    if (validReviews.length === 0) {
      // Validation failed - at least one review is required
      return;
    }

    onSave({
      title,
      reviews: validReviews
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('참가자들의 생생한 후기');
    setReviews([
      {
        author: '김개발',
        rating: 5,
        content: '체계적인 커리큘럼과 함께하는 동료들 덕분에 알고리즘에 대한 두려움을 극복할 수 있었습니다. 특히 매주 진행되는 코드 리뷰가 큰 도움이 되었어요!',
        date: '2024-02-15',
        avatar: '/images/avatars/user1.jpg'
      },
      {
        author: '이코딩',
        rating: 5,
        content: 'DP 문제를 볼 때마다 막막했는데, 이제는 패턴을 파악하고 접근할 수 있게 되었습니다. 스터디장님의 세심한 설명이 정말 인상적이었어요.',
        date: '2024-02-10',
        avatar: '/images/avatars/user2.jpg'
      },
      {
        author: '박알고',
        rating: 4,
        content: '혼자서는 절대 완주하지 못했을 것 같은데, 함께 성장하는 분위기 덕분에 12주를 완주할 수 있었습니다. 코딩테스트 합격까지!',
        date: '2024-02-05',
        avatar: '/images/avatars/user3.jpg'
      },
      {
        author: '최데이터',
        rating: 5,
        content: 'BFS/DFS부터 그래프 이론까지, 이론과 실전을 균형있게 다뤄서 좋았습니다. 무엇보다 질문하기 편한 분위기가 최고였어요!',
        date: '2024-01-30',
        avatar: '/images/avatars/user4.jpg'
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form reviews-form">
      {/* 예시 데이터 버튼 - 우측 정렬 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <button 
          type="button" 
          onClick={loadExampleData}
          className="example-btn"
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))',
            border: '1px solid rgba(195, 232, 141, 0.3)',
            borderRadius: '6px',
            color: '#C3E88D',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(195, 232, 141, 0.2), rgba(130, 170, 255, 0.2))';
            e.currentTarget.style.borderColor = 'rgba(195, 232, 141, 0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(195, 232, 141, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))';
            e.currentTarget.style.borderColor = 'rgba(195, 232, 141, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          예시 데이터 불러오기
        </button>
      </div>

      <div className="form-group">
        <label>섹션 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 참가자들의 생생한 후기"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>후기 목록</label>
        
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="item-header">
                <h4>후기 {index + 1}</h4>
                {reviews.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(index)}
                    className="remove-btn"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="item-fields">
                <div className="field-row">
                  <div className="field">
                    <label>작성자 *</label>
                    <input
                      type="text"
                      value={review.author}
                      onChange={(e) => handleReviewChange(index, 'author', e.target.value)}
                      placeholder="예: 김개발"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="field">
                    <label>평점 *</label>
                    <select
                      value={review.rating}
                      onChange={(e) => handleReviewChange(index, 'rating', parseInt(e.target.value))}
                      className="form-select"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5점)</option>
                      <option value={4}>⭐⭐⭐⭐ (4점)</option>
                      <option value={3}>⭐⭐⭐ (3점)</option>
                      <option value={2}>⭐⭐ (2점)</option>
                      <option value={1}>⭐ (1점)</option>
                    </select>
                  </div>
                </div>
                
                <div className="field">
                  <label>후기 내용 *</label>
                  <textarea
                    value={review.content}
                    onChange={(e) => handleReviewChange(index, 'content', e.target.value)}
                    placeholder="예: 체계적인 커리큘럼과 함께하는 동료들 덕분에..."
                    className="form-textarea"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="field-row">
                  <div className="field">
                    <label>작성일</label>
                    <input
                      type="date"
                      value={review.date}
                      onChange={(e) => handleReviewChange(index, 'date', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="field">
                    <label>프로필 이미지 URL</label>
                    <input
                      type="text"
                      value={review.avatar}
                      onChange={(e) => handleReviewChange(index, 'avatar', e.target.value)}
                      placeholder="예: /images/avatars/user.jpg"
                      className="form-input"
                    />
                  </div>
                </div>
                
                {review.avatar && (
                  <div className="image-preview small">
                    <img src={review.avatar} alt={review.author} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={handleAddReview}
          className="add-btn"
        >
          + 후기 추가
        </button>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          취소
        </button>
        <button type="submit" className="save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default ReviewsSectionForm;
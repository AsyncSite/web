import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TemplateHeader, Footer } from '../components/layout';
import studyService, { Study } from '../api/studyService';
import reviewService, { CreateReviewRequest, ReviewType } from '../api/reviewService';
import './ReviewWritePage.css';

const ReviewWritePage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchStudy = async () => {
      if (!studyId) {
        navigate('/users/me');
        return;
      }

      if (!isAuthenticated) {
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
      } catch (error) {
        console.error('Failed to fetch study:', error);
        alert('스터디 정보를 불러올 수 없습니다.');
        navigate('/users/me');
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [studyId, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!study || !user) return;
    
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    
    try {
      const reviewData: CreateReviewRequest = {
        type: ReviewType.STUDY_EXPERIENCE,  // 백엔드 enum에 맞게 변경
        title: `${study.name} 리뷰`,
        rating,
        content
      };
      
      console.log('Sending review data:', reviewData);
      console.log('Study ID:', study.id);
      
      await reviewService.createReview(study.id, reviewData);
      alert('리뷰가 성공적으로 작성되었습니다!');
      navigate('/users/me');
    } catch (error: any) {
      console.error('Failed to create review:', error);
      
      if (error.response?.status === 409) {
        alert('이미 이 유형의 리뷰를 작성하셨습니다.');
      } else {
        alert('리뷰 작성 중 오류가 발생했습니다.');
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
              <h1>리뷰 작성</h1>
              <div className="study-info">
                <h2>{study.name} {study.generation > 1 && `${study.generation}기`}</h2>
                <p className="study-tagline">{study.tagline}</p>
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
                  {submitting ? '작성 중...' : '리뷰 작성하기'}
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
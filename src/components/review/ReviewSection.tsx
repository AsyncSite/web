import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import reviewService, { 
  ReviewResponse, 
  ReviewStatistics, 
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewType 
} from '../../api/reviewService';
import studyService from '../../api/studyService';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import ReviewStatisticsComponent from './ReviewStatistics';
import './Review.css';

interface ReviewSectionProps {
  studyId: string;
  studyStatus?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ studyId, studyStatus }) => {
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [myReviews, setMyReviews] = useState<ReviewResponse[]>([]);
  const [canWriteReview, setCanWriteReview] = useState<{ [key in ReviewType]: boolean }>({
    [ReviewType.OVERALL]: false,
    [ReviewType.CONTENT]: false,
    [ReviewType.OPERATION]: false,
    [ReviewType.STUDY_EXPERIENCE]: false,
    [ReviewType.WEEKLY_REFLECTION]: false,
    [ReviewType.IMPROVEMENT_SUGGESTION]: false,
    [ReviewType.LEARNING_OUTCOME]: false,
    [ReviewType.FINAL_REVIEW]: false
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStatistics();
    if (isAuthenticated && user) {
      checkMembership();
      loadMyReviews();
    }
  }, [studyId, isAuthenticated, user]);

  // 멤버십 로딩 상태 추가
  const [membershipLoading, setMembershipLoading] = useState(true);
  
  // URL 해시를 체크하여 자동으로 리뷰 폼 열기
  useEffect(() => {
    if (window.location.hash === '#write-review' && isAuthenticated) {
      // 해시가 있으면 일단 폼을 열고 멤버십은 나중에 체크
      setShowForm(true);
      // 해시 제거
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [isAuthenticated]);

  const loadStatistics = async () => {
    try {
      const stats = await reviewService.getReviewStatistics(studyId);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load review statistics:', error);
    }
  };

  const checkMembership = async () => {
    try {
      setMembershipLoading(true);
      // Check if user is a member of this study
      const myStudies = await studyService.getMyStudies();
      const isStudyMember = myStudies.some(study => study.studyId === studyId);
      setIsMember(isStudyMember);
    } catch (error) {
      console.error('Failed to check membership:', error);
    } finally {
      setMembershipLoading(false);
    }
  };

  const loadMyReviews = async () => {
    try {
      const reviews = await reviewService.getMyReviews();
      const studyReviews = reviews.filter(r => r.studyId === studyId);
      setMyReviews(studyReviews);
      
      // Check which review types can still be written
      const writtenTypes = studyReviews.map(r => r.type);
      setCanWriteReview({
        [ReviewType.OVERALL]: !writtenTypes.includes(ReviewType.OVERALL),
        [ReviewType.CONTENT]: !writtenTypes.includes(ReviewType.CONTENT),
        [ReviewType.OPERATION]: !writtenTypes.includes(ReviewType.OPERATION),
        [ReviewType.STUDY_EXPERIENCE]: !writtenTypes.includes(ReviewType.STUDY_EXPERIENCE),
        [ReviewType.WEEKLY_REFLECTION]: !writtenTypes.includes(ReviewType.WEEKLY_REFLECTION),
        [ReviewType.IMPROVEMENT_SUGGESTION]: !writtenTypes.includes(ReviewType.IMPROVEMENT_SUGGESTION),
        [ReviewType.LEARNING_OUTCOME]: !writtenTypes.includes(ReviewType.LEARNING_OUTCOME),
        [ReviewType.FINAL_REVIEW]: !writtenTypes.includes(ReviewType.FINAL_REVIEW)
      });
    } catch (error) {
      console.error('Failed to load my reviews:', error);
    }
  };

  const handleCreateReview = async (data: CreateReviewRequest | UpdateReviewRequest) => {
    try {
      await reviewService.createReview(studyId, data as CreateReviewRequest);
      setShowForm(false);
      setRefreshKey(prev => prev + 1); // Trigger list refresh
      loadStatistics(); // Reload statistics
      loadMyReviews(); // Reload my reviews
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  };

  const handleUpdateReview = async (data: CreateReviewRequest | UpdateReviewRequest) => {
    if (!editingReview) return;
    
    try {
      await reviewService.updateReview(editingReview.id, data as UpdateReviewRequest);
      setEditingReview(null);
      setShowForm(false);
      setRefreshKey(prev => prev + 1); // Trigger list refresh
      loadStatistics(); // Reload statistics
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  };

  const handleEditReview = (review: ReviewResponse) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  // Determine if review section should be shown
  const isStudyCompletedOrInProgress = studyStatus === 'COMPLETED' || studyStatus === 'IN_PROGRESS';
  const hasAnyReviews = statistics && statistics.totalReviews > 0;
  const canWriteAnyReview = Object.values(canWriteReview).some(v => v);
  
  // Show section if: study is completed/in-progress OR has reviews OR user can write review
  const shouldShowSection = isStudyCompletedOrInProgress || hasAnyReviews || (isMember && canWriteAnyReview);
  
  if (!shouldShowSection) {
    return null;
  }

  return (
    <div className="review-section">
      <div className="review-section-header">
        <h2 className="section-title">스터디 리뷰</h2>
      </div>

      {statistics && (
        <ReviewStatisticsComponent statistics={statistics} />
      )}

      {showForm && (
        <div className="review-form-container">
          <ReviewForm
            studyId={studyId}
            existingReview={editingReview || undefined}
            onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {!isAuthenticated && !hasAnyReviews && (
        <div className="review-login-prompt">
          <p>리뷰를 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}

      {isAuthenticated && !isMember && !hasAnyReviews && (
        <div className="review-member-prompt">
          <p>스터디 멤버만 리뷰를 작성할 수 있습니다.</p>
        </div>
      )}

      <ReviewList 
        key={refreshKey}
        studyId={studyId} 
        onEditReview={handleEditReview}
      />
    </div>
  );
};

export default ReviewSection;
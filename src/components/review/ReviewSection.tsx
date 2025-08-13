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
// ReviewForm 제거 - ReviewWritePage 사용
import ReviewStatisticsComponent from './ReviewStatistics';
import './Review.css';

interface ReviewSectionProps {
  studyId: string;
  studyStatus?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ studyId, studyStatus }) => {
  const { user, isLoading } = useAuth();
  // showForm과 editingReview 제거 - ReviewWritePage 사용
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
    // 인증 상태가 확정될 때까지 대기
    if (isLoading) return;
    
    loadStatistics();
    // user 존재 여부만 체크 (isAuthenticated는 토큰만 있어도 true라서 신뢰할 수 없음)
    if (user) {
      checkMembership();
      loadMyReviews();
    }
  }, [studyId, user, isLoading]);

  // 멤버십 로딩 상태 추가
  const [membershipLoading, setMembershipLoading] = useState(true);
  
  // URL 해시를 체크하여 자동으로 리뷰 폼 열기
  useEffect(() => {
    if (window.location.hash === '#write-review' && user) {
      // 해시가 있으면 일단 폼을 열고 멤버십은 나중에 체크
      // ReviewWritePage로 이동
      // 해시 제거
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [user]);

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
      // 인증 에러는 무시 (로그인하지 않은 경우)
      if (error instanceof Error && !error.message.includes('인증')) {
        console.error('Failed to load my reviews:', error);
      }
    }
  };

  // ReviewWritePage로 이동하므로 제거

  // 수정 기능 제거 - ReviewWritePage 사용

  const handleEditReview = (review: ReviewResponse) => {
    // 수정 기능은 추후 구현
    console.log('Edit review:', review);
  };

  // 폼 취소 기능 제거

  // Determine if review section should be shown
  const isStudyCompletedOrInProgress = studyStatus === 'COMPLETED' || studyStatus === 'IN_PROGRESS';
  const hasAnyReviews = statistics && statistics.totalReviews > 0;
  const canWriteAnyReview = Object.values(canWriteReview).some(v => v);
  
  // 항상 리뷰 섹션을 표시
  // 리뷰가 없어도 "아직 리뷰가 없습니다" 메시지를 보여주기 위함

  return (
    <div className="review-section">
      <div className="review-section-header">
        <h2 className="section-title">스터디 리뷰</h2>
      </div>

      {statistics && (
        <ReviewStatisticsComponent statistics={statistics} />
      )}

      {/* ReviewForm 제거 - ReviewWritePage 사용 */}

      {!user && !hasAnyReviews && (
        <div className="review-login-prompt">
          <p>리뷰를 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}

      {user && !isMember && !hasAnyReviews && (
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
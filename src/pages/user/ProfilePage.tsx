import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { parseDate } from '../../utils/studyScheduleUtils';
import Header from '../../components/layout/Header';
import PasswordChangeModal from '../../components/auth/PasswordChangeModalEnhanced';
import LogoutConfirmModal from '../../components/auth/LogoutConfirmModal';
import ProfileOnboardingModal from '../../components/auth/ProfileOnboardingModal';
import PaymentCancelModal from '../../components/payment/PaymentCancelModal';
import PaymentRequiredCard from '../../components/study/PaymentRequiredCard';
import DepositPendingCard from '../../components/study/DepositPendingCard';
import gameActivityService, { GameActivity } from '../../services/gameActivityService';
import StarBackground from '../../components/common/StarBackground';
import styles from './ProfilePage.module.css';
import studyService, { Study, StudyUpdateRequest } from '../../api/studyService';
import reviewService from '../../api/reviewService';
import { handleApiError } from '../../api/client';
import { calculateUserProfileCompleteness, getProfileCompletenessColorClass } from '../../utils/profileCompleteness';
import StudyUpdateModal from '../../components/ui/StudyUpdateModal';
import type { GroupedStudyRelations } from '../../api/types/applicationTypes';

function ProfilePage(): React.ReactNode {
  // Auth context에서 실제 사용자 정보 가져오기
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug: Check user roles
  useEffect(() => {
    if (authUser) {
      console.log('=== ProfilePage Debug ===');
      console.log('User:', authUser);
      console.log('SystemRole:', authUser.systemRole);
      console.log('Roles:', authUser.roles);
      console.log('Is Admin:', authUser?.systemRole === 'ROLE_ADMIN');
      console.log('========================');
    }
  }, [authUser]);
  
  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<'study' | 'game'>('study');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showPaymentCancelModal, setShowPaymentCancelModal] = useState(false);
  const [selectedStudyForCancel, setSelectedStudyForCancel] = useState<any>(null);
  const [gameActivities, setGameActivities] = useState<GameActivity[]>([]);
  const [gameSummary, setGameSummary] = useState<{
    totalGames: number;
    totalWins: number;
    favoriteGame?: string;
    lastActivity?: string;
  }>({ totalGames: 0, totalWins: 0 });

  // 사용자 정보 (authUser가 있으면 실제 데이터 사용)
  const user = {
    name: authUser?.name || authUser?.username || '사용자',
    profileImage: authUser?.profileImage || null,
    joinedDays: authUser?.createdAt 
      ? Math.floor((Date.now() - new Date(authUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  };

  // OAuth 가입 후 온보딩 모달 표시 체크
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showOnboarding') === 'true' && authUser) {
      // Check if this is first time showing onboarding
      const completedEmails = localStorage.getItem('asyncsite_profile_onboarding_completed_v1');
      const dismissedTime = localStorage.getItem('asyncsite_profile_onboarding_dismissed_v1');
      
      if (!completedEmails || !JSON.parse(completedEmails).includes(authUser.email)) {
        if (!dismissedTime || Date.now() - parseInt(dismissedTime) > 30 * 24 * 60 * 60 * 1000) {
          setShowOnboardingModal(true);
        }
      }
      
      // Clean up URL
      navigate('/users/me', { replace: true });
    }
  }, [location, authUser, navigate]);

  // 게임 활동 데이터 로드
  useEffect(() => {
    const loadGameData = async () => {
      const userId = authUser?.email || authUser?.username || authUser?.name;
      const activities = await gameActivityService.getGameActivities(userId);
      const summary = await gameActivityService.getGameSummary(userId);
      
      setGameActivities(activities);
      setGameSummary(summary);
    };
    
    loadGameData();
  }, [authUser]);

  // 나의 스터디 데이터
  const [myStudies, setMyStudies] = useState<{ participating: any[]; leading: any[] }>({ participating: [], leading: [] });
  const [studiesLoading, setStudiesLoading] = useState<boolean>(true);
  const [studiesError, setStudiesError] = useState<string | null>(null);
  
  // 스터디 수정 모달 관련 상태
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStudyForEdit, setSelectedStudyForEdit] = useState<Study | null>(null);
  const [studyReviews, setStudyReviews] = useState<Record<string, boolean>>({});
  const [myStudiesGrouped, setMyStudiesGrouped] = useState<GroupedStudyRelations | null>(null);
  const [participatingCollapsed, setParticipatingCollapsed] = useState<boolean>(true);
  const [leadingCollapsed, setLeadingCollapsed] = useState<boolean>(true);

  // 스터디 수정 핸들러
  const handleUpdateStudy = async (updateData: StudyUpdateRequest) => {
    if (!selectedStudyForEdit) return;

    try {
      console.log('Update study with ID:', selectedStudyForEdit.id);
      console.log('Study data:', selectedStudyForEdit);
      
      // UUID 형태인지 확인
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedStudyForEdit.id);
      console.log('Is UUID:', isUuid, selectedStudyForEdit.id);
      
      if (!isUuid) {
        toast.error('올바르지 않은 스터디 ID 형식입니다. UUID 형태의 ID가 필요합니다.');
        return;
      }
      
      await studyService.updateStudy(selectedStudyForEdit.id, updateData);
      
      // 성공 후 스터디 목록 새로고침
      const grouped = await studyService.getMyStudiesGrouped();
      setMyStudiesGrouped(grouped);
      
      toast.success('스터디 정보가 성공적으로 수정되었습니다.');
      setShowUpdateModal(false);
      setSelectedStudyForEdit(null);
    } catch (error: any) {
      console.error('스터디 수정 실패:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  useEffect(() => {
    const loadMyStudies = async () => {
      try {
        setStudiesLoading(true);
        
        // Use grouped API to get all study relationships
        const grouped = await studyService.getMyStudiesGrouped();
        console.log('My studies grouped:', grouped);
        
        setMyStudiesGrouped(grouped);
        
        // Also get memberships for backward compatibility
        const list = await studyService.getMyMemberships();
        console.log('My studies list:', list);
        const participating = list.filter(item => item.role !== 'OWNER');
        const leading = list.filter(item => item.role === 'OWNER');
        setMyStudies({ participating, leading });
        
        // 각 스터디별 리뷰 작성 여부 확인
        try {
          const myReviews = await reviewService.getMyReviews();
          console.log('=== Review Debug ===');
          console.log('My reviews:', myReviews);
          console.log('Participating studies:', participating.map(s => ({ studyId: s.studyId, title: s.studyTitle })));
          const reviewedStudies: Record<string, boolean> = {};
          myReviews.forEach((review: any) => {
            console.log(`Review type: ${review.type}, studyId: ${review.studyId}`);
            if (review.type === 'STUDY_EXPERIENCE') {
              reviewedStudies[review.studyId] = true;
            }
          });
          console.log('Reviewed studies map:', reviewedStudies);
          console.log('===================');
          setStudyReviews(reviewedStudies);
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
          // 리뷰 조회 실패해도 계속 진행
        }
      } catch (e: any) {
        console.error('Failed to load studies:', e);
        setStudiesError(handleApiError(e));
      } finally {
        setStudiesLoading(false);
      }
    };
    // 인증 상태가 확정될 때까지 대기
    if (isLoading) return;
    
    // user 존재 여부만 체크 (isAuthenticated는 신뢰할 수 없음)
    if (authUser) {
      loadMyStudies();
    }
  }, [authUser, isLoading]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  return (
    <div className={styles.profilePage}>
      {/* 투명 헤더 */}
      <Header transparent />
      
      {/* 별 배경 효과 */}
      <StarBackground />
      
      {(isLoading || !authUser) ? (
        <div className={styles.profilePageLoading}>
          <div className={styles.loadingSpinner}>로딩 중...</div>
        </div>
      ) : (
      <div className={styles.profileContainer}>
      {/* 프로필 요약 섹션 */}
      <section className={styles.profileSummary}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImage}>
            {user.profileImage ? (
              <img src={user.profileImage} alt="프로필" />
            ) : (
              <div className={styles.profilePlaceholder}>
                {user.name?.[0] || '?'}
              </div>
            )}
            {/* Admin Badge - with unique prefix to avoid conflicts */}
            {(authUser?.systemRole === 'ROLE_ADMIN' || authUser?.roles?.includes('ROLE_ADMIN') || authUser?.roles?.includes('ADMIN')) && (
              <div className={styles.profileAdminBadge} title="AsyncSite Administrator">
                <svg className={styles.profileAdminIcon} viewBox="0 0 24 24" width="18" height="18">
                  <path fill="white" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1>{greeting()}, {user.name}님!</h1>
            <p className={styles.joinInfo}>AsyncSite와 함께한 지 <span className={styles.highlight}>{user.joinedDays}일째</span></p>
          </div>
        </div>
      </section>

      {/* 프로필 완성도 카드 */}
      {(() => {
        const completeness = calculateUserProfileCompleteness(authUser);
        const colorClass = getProfileCompletenessColorClass(completeness.percentage);
        
        return completeness.percentage < 100 ? (
          <div className={styles.profileCompleteness__card__container}>
            <div className={styles.profileCompleteness__card__header}>
              <h3 className={styles.profileCompleteness__card__title}>프로필 완성도</h3>
              <span className={styles.profileCompleteness__card__percentage}>
                {completeness.percentage}%
              </span>
            </div>
            
            <div className={styles.profileCompleteness__progress__container}>
              <div 
                className={`${styles.profileCompleteness__progress__bar} ${styles[colorClass]}`}
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
            
            <div className={styles.profileCompleteness__message__container}>
              <div className={styles.profileCompleteness__message__step}>
                {completeness.nextStep}
              </div>
              <p className={styles.profileCompleteness__message__detail}>
                {completeness.message}
              </p>
            </div>
            
            <Link 
              to="/users/me/edit" 
              className={styles.profileCompleteness__action__button}
            >
              <span>프로필 완성하기</span>
              <span>→</span>
            </Link>
            
            <div className={styles.profileCompleteness__checklist}>
              {['profileImage', 'role', 'quote', 'bio'].map(field => {
                const isCompleted = completeness.completedFields.includes(field);
                const fieldLabels: Record<string, string> = {
                  profileImage: '프로필 이미지',
                  role: '역할/직책',
                  quote: '인용구',
                  bio: '스토리'
                };
                
                return (
                  <div 
                    key={field}
                    className={`${styles.profileCompleteness__checklist__item} ${
                      isCompleted ? styles.profileCompleteness__checklist__completed : ''
                    }`}
                  >
                    <span className={styles.profileCompleteness__checklist__icon}>
                      {isCompleted ? '✓' : '○'}
                    </span>
                    <span>{fieldLabels[field]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null;
      })()}

      {/* 탭 섹션 컨테이너 */}
      <div className={styles.tabSectionContainer}>
        {/* 탭 네비게이션 */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'study' ? styles.active : ''}`}
            onClick={() => setActiveTab('study')}
          >
            스터디
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'game' ? styles.active : ''}`}
            onClick={() => setActiveTab('game')}
          >
            게임 활동
          </button>
        </div>

        {/* 탭 콘텐츠 영역 */}
        <div className={styles.tabContent}>
        {/* 스터디 탭 콘텐츠 */}
        {activeTab === 'study' && (
          <section className={styles.studySection}>
            <h2>나의 스터디</h2>
            {studiesLoading ? (
              <div className={styles.studyLoadingInline}>스터디 불러오는 중…</div>
            ) : studiesError ? (
              <div className={styles.emptyState}>
                <p>스터디 정보를 불러오지 못했어요.</p>
                <p className={styles.errorDetail}>{studiesError}</p>
                <button className={styles.retryButton} onClick={() => {
                  setStudiesError(null);
                  setStudiesLoading(true);
                  (async () => {
                    try {
                      const grouped = await studyService.getMyStudiesGrouped();
                      setMyStudiesGrouped(grouped);
                      const list = await studyService.getMyMemberships();
                      const participating = list.filter(item => item.role !== 'OWNER');
                      const leading = list.filter(item => item.role === 'OWNER');
                      setMyStudies({ participating, leading });
                    } catch (err) {
                      setStudiesError(handleApiError(err));
                    } finally {
                      setStudiesLoading(false);
                    }
                  })();
                }}>다시 시도</button>
              </div>
            ) : myStudies.participating.length === 0 && myStudies.leading.length === 0 &&
                (!myStudiesGrouped || (
                  myStudiesGrouped.proposed.length === 0 &&
                  myStudiesGrouped.pending.length === 0 &&
                  myStudiesGrouped.awaitingPayment.length === 0 &&
                  myStudiesGrouped.depositPending.length === 0 &&
                  myStudiesGrouped.confirmed.length === 0
                )) ? (
              <div className={styles.emptyState}>
                <p>아직 참여 중인 스터디가 없어요</p>
                <p>스터디를 둘러보고 관심있는 주제에 참여해보세요!</p>
                <p className={styles.suggestion}>게임도 함께 즐기면서 공부하는 건 어떨까요?</p>
                <Link to="/study" className={styles.browseButton}>스터디 둘러보기</Link>
              </div>
            ) : (
              <>
                {/* 제안한 스터디 섹션 */}
                {myStudiesGrouped?.proposed && myStudiesGrouped.proposed.length > 0 && (
                  <div className={styles.studyGroup}>
                    <div className={styles.mystSectionHeader}>
                      <h3>제안한 스터디 <span className={styles.mystBadge}>{myStudiesGrouped.proposed.length}</span></h3>
                    </div>
                    <div className={styles.studyCards}>
                      {myStudiesGrouped.proposed.map((study: any) => (
                        <div 
                          key={study.studyId} 
                          className={`${styles.studyCard} ${styles.proposed} ${styles.clickable}`}
                          onClick={() => {
                            console.log('=== Study Card Clicked ===');
                            console.log('Study data:', study);
                            console.log('Study ID:', study.studyId);
                            console.log('Navigate to:', `/study/${study.studyId}/manage`);
                            console.log('==========================');
                            
                            // 스터디 관리 페이지로 이동 (승인 대기중도 관리 페이지 사용)
                            navigate(`/study/${study.studyId}/manage`);
                          }}
                          title="클릭하여 스터디 관리"
                        >
                          <h4>
                            {study.studyTitle}
                            <span className={`${styles.studyStatusBadge} ${styles.pending}`}>
                              대기중
                            </span>
                          </h4>
                          <p className={styles.studyMeta}>상태: 검토 대기중</p>
                          {study.createdAt && (
                            <p className={styles.studyMeta}>제안일: {parseDate(study.createdAt)?.toLocaleDateString() || 'Invalid Date'}</p>
                          )}
                          <div className={styles.manageHint}>
                            <span>⚙️ 클릭하여 관리</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 신청 중인 스터디 섹션 (PENDING, REJECTED만 표시) */}
                {myStudiesGrouped?.pending && myStudiesGrouped.pending.length > 0 && (
                  <div className={styles.studyGroup}>
                    <div className={styles.mystSectionHeader}>
                      <h3>신청한 스터디 <span className={styles.mystBadge}>{myStudiesGrouped.pending.length}</span></h3>
                    </div>
                    <div className={styles.studyCards}>
                      {myStudiesGrouped.pending.map((study: any) => (
                        <div 
                          key={study.applicationId || study.studyId} 
                          className={`${styles.studyCard} ${study.status === 'REJECTED' ? styles.rejected : ''} ${study.status === 'REJECTED' ? styles.clickable : ''}`}
                          onClick={() => {
                            if (study.status === 'REJECTED' && study.rejectionReason) {
                              alert(`거절 사유: ${study.rejectionReason}`);
                            }
                          }}
                          style={study.status === 'REJECTED' ? { cursor: 'pointer' } : {}}
                          title={study.status === 'REJECTED' ? '클릭하여 거절 사유 확인' : ''}
                        >
                          <h4>
                            {study.studyTitle}
                            <span className={`${styles.studyStatusBadge} ${
                              study.status === 'REJECTED' ? styles.rejected : 
                              study.status === 'PENDING' ? styles.pending : styles.pending
                            }`}>
                              {study.status === 'REJECTED' ? '거절됨' : 
                               study.status === 'PENDING' ? '대기중' : '대기중'}
                            </span>
                          </h4>
                          <p className={styles.studyMeta}>
                            상태: {study.status === 'REJECTED' ? '신청 거절됨' : 
                                  study.status === 'PENDING' ? '승인 대기중' : '승인 대기중'}
                          </p>
                          {study.appliedAt && (
                            <p className={styles.studyMeta}>신청일: {parseDate(study.appliedAt)?.toLocaleDateString() || 'Invalid Date'}</p>
                          )}
                          {study.status === 'REJECTED' && study.rejectionReason && (
                            <p className={styles.studyMeta}>💬 클릭하여 거절 사유 확인</p>
                          )}
                          {study.message && (
                            <p className={styles.studyMeta}>메시지: {study.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 결제 필요 스터디 섹션 (ACCEPTED - 사용자 액션 필요!) */}
                {myStudiesGrouped?.awaitingPayment && myStudiesGrouped.awaitingPayment.length > 0 && (
                  <div className={styles.studyGroup}>
                    <div className={styles.mystSectionHeader}>
                      <h3>
                        결제 필요
                        <span className={styles.mystBadge}>
                          {myStudiesGrouped.awaitingPayment.length}
                        </span>
                      </h3>
                    </div>
                    <div className={styles.studyCards}>
                      {myStudiesGrouped.awaitingPayment.map((application: any) => (
                        <PaymentRequiredCard
                          key={application.applicationId}
                          application={application}
                          onPaymentCreated={async () => {
                            // 결제 생성 후 목록 새로고침
                            try {
                              const grouped = await studyService.getMyStudiesGrouped();
                              setMyStudiesGrouped(grouped);
                            } catch (error) {
                              console.error('Failed to refresh studies:', error);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 입금 확인 대기 스터디 섹션 (PAYMENT_PENDING - 관리자 확인 대기) */}
                {myStudiesGrouped?.depositPending && myStudiesGrouped.depositPending.length > 0 && (
                  <div className={styles.studyGroup}>
                    <div className={styles.mystSectionHeader}>
                      <h3>
                        입금 확인 대기
                        <span className={styles.mystBadge}>
                          {myStudiesGrouped.depositPending.length}
                        </span>
                      </h3>
                    </div>
                    <div className={styles.studyCards}>
                      {myStudiesGrouped.depositPending.map((application: any) => (
                        <DepositPendingCard
                          key={application.applicationId}
                          application={application}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 참여 중인 스터디 섹션 */}
                {myStudies.participating.length > 0 && (
                <div className={styles.studyGroup}>
                  <div className={styles.mystSectionHeader}>
                    <h3>참여 중인 스터디 <span className={styles.mystBadge}>{myStudies.participating.length}</span></h3>
                    {myStudies.participating.length > 3 && (
                      <button className={styles.mystToggle} onClick={() => setParticipatingCollapsed(c => !c)}>
                        {participatingCollapsed ? '모두 보기' : '접기'}
                      </button>
                    )}
                  </div>
                  <div className={styles.studyCards}>
                    {(participatingCollapsed ? myStudies.participating.slice(0, 3) : myStudies.participating).map(study => (
                      <div key={study.memberId} className={styles.studyCard}>
                        <h4>
                          {study.studyTitle}
                          {study.studyStatus && (
                            <span className={`${styles.studyStatusBadge} ${styles[`studyStatus${study.studyStatus.toLowerCase().replace('_', '').replace('-', '')}`] || ''}`}>
                              {study.studyStatus === 'IN_PROGRESS' ? '진행중' : 
                               study.studyStatus === 'COMPLETED' ? '완료' :
                               study.studyStatus === 'APPROVED' ? '모집중' :
                               study.studyStatus === 'TERMINATED' ? '종료' : study.studyStatus}
                            </span>
                          )}
                        </h4>
                        <p className={styles.studyMeta}>역할: {study.role}</p>
                        <p className={styles.studyMeta}>참여일: {parseDate(study.joinedAt)?.toLocaleDateString() || 'Invalid Date'}</p>
                        <p className={styles.studyMeta}>출석률: {study.attendanceRate == null ? 'N/A' : `${study.attendanceRate}%`}</p>
                        {study.studyStatus === 'COMPLETED' && (
                          <div className={styles.studyActions}>
                            <button
                              className={styles.reviewActionButton}
                              onClick={() => {
                                console.log('Button clicked for study:', study.studyId);
                                console.log('studyReviews state:', studyReviews);
                                console.log('Has review?', studyReviews[study.studyId]);
                                navigate(`/study/${study.studyId}/review/write`);
                              }}
                            >
                              {studyReviews[study.studyId] ? '리뷰 수정' : '리뷰 작성'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* 내가 리드하는 스터디 섹션 */}
                {myStudies.leading.length > 0 && (
                  <div className={styles.studyGroup}>
                    <div className={styles.mystSectionHeader}>
                      <h3>내가 리드하는 스터디 <span className={styles.mystBadge}>{myStudies.leading.length}</span></h3>
                      {myStudies.leading.length > 3 && (
                        <button className={styles.mystToggle} onClick={() => setLeadingCollapsed(c => !c)}>
                          {leadingCollapsed ? '모두 보기' : '접기'}
                        </button>
                      )}
                    </div>
                    <div className={styles.studyCards}>
                      {(leadingCollapsed ? myStudies.leading.slice(0, 3) : myStudies.leading).map(study => (
                        <div 
                          key={study.memberId} 
                          className={`${styles.studyCard} ${styles.leading} ${styles.clickable}`}
                          onClick={() => {
                            console.log('=== Leading Study Card Clicked ===');
                            console.log('Study data:', study);
                            console.log('Study ID:', study.studyId);
                            console.log('Navigate to:', `/study/${study.studyId}/manage`);
                            console.log('===================================');
                            
                            // 스터디 관리 페이지로 이동
                            navigate(`/study/${study.studyId}/manage`);
                          }}
                          title="클릭하여 스터디 관리"
                          style={{ cursor: 'pointer' }}
                        >
                          <span className={styles.leaderBadge}>리더</span>
                          <h4>
                            {study.studyTitle}
                            {study.studyStatus && (
                              <span className={`${styles.studyStatusBadge} ${styles[`studyStatus${study.studyStatus.toLowerCase().replace('_', '').replace('-', '')}`] || ''}`}>
                                {study.studyStatus === 'IN_PROGRESS' ? '진행중' : 
                                 study.studyStatus === 'COMPLETED' ? '완료' :
                                 study.studyStatus === 'APPROVED' ? '모집중' :
                                 study.studyStatus === 'TERMINATED' ? '종료' : study.studyStatus}
                              </span>
                            )}
                          </h4>
                          <p className={styles.studyMeta}>시작일: {(() => {
                            if (Array.isArray(study.joinedAt)) {
                              const [year, month, day] = study.joinedAt;
                              return new Date(year, month - 1, day).toLocaleDateString('ko-KR');
                            }
                            return new Date(study.joinedAt).toLocaleDateString('ko-KR');
                          })()}</p>
                          <div className={styles.manageHint}>
                            <span>⚙️ 클릭하여 관리</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link to="/study" className={styles.viewAllLink}>모든 스터디 보기</Link>
              </>
            )}
          </section>
        )}

        {/* 게임 활동 탭 콘텐츠 */}
        {activeTab === 'game' && (
        <section className={styles.gameSection}>
          <h2>게임 활동</h2>
          
          {gameActivities.length > 0 ? (
            <>
              {/* 전체 요약 통계 */}
              {gameSummary.totalGames > 0 && (
                <div className={styles.gameSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>총 게임 횟수</span>
                    <span className={styles.summaryValue}>{gameSummary.totalGames}회</span>
                  </div>
                  {gameSummary.totalWins > 0 && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>총 승리</span>
                      <span className={styles.summaryValue}>{gameSummary.totalWins}회</span>
                    </div>
                  )}
                  {gameSummary.favoriteGame && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>즐겨하는 게임</span>
                      <span className={styles.summaryValue}>{gameSummary.favoriteGame}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className={styles.gameCards}>
                {gameActivities.map((activity, index) => (
                  <div key={index} className={styles.gameCard}>
                    <div className={styles.gameHeader}>
                      <h3>{activity.name}</h3>
                      {activity.lastPlayed && (
                        <span className={styles.lastPlayed}>마지막 플레이: {activity.lastPlayed}</span>
                      )}
                    </div>
                    <div className={styles.gameStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>플레이 횟수</span>
                        <span className={styles.statValue}>{activity.totalCount}회</span>
                      </div>
                      {activity.myRanking && activity.totalRanking && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>랭킹</span>
                          <span className={`${styles.statValue} ${styles.ranking}`}>
                            {activity.myRanking}위 / {activity.totalRanking}명
                          </span>
                        </div>
                      )}
                      {activity.wins !== undefined && activity.participations !== undefined && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>승률</span>
                          <span className={styles.statValue}>
                            {activity.participations > 0 
                              ? Math.round((activity.wins / activity.participations) * 100) 
                              : 0}%
                          </span>
                        </div>
                      )}
                      {activity.myRanking && !activity.totalRanking && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>최고 점수</span>
                          <span className={styles.statValue}>{activity.myRanking}점</span>
                        </div>
                      )}
                    </div>
                    <Link to={activity.link} className={styles.playButton}>
                      게임하러 가기
                    </Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>아직 플레이한 게임이 없어요</p>
              <p>스터디 쉬는 시간에 재미있는 게임 한 판 어떠세요?</p>
              <Link to="/lab" className={styles.browseButton}>게임 둘러보기</Link>
            </div>
          )}
        </section>
        )}
        </div>
      </div>

      {/* 설정 섹션 */}
      <section className={styles.settingsSection}>
        <h3>설정</h3>
        <nav className={styles.settingsNav}>
          <Link to="/users/me/edit">프로필 수정</Link>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowPasswordModal(true); }}>비밀번호 변경</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}>로그아웃</a>
        </nav>
      </section>

      {/* 하단 격려 메시지 */}
      <div className={styles.motivationMessage}>
        <p>오늘도 열공하세요!</p>
      </div>
      </div>
      )}
      
      {/* 모달 컴포넌트들 */}
      <PasswordChangeModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
      <ProfileOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        userName={authUser?.name || authUser?.username || ''}
        userEmail={authUser?.email || ''}
      />
      
      {/* Study Update Modal */}
      {selectedStudyForEdit && (
        <StudyUpdateModal
          study={selectedStudyForEdit}
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedStudyForEdit(null);
          }}
          onUpdate={handleUpdateStudy}
        />
      )}

      {/* Payment Cancel Modal */}
      <PaymentCancelModal
        isOpen={showPaymentCancelModal}
        onClose={() => {
          setShowPaymentCancelModal(false);
          setSelectedStudyForCancel(null);
        }}
        studyInfo={selectedStudyForCancel}
      />
    </div>
  );
}

export default ProfilePage;
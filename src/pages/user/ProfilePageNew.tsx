import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import PasswordChangeModal from '../../components/auth/PasswordChangeModalEnhanced';
import LogoutConfirmModal from '../../components/auth/LogoutConfirmModal';
import gameActivityService, { GameActivity } from '../../services/gameActivityService';
import StarBackground from '../../components/common/StarBackground';
import styles from './ProfilePage.module.css';
import studyService, { ApplicationStatus, type MyApplicationItem } from '../../api/studyService';
import reviewService from '../../api/reviewService';
import { handleApiError } from '../../api/client';

// 통합된 스터디 활동 인터페이스
interface StudyActivity {
  id: string;
  studyId: string;
  studySlug?: string;
  studyTitle: string;
  status: string;
  category: 'active' | 'pending' | 'completed' | 'leading';
  role?: string;
  joinedAt?: string;
  appliedAt?: string;
  attendanceRate?: number | null;
  hasReview?: boolean;
  applicationId?: string;
  reviewNote?: string;
}

function ProfilePage(): React.ReactNode {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // State
  const [activeTab, setActiveTab] = useState<'study' | 'game'>('study');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [gameActivities, setGameActivities] = useState<GameActivity[]>([]);
  const [gameSummary, setGameSummary] = useState<{
    totalGames: number;
    totalWins: number;
    favoriteGame?: string;
    lastActivity?: string;
  }>({ totalGames: 0, totalWins: 0 });

  // 스터디 데이터
  const [myStudies, setMyStudies] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplicationItem[]>([]);
  const [allStudies, setAllStudies] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보
  const user = {
    name: authUser?.name || authUser?.username || '사용자',
    profileImage: authUser?.profileImage || null,
    joinedDays: authUser?.createdAt 
      ? Math.floor((Date.now() - new Date(authUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  };

  // 게임 활동 데이터 로드
  useEffect(() => {
    const loadGameData = async () => {
      const userId = authUser?.email || authUser?.username || authUser?.name;
      const activities = await gameActivityService.getGameActivities(userId);
      const summary = await gameActivityService.getGameSummary(userId);
      
      setGameActivities(activities);
      setGameSummary(summary);
    };
    
    if (authUser) loadGameData();
  }, [authUser]);

  // 스터디 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const [studiesData, applicationsData, allStudiesData, reviewsData] = await Promise.all([
          studyService.getMyStudies(),
          studyService.getMyApplications(),
          studyService.getAllStudies(),
          reviewService.getMyReviews().catch(() => []) // 리뷰 API 실패해도 계속 진행
        ]);
        setMyStudies(studiesData);
        setMyApplications(applicationsData);
        setAllStudies(allStudiesData);
        setMyReviews(reviewsData);
      } catch (e: any) {
        setError(handleApiError(e));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated]);

  // 통합된 스터디 활동 데이터
  const studyActivities = useMemo((): StudyActivity[] => {
    const activities: StudyActivity[] = [];
    
    // 1. 참여 중인 스터디들 (OWNER 제외)
    myStudies.filter(s => s.role !== 'OWNER').forEach(study => {
      // Find slug from allStudies
      const fullStudy = allStudies.find(s => s.id === study.studyId);
      
      // 해당 스터디에 대한 리뷰가 있는지 체크
      const hasReview = myReviews.some((review: any) => review.studyId === study.studyId);
      
      // studyStatus 우선순위: study.studyStatus > fullStudy.status > study.isActive에 따른 추론
      let studyStatus = study.studyStatus || fullStudy?.status;
      
      // studyStatus가 없으면 isActive로 추론
      if (!studyStatus) {
        studyStatus = study.isActive ? 'IN_PROGRESS' : 'COMPLETED';
      }
      
      // 카테고리 결정
      let category: 'active' | 'completed' = 'active';
      if (studyStatus === 'COMPLETED' || studyStatus === 'TERMINATED') {
        category = 'completed';
      }
      
      activities.push({
        id: study.memberId,
        studyId: study.studyId,
        studySlug: fullStudy?.slug,
        studyTitle: study.studyTitle,
        status: studyStatus,
        category,
        role: study.role,
        joinedAt: study.joinedAt,
        attendanceRate: study.attendanceRate,
        hasReview: hasReview
      });
    });
    
    // 2. 대기 중인 신청들 (승인된 것 제외 - 이미 참여 중에 포함됨)
    myApplications
      .filter(app => app.status === ApplicationStatus.PENDING)
      .forEach(app => {
        // Find slug from allStudies
        const fullStudy = allStudies.find(s => s.id === app.studyId);
        
        activities.push({
          id: app.applicationId,
          studyId: app.studyId,
          studySlug: fullStudy?.slug,
          studyTitle: app.studyTitle,
          status: 'PENDING_APPLICATION',
          category: 'pending',
          appliedAt: app.appliedAt,
          applicationId: app.applicationId,
          reviewNote: app.reviewNote
        });
      });
    
    // 3. 리드하는 스터디들
    myStudies.filter(s => s.role === 'OWNER').forEach(study => {
      // Find slug from allStudies
      const fullStudy = allStudies.find(s => s.id === study.studyId);
      
      // studyStatus 우선순위: study.studyStatus > fullStudy.status > study.isActive에 따른 추론
      let studyStatus = study.studyStatus || fullStudy?.status;
      
      // studyStatus가 없으면 isActive로 추론
      if (!studyStatus) {
        studyStatus = study.isActive ? 'IN_PROGRESS' : 'COMPLETED';
      }
      
      activities.push({
        id: study.memberId,
        studyId: study.studyId,
        studySlug: fullStudy?.slug,
        studyTitle: study.studyTitle,
        status: studyStatus,
        category: 'leading',
        role: study.role,
        joinedAt: study.joinedAt,
        attendanceRate: study.attendanceRate
      });
    });
    
    return activities;
  }, [myStudies, myApplications, allStudies, myReviews]);

  // 카테고리별 필터링
  const categorizedActivities = useMemo(() => ({
    active: studyActivities.filter(a => a.category === 'active'),
    pending: studyActivities.filter(a => a.category === 'pending'),
    completed: studyActivities.filter(a => a.category === 'completed'),
    leading: studyActivities.filter(a => a.category === 'leading')
  }), [studyActivities]);

  // 날짜 파싱 헬퍼 함수
  const parseDate = (dateValue: string | number[] | undefined): Date | null => {
    if (!dateValue) return null;
    
    // 배열 형식 [년, 월, 일, 시, 분, 초] 처리
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    
    // ISO 문자열 형식 처리
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      'IN_PROGRESS': { label: '진행중', className: 'study-status-in-progress' },
      'COMPLETED': { label: '완료', className: 'study-status-completed' },
      'APPROVED': { label: '모집중', className: 'study-status-approved' },
      'TERMINATED': { label: '종료', className: 'study-status-terminated' },
      'PENDING_APPLICATION': { label: '심사중', className: 'study-status-pending' },
      'PENDING': { label: '대기중', className: 'study-status-pending' },
      'UNKNOWN': { label: '확인중', className: 'study-status-default' }
    };
    return statusMap[status] || { label: '확인중', className: 'study-status-default' };
  };

  const handleCancelApplication = async (studyId: string, applicationId: string) => {
    try {
      const userIdentifier = authUser?.email || authUser?.username || '';
      await studyService.cancelApplication(studyId, applicationId, userIdentifier);
      // 낙관적 업데이트
      setMyApplications(prev => prev.filter(x => x.applicationId !== applicationId));
    } catch (err) {
      console.error(err);
      alert('신청 취소에 실패했습니다.');
    }
  };

  return (
    <div className={styles['profile-page']}>
      <Header transparent />
      <StarBackground />
      
      {(isLoading || !authUser) ? (
        <div className={styles['profile-page-loading']}>
          <div className={styles['loading-spinner']}>로딩 중...</div>
        </div>
      ) : (
      <div className={styles['profile-container']}>
        {/* 프로필 요약 섹션 */}
        <section className={styles['profile-summary']}>
          <div className={styles['profile-header']}>
            <div className={styles['profile-image']}>
              {user.profileImage ? (
                <img src={user.profileImage} alt="프로필" />
              ) : (
                <div className={styles['profile-placeholder']}>
                  {user.name?.[0] || '?'}
                </div>
              )}
              {/* Admin Badge */}
              {(authUser?.systemRole === 'ROLE_ADMIN' || authUser?.roles?.includes('ROLE_ADMIN') || authUser?.roles?.includes('ADMIN')) && (
                <div className={styles['profile-admin-badge']} title="AsyncSite Administrator">
                  <svg className={styles['profile-admin-icon']} viewBox="0 0 24 24" width="18" height="18">
                    <path fill="white" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className={styles['profile-info']}>
              <h1>{greeting()}, {user.name}님!</h1>
              <p className={styles['join-info']}>AsyncSite와 함께한 지 <span className={styles.highlight}>{user.joinedDays}일째</span></p>
            </div>
          </div>
        </section>

        {/* 탭 섹션 컨테이너 */}
        <div className={styles['tab-section-container']}>
          {/* 탭 네비게이션 */}
          <div className={styles['tab-navigation']}>
            <button
              className={`${styles['tab-button']} ${activeTab === 'study' ? styles.active : ''}`}
              onClick={() => setActiveTab('study')}
            >
              스터디
            </button>
            <button
              className={`${styles['tab-button']} ${activeTab === 'game' ? styles.active : ''}`}
              onClick={() => setActiveTab('game')}
            >
              게임 활동
            </button>
          </div>

          {/* 탭 콘텐츠 영역 */}
          <div className={styles['tab-content']}>
            {/* 스터디 탭 콘텐츠 - 개선된 버전 */}
            {activeTab === 'study' && (
              <section className={styles['study-section-new']}>
                <h2 className={styles['section-main-title']}>나의 스터디 활동</h2>
                
                {loading ? (
                  <div className={styles['loading-state']}>스터디 정보를 불러오는 중...</div>
                ) : error ? (
                  <div className={styles['error-state']}>
                    <p>스터디 정보를 불러오지 못했습니다.</p>
                    <p className={styles['error-detail']}>{error}</p>
                  </div>
                ) : (
                  <div className={styles['study-categories']}>
                    {/* 진행 중인 스터디 */}
                    {categorizedActivities.active.length > 0 && (
                      <div className={styles['study-category']}>
                        <h3 className={styles['category-title']}>
                          <span className={styles['category-icon']}>🟢</span>
                          진행 중 
                          <span className={styles['category-count']}>{categorizedActivities.active.length}</span>
                        </h3>
                        <div className={styles['study-grid']}>
                          {categorizedActivities.active.map(activity => (
                            <div key={activity.id} className={styles['study-card-new']}>
                              <div className={styles['study-card-header']}>
                                <h4 className={styles['study-name']}>{activity.studyTitle}</h4>
                                <span className={`${styles['status-badge']} ${styles[getStatusBadge(activity.status).className]}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className={styles['study-card-meta']}>
                                {activity.role && <p>역할: {activity.role}</p>}
                                {activity.joinedAt && parseDate(activity.joinedAt) && (
                                  <p>참여일: {parseDate(activity.joinedAt)!.toLocaleDateString('ko-KR')}</p>
                                )}
                                {activity.attendanceRate !== null && activity.attendanceRate !== undefined && (
                                  <p>출석률: {activity.attendanceRate}%</p>
                                )}
                              </div>
                              <div className={styles['study-card-actions']}>
                                <button 
                                  className={`${styles['action-button']} ${styles.primary}`}
                                  onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}`)}
                                >
                                  스터디 페이지
                                </button>
                                <button 
                                  className={`${styles['action-button']} ${styles.review}`}
                                  onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}/review/write`)}
                                >
                                  {activity.hasReview ? '리뷰 수정' : '리뷰 작성'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 대기 중인 신청 */}
                    {categorizedActivities.pending.length > 0 && (
                      <div className={styles['study-category']}>
                        <h3 className={styles['category-title']}>
                          <span className={styles['category-icon']}>🟡</span>
                          대기 중
                          <span className={styles['category-count']}>{categorizedActivities.pending.length}</span>
                        </h3>
                        <div className={styles['study-grid']}>
                          {categorizedActivities.pending.map(activity => (
                            <div key={activity.id} className={styles['study-card-new']}>
                              <div className={styles['study-card-header']}>
                                <h4 className={styles['study-name']}>{activity.studyTitle}</h4>
                                <span className={`${styles['status-badge']} ${styles[getStatusBadge(activity.status).className]}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className={styles['study-card-meta']}>
                                {activity.appliedAt && parseDate(activity.appliedAt) && (
                                  <p>신청일: {parseDate(activity.appliedAt)!.toLocaleDateString('ko-KR')}</p>
                                )}
                                {activity.reviewNote && <p className={styles['review-note']}>메모: {activity.reviewNote}</p>}
                              </div>
                              <div className={styles['study-card-actions']}>
                                <button 
                                  className={`${styles['action-button']} ${styles.cancel}`}
                                  onClick={() => handleCancelApplication(activity.studyId, activity.applicationId!)}
                                >
                                  신청 취소
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 완료된 스터디 */}
                    {categorizedActivities.completed.length > 0 && (
                      <div className={styles['study-category']}>
                        <h3 className={styles['category-title']}>
                          <span className={styles['category-icon']}>✅</span>
                          완료됨
                          <span className={styles['category-count']}>{categorizedActivities.completed.length}</span>
                        </h3>
                        <div className={styles['study-grid']}>
                          {categorizedActivities.completed.map(activity => (
                            <div key={activity.id} className={styles['study-card-new']}>
                              <div className={styles['study-card-header']}>
                                <h4 className={styles['study-name']}>{activity.studyTitle}</h4>
                                <span className={`${styles['status-badge']} ${styles[getStatusBadge(activity.status).className]}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className={styles['study-card-meta']}>
                                {activity.joinedAt && parseDate(activity.joinedAt) && (
                                  <p>참여 기간: {parseDate(activity.joinedAt)!.toLocaleDateString('ko-KR')}</p>
                                )}
                                {activity.attendanceRate !== null && activity.attendanceRate !== undefined && (
                                  <p>최종 출석률: {activity.attendanceRate}%</p>
                                )}
                              </div>
                              <div className={styles['study-card-actions']}>
                                <button 
                                  className={`${styles['action-button']} ${styles.review}`}
                                  onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}/review/write`)}
                                >
                                  {activity.hasReview ? '리뷰 수정' : '리뷰 작성'}
                                </button>
                                {activity.hasReview && (
                                  <button 
                                    className={`${styles['action-button']} ${styles.secondary}`}
                                    onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}#reviews`)}
                                  >
                                    내 리뷰 보기
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 리드하는 스터디 */}
                    {categorizedActivities.leading.length > 0 && (
                      <div className={styles['study-category']}>
                        <h3 className={styles['category-title']}>
                          <span className={styles['category-icon']}>👑</span>
                          리드 중
                          <span className={styles['category-count']}>{categorizedActivities.leading.length}</span>
                        </h3>
                        <div className={styles['study-grid']}>
                          {categorizedActivities.leading.map(activity => (
                            <div key={activity.id} className={styles['study-card-new'] + ' ' + styles['leading']}>
                              <div className={styles['leader-badge']}>리더</div>
                              <div className={styles['study-card-header']}>
                                <h4 className={styles['study-name']}>{activity.studyTitle}</h4>
                                <span className={`${styles['status-badge']} ${styles[getStatusBadge(activity.status).className]}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className={styles['study-card-meta']}>
                                {activity.joinedAt && parseDate(activity.joinedAt) && (
                                  <p>생성일: {parseDate(activity.joinedAt)!.toLocaleDateString('ko-KR')}</p>
                                )}
                              </div>
                              <div className={styles['study-card-actions']}>
                                <button 
                                  className={styles['action-button'] + ' ' + styles['manage']}
                                  onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}/manage`)}
                                >
                                  {activity.status === 'COMPLETED' ? '리뷰 관리' : '스터디 관리'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 아무 스터디도 없을 때 */}
                    {studyActivities.length === 0 && (
                      <div className={styles['empty-state']}>
                        <p>아직 참여 중인 스터디가 없어요</p>
                        <p>스터디를 둘러보고 관심있는 주제에 참여해보세요!</p>
                        <Link to="/study" className={styles['browse-button']}>스터디 둘러보기</Link>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* 게임 활동 탭 콘텐츠 */}
            {activeTab === 'game' && (
              <section className={styles['game-section']}>
                <h2>게임 활동</h2>
                
                {gameActivities.length > 0 ? (
                  <>
                    {gameSummary.totalGames > 0 && (
                      <div className={styles['game-summary']}>
                        <div className={styles['summary-item']}>
                          <span className={styles['summary-label']}>총 게임 횟수</span>
                          <span className={styles['summary-value']}>{gameSummary.totalGames}회</span>
                        </div>
                        {gameSummary.totalWins > 0 && (
                          <div className={styles['summary-item']}>
                            <span className={styles['summary-label']}>총 승리</span>
                            <span className={styles['summary-value']}>{gameSummary.totalWins}회</span>
                          </div>
                        )}
                        {gameSummary.favoriteGame && (
                          <div className={styles['summary-item']}>
                            <span className={styles['summary-label']}>즐겨하는 게임</span>
                            <span className={styles['summary-value']}>{gameSummary.favoriteGame}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={styles['game-cards']}>
                      {gameActivities.map((activity, index) => (
                        <div key={index} className={styles['game-card']}>
                          <div className={styles['game-header']}>
                            <h3>{activity.name}</h3>
                            {activity.lastPlayed && (
                              <span className={styles['last-played']}>마지막 플레이: {activity.lastPlayed}</span>
                            )}
                          </div>
                          <div className={styles['game-stats']}>
                            <div className={styles['stat-item']}>
                              <span className={styles['stat-label']}>플레이 횟수</span>
                              <span className={styles['stat-value']}>{activity.totalCount}회</span>
                            </div>
                            {activity.myRanking && activity.totalRanking && (
                              <div className={styles['stat-item']}>
                                <span className={styles['stat-label']}>랭킹</span>
                                <span className={styles['stat-value'] + ' ' + styles['ranking']}>
                                  {activity.myRanking}위 / {activity.totalRanking}명
                                </span>
                              </div>
                            )}
                            {activity.wins !== undefined && activity.participations !== undefined && (
                              <div className={styles['stat-item']}>
                                <span className={styles['stat-label']}>승률</span>
                                <span className={styles['stat-value']}>
                                  {activity.participations > 0 
                                    ? Math.round((activity.wins / activity.participations) * 100) 
                                    : 0}%
                                </span>
                              </div>
                            )}
                          </div>
                          <Link to={activity.link} className={styles['play-button']}>
                            게임하러 가기
                          </Link>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles['empty-state']}>
                    <p>아직 플레이한 게임이 없어요</p>
                    <p>스터디 쉬는 시간에 재미있는 게임 한 판 어떠세요?</p>
                    <Link to="/lab" className={styles['browse-button']}>게임 둘러보기</Link>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* 설정 섹션 */}
        <section className={styles['settings-section']}>
          <h3>설정</h3>
          <nav className={styles['settings-nav']}>
            <Link to="/users/me/edit">프로필 수정</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowPasswordModal(true); }}>비밀번호 변경</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}>로그아웃</a>
          </nav>
        </section>

        {/* 하단 격려 메시지 */}
        <div className={styles['motivation-message']}>
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
    </div>
  );
}

export default ProfilePage;
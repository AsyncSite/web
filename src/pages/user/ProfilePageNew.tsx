import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import PasswordChangeModal from '../../components/auth/PasswordChangeModalEnhanced';
import LogoutConfirmModal from '../../components/auth/LogoutConfirmModal';
import gameActivityService, { GameActivity } from '../../services/gameActivityService';
import StarBackground from '../../components/common/StarBackground';
import './ProfilePage.css';
import studyService, { ApplicationStatus, type MyApplicationItem } from '../../api/studyService';
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
        const [studiesData, applicationsData, allStudiesData] = await Promise.all([
          studyService.getMyStudies(),
          studyService.getMyApplications(),
          studyService.getAllStudies()
        ]);
        setMyStudies(studiesData);
        setMyApplications(applicationsData);
        setAllStudies(allStudiesData);
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
      
      // studyStatus가 IN_PROGRESS면 active, COMPLETED면 completed
      let category: 'active' | 'completed' = 'active';
      if (study.studyStatus === 'COMPLETED' || study.studyStatus === 'TERMINATED') {
        category = 'completed';
      }
      
      activities.push({
        id: study.memberId,
        studyId: study.studyId,
        studySlug: fullStudy?.slug,
        studyTitle: study.studyTitle,
        status: study.studyStatus || 'UNKNOWN',
        category,
        role: study.role,
        joinedAt: study.joinedAt,
        attendanceRate: study.attendanceRate,
        hasReview: false // TODO: 실제 리뷰 여부 체크
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
      
      activities.push({
        id: study.memberId,
        studyId: study.studyId,
        studySlug: fullStudy?.slug,
        studyTitle: study.studyTitle,
        status: study.studyStatus || 'UNKNOWN',
        category: 'leading',
        role: study.role,
        joinedAt: study.joinedAt,
        attendanceRate: study.attendanceRate
      });
    });
    
    return activities;
  }, [myStudies, myApplications, allStudies]);

  // 카테고리별 필터링
  const categorizedActivities = useMemo(() => ({
    active: studyActivities.filter(a => a.category === 'active'),
    pending: studyActivities.filter(a => a.category === 'pending'),
    completed: studyActivities.filter(a => a.category === 'completed'),
    leading: studyActivities.filter(a => a.category === 'leading')
  }), [studyActivities]);

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
      'PENDING_APPLICATION': { label: '심사중', className: 'study-status-pending' }
    };
    return statusMap[status] || { label: status, className: 'study-status-default' };
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
    <div className="profile-page">
      <Header transparent />
      <StarBackground />
      
      {(isLoading || !authUser) ? (
        <div className="profile-page-loading">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      ) : (
      <div className="profile-container">
        {/* 프로필 요약 섹션 */}
        <section className="profile-summary">
          <div className="profile-header">
            <div className="profile-image">
              {user.profileImage ? (
                <img src={user.profileImage} alt="프로필" />
              ) : (
                <div className="profile-placeholder">
                  {user.name?.[0] || '?'}
                </div>
              )}
              {/* Admin Badge */}
              {(authUser?.systemRole === 'ROLE_ADMIN' || authUser?.roles?.includes('ROLE_ADMIN') || authUser?.roles?.includes('ADMIN')) && (
                <div className="profile-admin-badge" title="AsyncSite Administrator">
                  <svg className="profile-admin-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="white" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{greeting()}, {user.name}님!</h1>
              <p className="join-info">AsyncSite와 함께한 지 <span className="highlight">{user.joinedDays}일째</span></p>
            </div>
          </div>
        </section>

        {/* 탭 섹션 컨테이너 */}
        <div className="tab-section-container">
          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'study' ? 'active' : ''}`}
              onClick={() => setActiveTab('study')}
            >
              스터디
            </button>
            <button
              className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}
              onClick={() => setActiveTab('game')}
            >
              게임 활동
            </button>
          </div>

          {/* 탭 콘텐츠 영역 */}
          <div className="tab-content">
            {/* 스터디 탭 콘텐츠 - 개선된 버전 */}
            {activeTab === 'study' && (
              <section className="study-section-new">
                <h2 className="section-main-title">나의 스터디 활동</h2>
                
                {loading ? (
                  <div className="loading-state">스터디 정보를 불러오는 중...</div>
                ) : error ? (
                  <div className="error-state">
                    <p>스터디 정보를 불러오지 못했습니다.</p>
                    <p className="error-detail">{error}</p>
                  </div>
                ) : (
                  <div className="study-categories">
                    {/* 진행 중인 스터디 */}
                    {categorizedActivities.active.length > 0 && (
                      <div className="study-category">
                        <h3 className="category-title">
                          <span className="category-icon">🟢</span>
                          진행 중 
                          <span className="category-count">{categorizedActivities.active.length}</span>
                        </h3>
                        <div className="study-grid">
                          {categorizedActivities.active.map(activity => (
                            <div key={activity.id} className="study-card-new">
                              <div className="study-card-header">
                                <h4 className="study-name">{activity.studyTitle}</h4>
                                <span className={`status-badge ${getStatusBadge(activity.status).className}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className="study-card-meta">
                                {activity.role && <p>역할: {activity.role}</p>}
                                {activity.joinedAt && <p>참여일: {new Date(activity.joinedAt).toLocaleDateString()}</p>}
                                {activity.attendanceRate !== null && activity.attendanceRate !== undefined && (
                                  <p>출석률: {activity.attendanceRate}%</p>
                                )}
                              </div>
                              <div className="study-card-actions">
                                <button 
                                  className="action-button primary"
                                  onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}`)}
                                >
                                  스터디 페이지
                                </button>
                                {!activity.hasReview && (
                                  <button 
                                    className="action-button review"
                                    onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}/review/write`)}
                                  >
                                    리뷰 작성
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 대기 중인 신청 */}
                    {categorizedActivities.pending.length > 0 && (
                      <div className="study-category">
                        <h3 className="category-title">
                          <span className="category-icon">🟡</span>
                          대기 중
                          <span className="category-count">{categorizedActivities.pending.length}</span>
                        </h3>
                        <div className="study-grid">
                          {categorizedActivities.pending.map(activity => (
                            <div key={activity.id} className="study-card-new">
                              <div className="study-card-header">
                                <h4 className="study-name">{activity.studyTitle}</h4>
                                <span className={`status-badge ${getStatusBadge(activity.status).className}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className="study-card-meta">
                                {activity.appliedAt && <p>신청일: {new Date(activity.appliedAt).toLocaleDateString()}</p>}
                                {activity.reviewNote && <p className="review-note">메모: {activity.reviewNote}</p>}
                              </div>
                              <div className="study-card-actions">
                                <button 
                                  className="action-button cancel"
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
                      <div className="study-category">
                        <h3 className="category-title">
                          <span className="category-icon">✅</span>
                          완료됨
                          <span className="category-count">{categorizedActivities.completed.length}</span>
                        </h3>
                        <div className="study-grid">
                          {categorizedActivities.completed.map(activity => (
                            <div key={activity.id} className="study-card-new">
                              <div className="study-card-header">
                                <h4 className="study-name">{activity.studyTitle}</h4>
                                <span className={`status-badge ${getStatusBadge(activity.status).className}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className="study-card-meta">
                                {activity.joinedAt && <p>참여 기간: {new Date(activity.joinedAt).toLocaleDateString()}</p>}
                                {activity.attendanceRate !== null && activity.attendanceRate !== undefined && (
                                  <p>최종 출석률: {activity.attendanceRate}%</p>
                                )}
                              </div>
                              <div className="study-card-actions">
                                {!activity.hasReview ? (
                                  <button 
                                    className="action-button review"
                                    onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}/review/write`)}
                                  >
                                    리뷰 작성
                                  </button>
                                ) : (
                                  <button 
                                    className="action-button secondary"
                                    onClick={() => navigate(`/study/${activity.studySlug || activity.studyId}#reviews`)}
                                  >
                                    리뷰 보기
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
                      <div className="study-category">
                        <h3 className="category-title">
                          <span className="category-icon">👑</span>
                          리드 중
                          <span className="category-count">{categorizedActivities.leading.length}</span>
                        </h3>
                        <div className="study-grid">
                          {categorizedActivities.leading.map(activity => (
                            <div key={activity.id} className="study-card-new leading">
                              <div className="leader-badge">리더</div>
                              <div className="study-card-header">
                                <h4 className="study-name">{activity.studyTitle}</h4>
                                <span className={`status-badge ${getStatusBadge(activity.status).className}`}>
                                  {getStatusBadge(activity.status).label}
                                </span>
                              </div>
                              <div className="study-card-meta">
                                {activity.joinedAt && <p>생성일: {new Date(activity.joinedAt).toLocaleDateString()}</p>}
                              </div>
                              <div className="study-card-actions">
                                <button 
                                  className="action-button manage"
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
                      <div className="empty-state">
                        <p>아직 참여 중인 스터디가 없어요</p>
                        <p>스터디를 둘러보고 관심있는 주제에 참여해보세요!</p>
                        <Link to="/study" className="browse-button">스터디 둘러보기</Link>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* 게임 활동 탭 콘텐츠 */}
            {activeTab === 'game' && (
              <section className="game-section">
                <h2>게임 활동</h2>
                
                {gameActivities.length > 0 ? (
                  <>
                    {gameSummary.totalGames > 0 && (
                      <div className="game-summary">
                        <div className="summary-item">
                          <span className="summary-label">총 게임 횟수</span>
                          <span className="summary-value">{gameSummary.totalGames}회</span>
                        </div>
                        {gameSummary.totalWins > 0 && (
                          <div className="summary-item">
                            <span className="summary-label">총 승리</span>
                            <span className="summary-value">{gameSummary.totalWins}회</span>
                          </div>
                        )}
                        {gameSummary.favoriteGame && (
                          <div className="summary-item">
                            <span className="summary-label">즐겨하는 게임</span>
                            <span className="summary-value">{gameSummary.favoriteGame}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="game-cards">
                      {gameActivities.map((activity, index) => (
                        <div key={index} className="game-card">
                          <div className="game-header">
                            <h3>{activity.name}</h3>
                            {activity.lastPlayed && (
                              <span className="last-played">마지막 플레이: {activity.lastPlayed}</span>
                            )}
                          </div>
                          <div className="game-stats">
                            <div className="stat-item">
                              <span className="stat-label">플레이 횟수</span>
                              <span className="stat-value">{activity.totalCount}회</span>
                            </div>
                            {activity.myRanking && activity.totalRanking && (
                              <div className="stat-item">
                                <span className="stat-label">랭킹</span>
                                <span className="stat-value ranking">
                                  {activity.myRanking}위 / {activity.totalRanking}명
                                </span>
                              </div>
                            )}
                            {activity.wins !== undefined && activity.participations !== undefined && (
                              <div className="stat-item">
                                <span className="stat-label">승률</span>
                                <span className="stat-value">
                                  {activity.participations > 0 
                                    ? Math.round((activity.wins / activity.participations) * 100) 
                                    : 0}%
                                </span>
                              </div>
                            )}
                          </div>
                          <Link to={activity.link} className="play-button">
                            게임하러 가기
                          </Link>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>아직 플레이한 게임이 없어요</p>
                    <p>스터디 쉬는 시간에 재미있는 게임 한 판 어떠세요?</p>
                    <Link to="/lab" className="browse-button">게임 둘러보기</Link>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* 설정 섹션 */}
        <section className="settings-section">
          <h3>설정</h3>
          <nav className="settings-nav">
            <Link to="/users/me/edit">프로필 수정</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowPasswordModal(true); }}>비밀번호 변경</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}>로그아웃</a>
          </nav>
        </section>

        {/* 하단 격려 메시지 */}
        <div className="motivation-message">
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
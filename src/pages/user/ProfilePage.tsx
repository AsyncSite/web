import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import PasswordChangeModal from '../../components/auth/PasswordChangeModal';
import LogoutConfirmModal from '../../components/auth/LogoutConfirmModal';
import gameActivityService, { GameActivity } from '../../services/gameActivityService';
import StarBackground from '../../components/common/StarBackground';
import './ProfilePage.css';

function ProfilePage(): React.ReactNode {
  // Auth context에서 실제 사용자 정보 가져오기
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
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
  
  // 로딩 중이거나 사용자 정보가 없는 경우 로딩 화면 표시
  if (isLoading || !authUser) {
    return (
      <div className="profile-page-loading">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }
  
  // 탭 상태 관리
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

  // 사용자 정보 (authUser가 있으면 실제 데이터 사용)
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
    
    loadGameData();
  }, [authUser]);

  // 테스트를 위한 토글 변수 (true: 데이터 있음, false: 빈 상태)
  const hasData = true; // false로 변경하면 빈 상태를 볼 수 있습니다
  
  const studies = hasData ? {
    participating: [
      { id: 1, name: 'React 심화 스터디', members: 12, nextMeeting: '내일' },
      { id: 2, name: '알고리즘 스터디', members: 8, nextMeeting: '목요일' },
    ],
    leading: [
      { id: 3, name: 'TypeScript 입문', members: 15, nextMeeting: '수요일' },
    ],
  } : {
    participating: [],
    leading: [],
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  return (
    <div className="profile-page">
      {/* 투명 헤더 */}
      <Header transparent />
      
      {/* 별 배경 효과 */}
      <StarBackground />
      
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
            {/* Admin Badge - with unique prefix to avoid conflicts */}
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
        {/* 스터디 탭 콘텐츠 */}
        {activeTab === 'study' && (
          <section className="study-section">
            <h2>나의 스터디</h2>
            
            {studies.participating.length === 0 && studies.leading.length === 0 ? (
              <div className="empty-state">
                <p>아직 참여 중인 스터디가 없어요</p>
                <p>스터디를 둘러보고 관심있는 주제에 참여해보세요!</p>
                <p className="suggestion">게임도 함께 즐기면서 공부하는 건 어떨까요?</p>
                <Link to="/study" className="browse-button">스터디 둘러보기</Link>
              </div>
            ) : (
              <>
                <div className="study-group">
                  <h3>참여 중인 스터디 ({studies.participating.length})</h3>
                  <div className="study-cards">
                    {studies.participating.map(study => (
                      <div key={study.id} className="study-card">
                        <h4>{study.name}</h4>
                        <p className="study-meta">멤버 {study.members}명</p>
                        <p className="next-meeting">다음 모임: {study.nextMeeting}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {studies.leading.length > 0 && (
                  <div className="study-group">
                    <h3>내가 리드하는 스터디 ({studies.leading.length})</h3>
                    <div className="study-cards">
                      {studies.leading.map(study => (
                        <div key={study.id} className="study-card leading">
                          <span className="leader-badge">리더</span>
                          <h4>{study.name}</h4>
                          <p className="study-meta">멤버 {study.members}명</p>
                          <p className="next-meeting">다음 모임: {study.nextMeeting}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link to="/study" className="view-all-link">→ 모든 스터디 보기</Link>
              </>
            )}
          </section>
        )}

        {/* 게임 활동 탭 콘텐츠 */}
        {activeTab === 'game' && (
        <section className="game-section">
          <h2>게임 활동</h2>
          
          {gameActivities.length > 0 ? (
            <>
              {/* 전체 요약 통계 */}
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
                      {activity.myRanking && !activity.totalRanking && (
                        <div className="stat-item">
                          <span className="stat-label">최고 점수</span>
                          <span className="stat-value">{activity.myRanking}점</span>
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
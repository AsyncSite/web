import React, { useState } from 'react';
import './ProfilePage.css';

interface GameActivity {
  name: string;
  gamesPlayed: number;
  lastPlayed: string;
}

interface SpotlightArenaActivity extends GameActivity {
  ranking: number;
  totalPlayers: number;
  winRate: number;
}

interface TeamShuffleActivity extends GameActivity {
  favoriteTeamSize: number;
}

interface GameActivities {
  spotlightArena?: SpotlightArenaActivity;
  teamShuffle?: TeamShuffleActivity;
}

const ProfilePage: React.FC = () => {
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<'study' | 'game'>('study');

  // 임시 데이터 (나중에 API에서 가져올 예정)
  const user = {
    name: '김스터디',
    profileImage: null,
    joinedDays: 42,
  };

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

  // 게임 활동 데이터
  const gameActivities: GameActivities = hasData ? {
    spotlightArena: {
      name: 'Spotlight Arena',
      gamesPlayed: 23,
      ranking: 5,
      totalPlayers: 128,
      winRate: 65,
      lastPlayed: '2일 전',
    },
    teamShuffle: {
      name: 'Team Shuffle',
      gamesPlayed: 15,
      favoriteTeamSize: 4,
      lastPlayed: '1주일 전',
    },
  } : {};

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  return (
    <div className="profile-container">
      {/* 프로필 요약 섹션 */}
      <section className="profile-summary">
        <div className="profile-header">
          <div className="profile-image">
            {user.profileImage ? (
              <img src={user.profileImage} alt="프로필" />
            ) : (
              <div className="profile-placeholder">
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{greeting()}, {user.name}님!</h1>
            <p className="join-info">AsyncSite와 함께한 지 <span className="highlight">{user.joinedDays}일째</span> 🎉</p>
          </div>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'study' ? 'active' : ''}`}
          onClick={() => setActiveTab('study')}
        >
          📚 스터디
        </button>
        <button
          className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🎮 게임 활동
        </button>
      </div>

      {/* 스터디 탭 콘텐츠 */}
      {activeTab === 'study' && (
        <>
          <section className="study-section">
            <h2>📚 나의 스터디</h2>
            
            {studies.participating.length === 0 && studies.leading.length === 0 ? (
              <div className="empty-state">
                <p>아직 참여 중인 스터디가 없어요 🌱</p>
                <p>스터디를 둘러보고 관심있는 주제에 참여해보세요!</p>
                <p className="suggestion">게임도 함께 즐기면서 공부하는 건 어떨까요?</p>
                <a href="/study" className="browse-button">스터디 둘러보기</a>
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

                <a href="/study" className="view-all-link">→ 모든 스터디 보기</a>
              </>
            )}
          </section>
        </>
      )}

      {/* 게임 활동 탭 콘텐츠 */}
      {activeTab === 'game' && (
        <section className="game-section">
          <h2>🎮 게임 활동</h2>
          
          {gameActivities.spotlightArena || gameActivities.teamShuffle ? (
            <div className="game-cards">
              {gameActivities.spotlightArena && (
                <div className="game-card">
                  <div className="game-header">
                    <h3>{gameActivities.spotlightArena.name}</h3>
                    <span className="last-played">마지막 플레이: {gameActivities.spotlightArena.lastPlayed}</span>
                  </div>
                  <div className="game-stats">
                    <div className="stat-item">
                      <span className="stat-label">랭킹</span>
                      <span className="stat-value ranking">
                        {gameActivities.spotlightArena.ranking}위 / {gameActivities.spotlightArena.totalPlayers}명
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">승률</span>
                      <span className="stat-value">{gameActivities.spotlightArena.winRate}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">플레이 횟수</span>
                      <span className="stat-value">{gameActivities.spotlightArena.gamesPlayed}회</span>
                    </div>
                  </div>
                  <a href="/lab/spotlight-arena" className="play-button">게임하러 가기</a>
                </div>
              )}

              {gameActivities.teamShuffle && (
                <div className="game-card">
                  <div className="game-header">
                    <h3>{gameActivities.teamShuffle.name}</h3>
                    <span className="last-played">마지막 플레이: {gameActivities.teamShuffle.lastPlayed}</span>
                  </div>
                  <div className="game-stats">
                    <div className="stat-item">
                      <span className="stat-label">플레이 횟수</span>
                      <span className="stat-value">{gameActivities.teamShuffle.gamesPlayed}회</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">선호 팀 크기</span>
                      <span className="stat-value">{gameActivities.teamShuffle.favoriteTeamSize}인</span>
                    </div>
                  </div>
                  <a href="/lab/team-shuffle" className="play-button">게임하러 가기</a>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>아직 플레이한 게임이 없어요 🎯</p>
              <p>스터디 쉬는 시간에 재미있는 게임 한 판 어떠세요?</p>
              <a href="/lab" className="browse-button">게임 둘러보기</a>
            </div>
          )}
        </section>
      )}

      {/* 설정 섹션 */}
      <section className="settings-section">
        <h3>⚙️ 설정</h3>
        <nav className="settings-nav">
          <a href="/user/me/edit">프로필 수정</a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('비밀번호 변경 모달 예정'); }}>비밀번호 변경</a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('로그아웃 기능 예정'); }}>로그아웃</a>
        </nav>
      </section>

      {/* 하단 격려 메시지 */}
      <div className="motivation-message">
        <p>오늘도 열공하세요! 💪</p>
      </div>
    </div>
  );
};

export default ProfilePage;
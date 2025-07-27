import React, { useState, useEffect } from 'react';
import { getGameManager, LeaderboardEntry } from '../../../../../services/game';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DeductionLeaderboard.css';

interface DeductionLeaderboardProps {
  isVisible: boolean;
  onClose?: () => void;
}

const DeductionLeaderboard: React.FC<DeductionLeaderboardProps> = ({ isVisible, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [personalBest, setPersonalBest] = useState<number>(0);

  useEffect(() => {
    if (isVisible && isAuthenticated) {
      loadLeaderboard();
      loadPersonalBest();
    }
  }, [isVisible, isAuthenticated]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const gameManager = getGameManager();
      const result = await gameManager.getLeaderboard('DEDUCTION', 100);
      
      if (result.success) {
        setEntries(result.data);
      } else {
        setError('리더보드를 불러오는데 실패했습니다');
      }
    } catch (err) {
      setError('리더보드 로딩 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalBest = async () => {
    try {
      const gameManager = getGameManager();
      const result = await gameManager.getPersonalBest('DEDUCTION');
      if (result.success) {
        setPersonalBest(result.data);
      }
    } catch (err) {
      console.error('Failed to load personal best:', err);
    }
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTierInfo = (additionalData?: Record<string, any>) => {
    const hintTier = additionalData?.hintTier || 'UNKNOWN';
    
    switch (hintTier) {
      case 'PURE':
        return { icon: '🏆', className: 'tier-pure', label: '퓨어' };
      case 'STRATEGIC':
        return { icon: '💡', className: 'tier-strategic', label: '전략적' };
      case 'ASSISTED':
        return { icon: '🔍', className: 'tier-assisted', label: '어시스트' };
      default:
        return { icon: '❓', className: 'tier-unknown', label: '알 수 없음' };
    }
  };

  const getOpponentInfo = (additionalData?: Record<string, any>) => {
    if (!additionalData) return '-';
    
    const opponentType = additionalData.opponentType;
    if (opponentType === 'AI') {
      const difficulty = additionalData.opponentDifficulty || 'unknown';
      const difficultyMap: Record<string, string> = {
        easy: '쉬움',
        medium: '보통',
        hard: '어려움'
      };
      return `AI (${difficultyMap[difficulty] || difficulty})`;
    } else if (opponentType === 'HUMAN') {
      return additionalData.opponentId || '사람';
    }
    return '-';
  };

  const filteredEntries = entries.filter(entry => {
    if (difficultyFilter === 'ALL') return true;
    const difficulty = entry.additionalData?.difficulty?.toUpperCase();
    return difficulty === difficultyFilter;
  });

  if (!isVisible) return null;

  return (
    <div className="deduction-leaderboard-overlay" onClick={onClose}>
      <div className="deduction-leaderboard" onClick={e => e.stopPropagation()}>
        <div className="leaderboard-header">
          <h2>리더보드</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>

        {/* Personal Best Display */}
        {isAuthenticated && (
          <div className="personal-best-section">
            <h3>개인 최고 기록</h3>
            <div className="personal-best-score">
              {personalBest > 0 ? (
                <>
                  <span className="score-label">최고 점수:</span>
                  <span className="score-value">{personalBest.toLocaleString()}</span>
                </>
              ) : (
                <span className="no-score">아직 기록이 없습니다</span>
              )}
            </div>
          </div>
        )}

        <div className="difficulty-filter">
          <button 
            className={difficultyFilter === 'ALL' ? 'active' : ''}
            onClick={() => setDifficultyFilter('ALL')}
          >
            전체
          </button>
          <button 
            className={difficultyFilter === 'EASY' ? 'active' : ''}
            onClick={() => setDifficultyFilter('EASY')}
          >
            쉬움
          </button>
          <button 
            className={difficultyFilter === 'MEDIUM' ? 'active' : ''}
            onClick={() => setDifficultyFilter('MEDIUM')}
          >
            보통
          </button>
          <button 
            className={difficultyFilter === 'HARD' ? 'active' : ''}
            onClick={() => setDifficultyFilter('HARD')}
          >
            어려움
          </button>
        </div>

        <div className="leaderboard-content">
          <h3>전체 순위</h3>
          
          {!isAuthenticated && (
            <div className="guest-notice">
              <p>리더보드는 로그인한 사용자만 확인할 수 있습니다.</p>
              <p>추리 게임의 재미는 다른 플레이어와의 경쟁에 있습니다!</p>
              <button 
                className="login-button"
                onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
              >
                로그인하기
              </button>
            </div>
          )}
          
          {isAuthenticated && loading && <div className="loading">로딩 중...</div>}
          {isAuthenticated && error && <div className="error">{error}</div>}
          
          {isAuthenticated && !loading && !error && filteredEntries.length === 0 && (
            <div className="empty">아직 기록이 없습니다</div>
          )}

          {isAuthenticated && !loading && !error && filteredEntries.length > 0 && (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>플레이어</th>
                  <th>티어</th>
                  <th>점수</th>
                  <th>턴</th>
                  <th>시간</th>
                  <th>힌트</th>
                  <th>난이도</th>
                  <th>상대</th>
                  <th>날짜</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => {
                  const tierInfo = getTierInfo(entry.additionalData);
                  const isWin = entry.additionalData?.won;
                  
                  return (
                    <tr key={index} className={`${tierInfo.className} ${!isWin ? 'lost-game' : ''} ${entry.userName === user?.username ? 'current-user' : ''}`}>
                      <td className="rank">#{entry.rank}</td>
                      <td className="player">{entry.userName}</td>
                      <td className="tier">
                        <span className="tier-badge">
                          {tierInfo.icon} {tierInfo.label}
                        </span>
                      </td>
                      <td className="score">{entry.score.toLocaleString()}</td>
                      <td className="turns">{entry.additionalData?.guessesCount || '-'}</td>
                      <td className="time">{formatTime(entry.additionalData?.timeElapsedSeconds)}</td>
                      <td className="hints">
                        오답: {entry.additionalData?.wrongAnswerHintsUsed || 0} / 정답: {entry.additionalData?.correctAnswerHintsUsed || 0}
                      </td>
                      <td className="difficulty">
                        <span className={`difficulty-badge diff-${entry.additionalData?.difficulty?.toLowerCase()}`}>
                          {entry.additionalData?.difficulty === 'easy' ? '쉬움' : 
                           entry.additionalData?.difficulty === 'medium' ? '보통' : 
                           entry.additionalData?.difficulty === 'hard' ? '어려움' : '-'}
                        </span>
                      </td>
                      <td className="opponent">{getOpponentInfo(entry.additionalData)}</td>
                      <td className="date">{new Date(entry.playedAt).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="leaderboard-footer">
          <div className="legend">
            <div className="legend-item">
              <span className="tier-badge">🏆 퓨어</span>
              <span>힌트 사용 안함</span>
            </div>
            <div className="legend-item">
              <span className="tier-badge">💡 전략적</span>
              <span>오답 힌트만 사용</span>
            </div>
            <div className="legend-item">
              <span className="tier-badge">🔍 어시스트</span>
              <span>정답 힌트 사용</span>
            </div>
          </div>
          <button 
            className="close-button-bottom"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeductionLeaderboard;
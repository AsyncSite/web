import { useState, useEffect } from 'react';
import { gameHistoryService } from '../shared/services';
import { GameHistory, GameHistoryFilter } from '../shared/types/storage';
import './GameHistoryViewer.css';

interface GameHistoryViewerProps {
  onBack: () => void;
  onSelectParticipant?: (participantId: string) => void;
}

const GameHistoryViewer: React.FC<GameHistoryViewerProps> = ({ onBack, onSelectParticipant }) => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [filter, setFilter] = useState<GameHistoryFilter>({});
  const [selectedGame, setSelectedGame] = useState<GameHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const games =
        filter && Object.keys(filter).length > 0
          ? gameHistoryService.getFilteredGames(filter)
          : gameHistoryService.getRecentGames(50);
      setHistory(games);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'snail-race':
        return '🐌';
      case 'slot-machine':
        return '🎰';
      case 'dart-wheel':
        return '🎯';
      default:
        return '🎮';
    }
  };

  const getGameTypeName = (gameType: string) => {
    switch (gameType) {
      case 'snail-race':
        return '달팽이 레이스';
      case 'slot-machine':
        return '슬롯머신';
      case 'dart-wheel':
        return '다트 휠';
      default:
        return gameType;
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 게임 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      gameHistoryService.clearAllHistory();
      loadHistory();
    }
  };

  return (
    <div className="game-history-viewer">
      <div className="history-header">
        <button className="back-button" onClick={onBack}>
          ← 돌아가기
        </button>
        <h2>게임 히스토리</h2>
        <button className="clear-button" onClick={handleClearHistory}>
          🗑️ 전체 삭제
        </button>
      </div>

      <div className="history-filters">
        <select
          value={filter.gameType || ''}
          onChange={(e) => setFilter({ ...filter, gameType: e.target.value || undefined })}
        >
          <option value="">모든 게임</option>
          <option value="snail-race">달팽이 레이스</option>
          <option value="slot-machine">슬롯머신</option>
          <option value="dart-wheel">다트 휠</option>
        </select>

        <input
          type="date"
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
            setFilter({ ...filter, startDate: date });
          }}
        />

        <button onClick={() => setFilter({})}>필터 초기화</button>
      </div>

      {isLoading ? (
        <div className="loading">불러오는 중...</div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <p>게임 기록이 없습니다.</p>
          <p>게임을 플레이하면 여기에 기록이 표시됩니다.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((game) => (
            <div key={game.id} className="history-item" onClick={() => setSelectedGame(game)}>
              <div className="game-icon">{getGameTypeIcon(game.gameType)}</div>
              <div className="game-info">
                <div className="game-title">{getGameTypeName(game.gameType)}</div>
                <div className="game-meta">
                  {formatDate(game.timestamp)} • {game.participants.length}명 참가 •{' '}
                  {formatDuration(game.duration)}
                </div>
              </div>
              <div className="winners-preview">🏆 {game.winners.map((w) => w.name).join(', ')}</div>
            </div>
          ))}
        </div>
      )}

      {selectedGame && (
        <div className="game-detail-modal" onClick={() => setSelectedGame(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {getGameTypeIcon(selectedGame.gameType)} {getGameTypeName(selectedGame.gameType)}
            </h3>
            <p className="game-date">{formatDate(selectedGame.timestamp)}</p>

            <div className="detail-section">
              <h4>🏆 당첨자</h4>
              <ul>
                {selectedGame.winners.map((winner, index) => (
                  <li key={winner.id}>
                    {index + 1}등: {winner.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h4>👥 전체 참가자</h4>
              <div className="participants-grid">
                {selectedGame.participants.map((p) => (
                  <span
                    key={p.id}
                    className={`participant-chip ${selectedGame.winners.some((w) => w.id === p.id) ? 'winner' : ''}`}
                    onClick={() => onSelectParticipant?.(p.id)}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>📊 게임 정보</h4>
              <p>진행 시간: {formatDuration(selectedGame.duration)}</p>
              <p>추첨 인원: {selectedGame.gameConfig.winnerCount}명</p>
            </div>

            <button className="close-button" onClick={() => setSelectedGame(null)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHistoryViewer;

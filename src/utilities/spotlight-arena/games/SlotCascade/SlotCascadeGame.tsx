import React, { useEffect } from 'react';
import { BaseGameProps } from '../../../../components/lab/utilities/spotlight-arena/shared/types/game';
import { SlotGrid } from './components/SlotGrid';
import { GameStats } from './components/GameStats';
import { useSlotCascadeGame } from './hooks/useSlotCascadeGame';
import { EVENTS } from './types/event';
import './SlotCascadeGame.css';

export const SlotCascadeGame: React.FC<BaseGameProps> = ({
  participants,
  winnerCount,
  onBack,
  onReplay,
  onNewGame,
}) => {
  const { gameState, startGame, spinPlayerSlot, spinAllPlayers } = useSlotCascadeGame({
    participants,
    onGameEnd: (winner) => {
      // 우승자 처리는 상위 컴포넌트에서 처리
    },
  });

  // 게임 시작 (3초 후)
  useEffect(() => {
    if (gameState.status === 'waiting') {
      const timer = setTimeout(() => {
        startGame();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, startGame]);


  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="slot-cascade-game">
      {/* 헤더 */}
      <div className="game-header">
        <button onClick={onBack} className="back-button-top">
          ← 뒤로가기
        </button>
        <h2 className="game-title">🎰 슬롯머신 캐스케이드</h2>
        <div className="game-info">
          <div className="spin-limit">
            스핀 제한: {gameState.config.maxSpinsPerPlayer}회
          </div>
          <div className={`game-timer ${gameState.remainingTime <= 30 ? 'final-countdown' : ''}`}>
            ⏱️ {formatTime(gameState.remainingTime)}
            {gameState.remainingTime <= 30 && <span className="countdown-label"> - FINAL COUNTDOWN!</span>}
          </div>
        </div>
      </div>

      {/* 게임 상태 메시지 */}
      {gameState.status === 'waiting' && (
        <div className="game-message">
          <h3>게임이 곧 시작됩니다!</h3>
          <p>3초 후에 슬롯머신이 돌아갑니다</p>
        </div>
      )}

      {gameState.status === 'finished' && (
        <div className="game-message">
          <h3>게임 종료!</h3>
          <p>우승자가 결정되었습니다</p>
        </div>
      )}

      {/* 이벤트 알림 */}
      {gameState.currentEvent && (
        <div className="event-notification" style={{ backgroundColor: EVENTS[gameState.currentEvent.type].color }}>
          <div className="event-icon">{EVENTS[gameState.currentEvent.type].icon}</div>
          <div className="event-info">
            <h3>{EVENTS[gameState.currentEvent.type].name}</h3>
            <p>{EVENTS[gameState.currentEvent.type].description}</p>
            {gameState.currentEvent.remainingTime > 0 && (
              <div className="event-timer">
                남은 시간: {gameState.currentEvent.remainingTime}초
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리더보드와 통계 */}
      <div className="game-info-section">
        <div className="leaderboard">
          <h3>실시간 순위</h3>
          <div className="leaderboard-list">
            {[...gameState.players]
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((player, index) => (
                <div key={player.id} className="leaderboard-item">
                  <span className="rank">{index + 1}위</span>
                  <span className="name">{player.name}</span>
                  <span className="score">{player.score.toLocaleString()}점</span>
                </div>
              ))}
          </div>
        </div>
        
        {/* 전체 게임 통계 표시 */}
        {gameState.players.length > 0 && (
          <GameStats 
            totalSpins={gameState.players.reduce((sum, p) => sum + p.stats.totalSpins, 0)}
            totalCascades={gameState.players.reduce((sum, p) => sum + p.stats.totalCascades, 0)}
            highestCombo={Math.max(...gameState.players.map(p => p.stats.highestCombo))}
            specialSymbolsTriggered={{
              bomb: gameState.players.reduce((sum, p) => sum + p.stats.specialSymbolsTriggered.bomb, 0),
              star: gameState.players.reduce((sum, p) => sum + p.stats.specialSymbolsTriggered.star, 0),
              bonus: gameState.players.reduce((sum, p) => sum + p.stats.specialSymbolsTriggered.bonus, 0),
            }}
          />
        )}
      </div>

      {/* 광역 스핀 버튼 */}
      {gameState.status === 'playing' && (
        <div className="global-spin-container">
          <button 
            className="global-spin-button"
            onClick={spinAllPlayers}
            disabled={gameState.players.every(p => p.isSpinning || p.remainingSpins <= 0)}
          >
            🎰 전체 스핀!
          </button>
          <p className="global-spin-info">
            모든 플레이어를 동시에 스핀합니다
          </p>
        </div>
      )}

      {/* 플레이어 그리드 */}
      <div className="players-grid">
        {gameState.players.map((player, index) => (
          <SlotGrid
            key={player.id}
            grid={player.grid}
            playerName={player.name}
            score={player.score}
            cascadeLevel={player.cascadeLevel}
            isSpinning={player.isSpinning}
            isPlayer={true}
            onSpin={() => spinPlayerSlot(player.id)}
            animationState={player.animationState}
            specialEffects={player.specialEffects}
            scoreUpdates={player.scoreUpdates}
            remainingSpins={player.remainingSpins}
            underdogBoost={player.underdogBoost}
            consecutiveFailures={player.consecutiveFailures}
          />
        ))}
      </div>

      {/* 컨트롤 버튼 */}
      {gameState.status === 'finished' && (
        <div className="game-controls">
          <button onClick={onReplay} className="control-button replay-button">
            다시하기
          </button>
          <button onClick={onNewGame} className="control-button new-game-button">
            새 게임
          </button>
        </div>
      )}
    </div>
  );
};
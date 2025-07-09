import React, { useEffect } from 'react';
import { BaseGameProps } from '../../../../components/lab/utilities/spotlight-arena/shared/types/game';
import { SlotGrid } from './components/SlotGrid';
import { GameStats } from './components/GameStats';
import { useSlotCascadeGame } from './hooks/useSlotCascadeGame';
import './SlotCascadeGame.css';

export const SlotCascadeGame: React.FC<BaseGameProps> = ({
  participants,
  winnerCount,
  onBack,
  onReplay,
  onNewGame,
}) => {
  const { gameState, startGame, spinPlayerSlot } = useSlotCascadeGame({
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

  // 자동 스핀 (AI 시뮬레이션 - 첫 번째 플레이어 제외)
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const spinInterval = setInterval(() => {
      gameState.players.forEach((player, index) => {
        // 첫 번째 플레이어(index === 0)는 수동으로만 스핀
        if (index > 0 && !player.isSpinning && Math.random() > 0.7) {
          spinPlayerSlot(player.id);
        }
      });
    }, 2000);

    return () => clearInterval(spinInterval);
  }, [gameState.status, gameState.players, spinPlayerSlot]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="slot-cascade-game">
      {/* 헤더 */}
      <div className="game-header">
        <h2 className="game-title">🎰 슬롯머신 캐스케이드</h2>
        <div className="game-timer">
          ⏱️ {formatTime(gameState.remainingTime)}
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
        
        {/* 첫 번째 플레이어(사용자)의 통계 표시 */}
        {gameState.players.length > 0 && (
          <GameStats 
            totalSpins={gameState.players[0].stats.totalSpins}
            totalCascades={gameState.players[0].stats.totalCascades}
            highestCombo={gameState.players[0].stats.highestCombo}
            specialSymbolsTriggered={gameState.players[0].stats.specialSymbolsTriggered}
          />
        )}
      </div>

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
            isPlayer={index === 0}
            onSpin={index === 0 ? () => spinPlayerSlot(player.id) : undefined}
            animationState={player.animationState}
            specialEffects={player.specialEffects}
            scoreUpdates={player.scoreUpdates}
          />
        ))}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="game-controls">
        <button onClick={onBack} className="control-button back-button">
          뒤로가기
        </button>
        {gameState.status === 'finished' && (
          <>
            <button onClick={onReplay} className="control-button replay-button">
              다시하기
            </button>
            <button onClick={onNewGame} className="control-button new-game-button">
              새 게임
            </button>
          </>
        )}
      </div>
    </div>
  );
};
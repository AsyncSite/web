import React, { useState } from 'react';
import { PlayerState } from '../types/game';
import { BetType, BET_ODDS, PlayerBet, BettingState } from '../types/betting';
import './BettingPanel.css';

interface BettingPanelProps {
  players: PlayerState[];
  bettingState: BettingState;
  onPlaceBet: (bet: PlayerBet) => void;
  onStartGame: () => void;
}

export const BettingPanel: React.FC<BettingPanelProps> = ({
  players,
  bettingState,
  onPlaceBet,
  onStartGame,
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [selectedBetType, setSelectedBetType] = useState<BetType>('myRank');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [targetValue, setTargetValue] = useState<number>(0);
  const [playerBettingComplete, setPlayerBettingComplete] = useState<Record<string, boolean>>({});

  const currentPlayer = players[currentPlayerIndex];

  const handlePlaceBet = () => {
    if (!selectedBetType || !currentPlayer) return;

    // 베팅 타입에 따라 유효성 검사
    if (['myRank', 'myScore', 'totalScore', 'highestCombo'].includes(selectedBetType)) {
      if (targetValue <= 0) {
        alert('목표 값을 입력해주세요!');
        return;
      }
    }

    const bet: PlayerBet = {
      playerId: currentPlayer.id, // 현재 베팅하는 플레이어의 ID
      betType: selectedBetType,
      betAmount: 1000, // 고정 금액
      betTarget: selectedPlayer || targetValue,
      odds: calculateOdds(selectedBetType, selectedPlayer, targetValue),
    };

    onPlaceBet(bet);
    
    // 베팅 후 자동으로 다음 플레이어로 이동
    setPlayerBettingComplete(prev => ({
      ...prev,
      [currentPlayer.id]: true
    }));
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
    
    // 베팅 후 초기화
    setTargetValue(0);
    setSelectedPlayer('');
  };

  const handleSkipBetting = () => {
    setPlayerBettingComplete(prev => ({
      ...prev,
      [currentPlayer.id]: true
    }));
    
    // 다음 플레이어로
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setTargetValue(0);
      setSelectedPlayer('');
    }
  };


  const calculateOdds = (type: BetType, playerId?: string, value?: number): number => {
    let baseOdds = BET_ODDS[type].base;
    
    // 플레이어 수와 타입에 따른 배당률 조정
    if (type === 'myRank' && value) {
      // 순위가 높을수록 배당률 증가
      if (value === 1) baseOdds = players.length * 0.8;
      else if (value === 2) baseOdds = players.length * 0.6;
      else if (value === 3) baseOdds = players.length * 0.4;
      else baseOdds = players.length * 0.3;
    }
    
    return baseOdds;
  };

  const allPlayersComplete = players.every(p => playerBettingComplete[p.id]);
  const currentPlayerBets = bettingState.bets.filter(bet => bet.playerId === currentPlayer?.id);
  const hasCurrentPlayerBet = currentPlayer && playerBettingComplete[currentPlayer.id];

  // 모든 플레이어가 베팅을 완료했으면 게임 시작
  if (allPlayersComplete && players.length > 0) {
    return (
      <div className="betting-panel">
        <div className="betting-complete">
          <h3>🎉 모든 플레이어가 베팅을 완료했습니다!</h3>
          
          {/* 전체 베팅 요약 */}
          <div className="all-players-bets">
            <h4>전체 베팅 현황</h4>
            {players.map(player => {
              const playerBets = bettingState.bets.filter(bet => bet.playerId === player.id);
              return (
                <div key={player.id} className="player-bet-summary">
                  <h5>{player.name}</h5>
                  {playerBets.length === 0 ? (
                    <p>베팅 없음</p>
                  ) : (
                    <div className="bet-list">
                      {playerBets.map((bet, index) => (
                        <div key={index} className="bet-item">
                          <span>{BET_ODDS[bet.betType].description}</span>
                          <span>1,000원</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <button
            className="start-game-button"
            onClick={onStartGame}
          >
            게임 시작!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="betting-panel">
      <div className="betting-header">
        <h3>🎰 {currentPlayer?.name}님의 베팅 차례</h3>
        <div className="betting-progress">
          <span>진행: {currentPlayerIndex + 1} / {players.length}</span>
        </div>
      </div>

      {/* 베팅 타입 선택 */}
      <div className="bet-types">
        {Object.entries(BET_ODDS).map(([type, info]) => (
          <button
            key={type}
            className={`bet-type-button ${selectedBetType === type ? 'selected' : ''}`}
            onClick={() => setSelectedBetType(type as BetType)}
          >
            <div className="bet-type-name">{info.description}</div>
            <div className="bet-type-odds">배당 x{info.base}</div>
          </button>
        ))}
      </div>


      {/* 목표값 입력 (필요한 경우) */}
      {selectedBetType !== 'megaJackpot' && (
        <div className="target-value-input">
          <h4>
            {selectedBetType === 'myRank' && '예상 순위 (1~4)'}
            {selectedBetType === 'myScore' && '예상 점수 (천 단위)'}
            {selectedBetType === 'totalScore' && '전체 점수 합계 (만 단위)'}
            {selectedBetType === 'highestCombo' && '최고 콤보 수'}
          </h4>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            placeholder="값 입력"
            min={selectedBetType === 'myRank' ? "1" : "0"}
            max={selectedBetType === 'myRank' ? "4" : undefined}
            step={selectedBetType === 'myScore' ? "1000" : selectedBetType === 'totalScore' ? "10000" : "1"}
          />
          {selectedBetType === 'myScore' && (
            <span className="range-info">±10,000점 범위</span>
          )}
        </div>
      )}


      {/* 예상 배당 */}
      <div className="potential-payout">
        <span>예상 배당 (베팅금액: 1,000):</span>
        <span className="payout-amount">
          {(1000 * calculateOdds(selectedBetType, selectedPlayer, targetValue)).toLocaleString()}
        </span>
      </div>

      {/* 베팅 버튼 */}
      <div className="bet-actions">
        <button
          className="place-bet-button"
          onClick={handlePlaceBet}
          disabled={hasCurrentPlayerBet}
        >
          {hasCurrentPlayerBet ? '베팅 완료' : '베팅하기'}
        </button>
      </div>

      {/* 현재 플레이어의 베팅 목록 */}
      {currentPlayerBets.length > 0 && (
        <div className="my-bets">
          <h4>{currentPlayer?.name}님의 베팅 목록</h4>
          <div className="bet-list">
            {currentPlayerBets.map((bet, index) => (
              <div key={index} className="bet-item">
                <span>{BET_ODDS[bet.betType].description}</span>
                {bet.betTarget && typeof bet.betTarget === 'string' && (
                  <span>{players.find(p => p.id === bet.betTarget)?.name}</span>
                )}
                {bet.betTarget && typeof bet.betTarget === 'number' && (
                  <span>{bet.betTarget.toLocaleString()}점</span>
                )}
                <span>1,000</span>
                <span>x{bet.odds}</span>
              </div>
            ))}
          </div>
          <div className="total-potential">
            <span>총 예상 배당:</span>
            <span>{currentPlayerBets.reduce((sum, bet) => sum + (1000 * bet.odds), 0).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* 플레이어 액션 버튼 - 아직 베팅하지 않은 경우에만 표시 */}
      {!hasCurrentPlayerBet && (
        <div className="player-actions">
          <button
            className="skip-button"
            onClick={handleSkipBetting}
          >
            패스 (베팅 안함)
          </button>
        </div>
      )}
    </div>
  );
};
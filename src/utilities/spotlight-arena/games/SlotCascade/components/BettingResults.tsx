import React from 'react';
import { PlayerBet, BettingResult } from '../types/betting';
import { PlayerState } from '../types/game';
import './BettingResults.css';

interface BettingResultsProps {
  results?: BettingResult[];
  totalWinnings?: number;
  players: PlayerState[];
}

export const BettingResults: React.FC<BettingResultsProps> = ({ results, totalWinnings, players }) => {
  if (!results || results.length === 0) return null;

  // 플레이어별로 결과 그룹화
  const resultsByPlayer = results.reduce<Record<string, BettingResult[]>>((acc, result) => {
    const playerId = result.bet.playerId;
    if (!acc[playerId]) acc[playerId] = [];
    acc[playerId].push(result);
    return acc;
  }, {});

  return (
    <div className="betting-results">
      <h3>🎲 베팅 결과</h3>
      
      {/* 플레이어별 결과 표시 */}
      {players.map(player => {
        const playerResults = resultsByPlayer[player.id] || [];
        if (playerResults.length === 0) return null;
        
        const playerTotalBet = playerResults.reduce((sum, r) => sum + r.bet.betAmount, 0);
        const playerTotalWin = playerResults.reduce((sum, r) => sum + r.payout, 0);
        const playerProfit = playerTotalWin - playerTotalBet;
        
        return (
          <div key={player.id} className="player-result-section">
            <h4>{player.name}</h4>
            <div className="results-list">
              {playerResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`result-item ${result.isWon ? 'won' : 'lost'}`}
                >
                  <div className="bet-info">
                    <span className="bet-type">{getBetTypeLabel(result.bet.betType)}</span>
                    <span className="bet-amount">{result.bet.betAmount.toLocaleString()}원</span>
                  </div>
                  <div className="result-status">
                    {result.isWon ? (
                      <>
                        <span className="status-label">✅ 성공!</span>
                        <span className="payout">+{result.payout.toLocaleString()}원</span>
                      </>
                    ) : (
                      <span className="status-label">❌ 실패</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="player-summary">
              <span>순수익:</span>
              <span className={playerProfit > 0 ? 'profit' : 'loss'}>
                {playerProfit > 0 ? '+' : ''}{playerProfit.toLocaleString()}원
              </span>
            </div>
          </div>
        );
      })}

      <div className="total-summary">
        <div className="summary-row">
          <span>전체 베팅 금액:</span>
          <span>{results.reduce((sum, r) => sum + r.bet.betAmount, 0).toLocaleString()}원</span>
        </div>
        <div className="summary-row highlight">
          <span>전체 배당금:</span>
          <span className="profit">
            {results.reduce((sum, r) => sum + r.payout, 0).toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
};

const getBetTypeLabel = (betType: string): string => {
  const labels: Record<string, string> = {
    winner: '1등 예측',
    top3: '상위 3명',
    exactScore: '정확한 점수',
    highestCombo: '최고 콤보',
    totalScore: '전체 점수',
    underdog: '언더독 우승',
    megaJackpot: '메가 잭팟',
  };
  return labels[betType] || betType;
};
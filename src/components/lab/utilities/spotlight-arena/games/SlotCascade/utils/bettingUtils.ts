import { PlayerState } from '../types/game';
import { PlayerBet, BetType } from '../types/betting';

/**
 * 베팅 결과 확인
 */
export const checkBetResult = (
  bet: PlayerBet,
  players: PlayerState[],
  gameEnded: boolean
): { isWon: boolean; payout: number } => {
  if (!gameEnded) return { isWon: false, payout: 0 };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  const bettingPlayer = players.find(p => p.id === bet.playerId);
  if (!bettingPlayer) return { isWon: false, payout: 0 };

  switch (bet.betType) {
    case 'myRank':
      // 내 순위 예측
      const myRank = sortedPlayers.findIndex(p => p.id === bet.playerId) + 1;
      if (myRank === bet.betTarget) {
        return { isWon: true, payout: bet.betAmount * bet.odds };
      }
      break;

    case 'myScore':
      // 내 점수 범위 (±10,000)
      const targetScore = bet.betTarget as number;
      const scoreDiff = Math.abs(bettingPlayer.score - targetScore);
      if (scoreDiff <= 10000) {
        return { isWon: true, payout: bet.betAmount * bet.odds };
      }
      break;

    case 'totalScore':
      // 전체 점수 합계 (±50,000)
      const targetTotal = bet.betTarget as number;
      const totalDiff = Math.abs(totalScore - targetTotal);
      if (totalDiff <= 50000) {
        return { isWon: true, payout: bet.betAmount * bet.odds };
      }
      break;

    case 'highestCombo':
      // 최고 콤보 수 맞추기
      const highestCombo = Math.max(...players.map(p => p.stats.highestCombo));
      if (highestCombo === bet.betTarget) {
        return { isWon: true, payout: bet.betAmount * bet.odds };
      }
      break;

    case 'megaJackpot':
      // 메가 잭팟 달성 (50,000점 이상)
      if (bettingPlayer.score >= 50000) {
        return { isWon: true, payout: bet.betAmount * bet.odds };
      }
      break;
  }

  return { isWon: false, payout: 0 };
};

/**
 * 동적 배당률 계산
 */
export const calculateDynamicOdds = (
  betType: BetType,
  players: PlayerState[],
  targetPlayer?: string,
  targetValue?: number
): number => {
  const baseOdds = {
    myRank: 3.0,
    myScore: 5.0,
    totalScore: 4.0,
    highestCombo: 6.0,
    megaJackpot: 8.0,
  };

  let odds = baseOdds[betType];

  // 플레이어 수에 따른 조정
  if (betType === 'myRank') {
    // 순위가 높을수록 배당률 증가
    if (targetValue === 1) odds = players.length * 0.8;
    else if (targetValue === 2) odds = players.length * 0.6;
    else if (targetValue === 3) odds = players.length * 0.4;
    else odds = players.length * 0.3;
  }

  return Math.round(odds * 10) / 10; // 소수점 1자리로 반올림
};

/**
 * 베팅 요약 생성
 */
export const generateBettingSummary = (bets: PlayerBet[]): {
  totalBetAmount: number;
  potentialPayout: number;
  betsByType: Record<BetType, number>;
} => {
  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.betAmount, 0);
  const potentialPayout = bets.reduce((sum, bet) => sum + (bet.betAmount * bet.odds), 0);
  
  const betsByType = bets.reduce((acc, bet) => {
    acc[bet.betType] = (acc[bet.betType] || 0) + 1;
    return acc;
  }, {} as Record<BetType, number>);

  return {
    totalBetAmount,
    potentialPayout,
    betsByType,
  };
};
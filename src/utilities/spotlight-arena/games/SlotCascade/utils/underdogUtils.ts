import { PlayerState } from '../types/game';

// 점수 차이에 따른 부스트 배율
export const getScoreGapBonus = (playerScore: number, topScore: number): number => {
  const gap = topScore - playerScore;
  
  if (gap < 10000) return 1.0;      // 10,000점 미만 차이
  if (gap < 30000) return 1.5;      // 10,000-30,000점 차이
  if (gap < 50000) return 2.0;      // 30,000-50,000점 차이
  return 3.0;                        // 50,000점 이상 차이
};

// 연속 실패 보너스 계산
export const getFailureBonus = (consecutiveFailures: number): number => {
  if (consecutiveFailures >= 3) return 2.0;  // 3회 이상 연속 실패 시 2배
  return 1.0;
};

// 순위에 따른 부스트 계산
export const getRankBoost = (rank: number, totalPlayers: number): number => {
  // 최하위 플레이어에게 추가 부스트
  if (rank === totalPlayers) return 1.5;
  // 하위 30%에게 부스트
  if (rank > totalPlayers * 0.7) return 1.2;
  return 1.0;
};

// 전체 언더독 부스트 계산
export const calculateUnderdogBoost = (
  player: PlayerState,
  allPlayers: PlayerState[]
): number => {
  // 현재 플레이어 순위 계산
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);
  const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1;
  const topScore = sortedPlayers[0]?.score || 0;
  
  // 각 부스트 요소 계산
  const scoreGapBonus = getScoreGapBonus(player.score, topScore);
  const failureBonus = getFailureBonus(player.consecutiveFailures);
  const rankBoost = getRankBoost(rank, allPlayers.length);
  
  // 최종 부스트 배율 (곱셈이 아닌 가중 평균으로 계산)
  const totalBoost = (scoreGapBonus * 0.4 + failureBonus * 0.4 + rankBoost * 0.2);
  
  // 최대 4배로 제한
  return Math.min(totalBoost, 4.0);
};

// 캐스케이드 배율에 언더독 부스트 적용
export const applyUnderdogBoostToCascade = (
  baseMultiplier: number,
  underdogBoost: number
): number => {
  // 언더독일수록 캐스케이드 배율 증가
  return baseMultiplier * (1 + (underdogBoost - 1) * 0.5);
};
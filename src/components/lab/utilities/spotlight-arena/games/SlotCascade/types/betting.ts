// 베팅 타입
export type BetType = 
  | 'myRank'         // 내 순위 예측 (1등, 2등, 3등, 4등)
  | 'myScore'        // 내 점수 범위
  | 'totalScore'     // 전체 점수 합계
  | 'highestCombo'   // 최고 콤보 수
  | 'megaJackpot';   // 메가 잭팟 달성 여부

// 베팅 옵션
export interface BetOption {
  type: BetType;
  playerId?: string;      // 플레이어 지정 베팅
  targetValue?: number;   // 목표값 (점수 등)
  odds: number;          // 배당률
}

// 플레이어 베팅
export interface PlayerBet {
  playerId: string;
  betType: BetType;
  betAmount: number;
  betTarget?: string | number; // 베팅 대상 (플레이어 ID 또는 값)
  odds: number;
  isWon?: boolean;
  payout?: number;
}

// 베팅 설정
export interface BettingConfig {
  minBet: number;
  maxBet: number;
  defaultBet: number;
}

// 베팅 결과
export interface BettingResult {
  bet: PlayerBet;
  isWon: boolean;
  payout: number;
}

// 베팅 상태
export interface BettingState {
  bets: PlayerBet[];
  totalBetAmount: number;
  potentialPayout: number;
  config: BettingConfig;
  isBettingClosed: boolean;
  results?: BettingResult[];
  totalWinnings?: number;
}

// 기본 베팅 설정
export const DEFAULT_BETTING_CONFIG: BettingConfig = {
  minBet: 100,
  maxBet: 10000,
  defaultBet: 1000,
};

// 베팅 타입별 기본 배당률
export const BET_ODDS: Record<BetType, { base: number; description: string }> = {
  myRank: { base: 3.0, description: '내 순위 예측' },
  myScore: { base: 5.0, description: '내 점수 범위' },
  totalScore: { base: 4.0, description: '전체 점수 합계' },
  highestCombo: { base: 6.0, description: '최고 콤보 수' },
  megaJackpot: { base: 8.0, description: '메가 잭팟 달성' },
};
// 심볼 타입 정의
export type SymbolType = 'cherry' | 'lemon' | 'orange' | 'grape' | 'bell' | 'diamond' | 'wild' | 'bomb' | 'star' | 'bonus';

// 심볼 정보 인터페이스
export interface SymbolInfo {
  type: SymbolType;
  icon: string;
  points: number;
  isSpecial: boolean;
}

// 심볼 목록
export const SYMBOLS: Record<SymbolType, SymbolInfo> = {
  cherry: { type: 'cherry', icon: '🍒', points: 10, isSpecial: false },
  lemon: { type: 'lemon', icon: '🍋', points: 20, isSpecial: false },
  orange: { type: 'orange', icon: '🍊', points: 30, isSpecial: false },
  grape: { type: 'grape', icon: '🍇', points: 40, isSpecial: false },
  bell: { type: 'bell', icon: '🔔', points: 50, isSpecial: false },
  diamond: { type: 'diamond', icon: '💎', points: 100, isSpecial: false },
  wild: { type: 'wild', icon: '⚡', points: 0, isSpecial: true },
  bomb: { type: 'bomb', icon: '💣', points: 0, isSpecial: true },
  star: { type: 'star', icon: '🌟', points: 0, isSpecial: true },
  bonus: { type: 'bonus', icon: '🎁', points: 0, isSpecial: true },
};

// 그리드에서 심볼의 위치
export interface SymbolPosition {
  row: number;
  col: number;
  symbol: SymbolType | null;
}

// 매칭된 심볼 그룹
export interface MatchGroup {
  positions: SymbolPosition[];
  symbolType: SymbolType;
  points: number;
}
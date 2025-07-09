import { SymbolType, SYMBOLS } from '../types/symbol';

// 일반 심볼만 필터링
const NORMAL_SYMBOLS: SymbolType[] = Object.keys(SYMBOLS)
  .filter(key => !SYMBOLS[key as SymbolType].isSpecial) as SymbolType[];

// 특수 심볼 출현 확률
const SPECIAL_SYMBOL_CHANCE = 0.1; // 10%

/**
 * 랜덤 심볼 생성
 */
export const generateRandomSymbol = (): SymbolType => {
  // 특수 심볼 확률 체크
  if (Math.random() < SPECIAL_SYMBOL_CHANCE) {
    const specialSymbols: SymbolType[] = ['wild', 'bomb', 'star', 'bonus'];
    return specialSymbols[Math.floor(Math.random() * specialSymbols.length)];
  }
  
  // 일반 심볼 반환
  return NORMAL_SYMBOLS[Math.floor(Math.random() * NORMAL_SYMBOLS.length)];
};

/**
 * 초기 그리드 생성
 */
export const generateInitialGrid = (size: number): SymbolType[][] => {
  const grid: SymbolType[][] = [];
  
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = generateRandomSymbol();
    }
  }
  
  return grid;
};

/**
 * 심볼이 매칭 가능한지 확인 (와일드 카드 고려)
 */
export const canMatch = (symbol1: SymbolType, symbol2: SymbolType): boolean => {
  if (symbol1 === symbol2) return true;
  if (symbol1 === 'wild' || symbol2 === 'wild') return true;
  return false;
};

/**
 * 심볼의 점수 계산
 */
export const calculateSymbolPoints = (symbolType: SymbolType, count: number = 1): number => {
  const symbol = SYMBOLS[symbolType];
  
  // 특수 심볼 처리
  if (symbol.isSpecial) {
    switch (symbolType) {
      case 'bonus':
        // 보너스는 50-500점 랜덤
        return Math.floor(Math.random() * 451) + 50;
      case 'bomb':
      case 'star':
        // 폭탄과 스타는 주변 심볼 점수에 따라 계산됨
        return 0;
      default:
        return 0;
    }
  }
  
  // 일반 심볼은 기본 점수 * 개수
  return symbol.points * count;
};
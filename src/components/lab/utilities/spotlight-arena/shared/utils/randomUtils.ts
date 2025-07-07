// 랜덤 유틸리티 함수들

/**
 * min과 max 사이의 랜덤 정수 반환 (min, max 포함)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * min과 max 사이의 랜덤 실수 반환
 */
export const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * 배열에서 랜덤 요소 선택
 */
export const randomElement = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[randomInt(0, array.length - 1)];
};

/**
 * 배열 섞기 (Fisher-Yates 알고리즘)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 가중치 기반 랜덤 선택
 */
export const weightedRandom = <T>(items: T[], weights: number[]): T | undefined => {
  if (items.length === 0 || items.length !== weights.length) {
    return undefined;
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
};

/**
 * 확률 기반 true/false 반환
 */
export const randomChance = (probability: number): boolean => {
  return Math.random() < probability;
};

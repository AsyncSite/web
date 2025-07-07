/**
 * 추론 엔진 관련 타입 정의
 */

import { GameStateForAI, GuessHistory } from '../types/GameTypes';

/**
 * 추론 결과
 */
export interface InferenceResult {
  /** 각 키워드가 정답일 확률 (0~1) */
  probabilities: Map<number, number>;
  /** 확실한 정답 인덱스들 */
  certainAnswers: Set<number>;
  /** 확실한 오답 인덱스들 */
  certainWrongs: Set<number>;
  /** 가능한 정답 조합들 (CSP 결과) */
  possibleSolutions?: Set<Set<number>>;
  /** 정보 이득이 최대인 추측 조합 */
  optimalGuess?: number[];
  /** 추론 신뢰도 (0~1) */
  confidence: number;
}

/**
 * 제약 조건
 */
export interface Constraint {
  /** 제약 타입 */
  type: 'exact' | 'at_least' | 'at_most' | 'not_in';
  /** 관련 키워드 인덱스들 */
  keywords: number[];
  /** 제약 값 */
  value: number;
  /** 제약 출처 (어떤 추측에서 나온 것인지) */
  source?: {
    playerId: number;
    turnNumber: number;
  };
}

/**
 * 추론 컨텍스트
 */
export interface InferenceContext {
  /** 게임 상태 */
  gameState: GameStateForAI;
  /** 추가 제약 조건들 */
  constraints?: Constraint[];
  /** 추론 깊이 (계산 복잡도 제어) */
  maxDepth?: number;
  /** 타임아웃 (밀리초) */
  timeout?: number;
}

/**
 * 추론 엔진 인터페이스
 */
export interface IInferenceEngine {
  /**
   * 추론 수행
   */
  infer(context: InferenceContext): InferenceResult;

  /**
   * 추론 엔진 초기화
   */
  reset(): void;
}

/**
 * 확률 업데이트 규칙
 */
export interface ProbabilityUpdate {
  /** 업데이트할 키워드 인덱스 */
  keywordIndex: number;
  /** 새로운 확률 */
  probability: number;
  /** 업데이트 이유 */
  reason: string;
}

/**
 * 게임 단계
 */
export type GamePhase = 'early' | 'middle' | 'late';

/**
 * 전략적 추천
 */
export interface StrategicRecommendation {
  /** 추천 추측 */
  guess: number[];
  /** 추천 이유 */
  reason: string;
  /** 예상 정보 이득 */
  expectedInfoGain: number;
  /** 리스크 수준 (0~1) */
  riskLevel: number;
}

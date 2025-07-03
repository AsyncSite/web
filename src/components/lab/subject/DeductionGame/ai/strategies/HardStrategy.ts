import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';
import { LogicalInference } from '../inference/LogicalInference';
import { ProbabilisticInference } from '../inference/ProbabilisticInference';
import { InferenceContext, InferenceResult, GamePhase } from '../inference/types';
import { getGamePhase, generateOptimalGuess, calculateRiskLevel } from '../inference/InferenceUtils';

export class HardStrategy implements AIStrategy {
  private logicalEngine: LogicalInference;
  private probabilisticEngine: ProbabilisticInference;
  
  constructor() {
    this.logicalEngine = new LogicalInference();
    this.probabilisticEngine = new ProbabilisticInference();
  }
  
  selectKeywords(gameState: GameStateForAI): number[] {
    const { 
      keywords, 
      revealedAnswers, 
      revealedWrongAnswers, 
      answerCount,
      previousGuesses,
      myHints,
      currentTurn,
      maxTurns
    } = gameState;
    
    // 추론 컨텍스트 생성
    const context: InferenceContext = {
      gameState,
      maxDepth: 10,
      timeout: 800 // 800ms 제한
    };
    
    // 두 추론 엔진 실행
    const logicalResult = this.logicalEngine.infer(context);
    const probabilisticResult = this.probabilisticEngine.infer(context);
    
    // 결과 통합
    const combinedResult = this.combineInferenceResults(
      logicalResult,
      probabilisticResult,
      gameState
    );
    
    // 게임 단계별 전략 적용
    const gamePhase = getGamePhase(currentTurn, maxTurns);
    const finalGuess = this.applyPhaseStrategy(
      combinedResult,
      gamePhase,
      gameState
    );
    
    return finalGuess;
  }
  
  private combineInferenceResults(
    logical: InferenceResult,
    probabilistic: InferenceResult,
    gameState: GameStateForAI
  ): InferenceResult {
    // 확실한 정답/오답 통합
    const certainAnswers = new Set<number>();
    logical.certainAnswers.forEach(ans => certainAnswers.add(ans));
    probabilistic.certainAnswers.forEach(ans => certainAnswers.add(ans));
    gameState.revealedAnswers.forEach(ans => certainAnswers.add(ans));
    
    const certainWrongs = new Set<number>();
    logical.certainWrongs.forEach(wrong => certainWrongs.add(wrong));
    probabilistic.certainWrongs.forEach(wrong => certainWrongs.add(wrong));
    gameState.revealedWrongAnswers.forEach(wrong => certainWrongs.add(wrong));
    gameState.myHints.forEach(hint => certainWrongs.add(hint));
    
    // 확률 통합 (가중 평균)
    const combinedProbabilities = new Map<number, number>();
    const logicalWeight = logical.confidence;
    const probabilisticWeight = probabilistic.confidence;
    const totalWeight = logicalWeight + probabilisticWeight;
    
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (certainAnswers.has(i)) {
        combinedProbabilities.set(i, 1.0);
      } else if (certainWrongs.has(i)) {
        combinedProbabilities.set(i, 0.0);
      } else {
        const logProb = logical.probabilities.get(i) || 0;
        const probProb = probabilistic.probabilities.get(i) || 0;
        
        const combined = totalWeight > 0
          ? (logProb * logicalWeight + probProb * probabilisticWeight) / totalWeight
          : (logProb + probProb) / 2;
        
        combinedProbabilities.set(i, combined);
      }
    }
    
    // 최적 추측 생성
    const optimalGuess = generateOptimalGuess(
      combinedProbabilities,
      gameState.answerCount,
      {
        mustInclude: Array.from(certainAnswers),
        mustExclude: Array.from(certainWrongs),
        previousGuesses: gameState.previousGuesses
      }
    );
    
    return {
      probabilities: combinedProbabilities,
      certainAnswers,
      certainWrongs,
      optimalGuess,
      confidence: (logical.confidence + probabilistic.confidence) / 2
    };
  }
  
  private applyPhaseStrategy(
    inferenceResult: InferenceResult,
    phase: GamePhase,
    gameState: GameStateForAI
  ): number[] {
    const { optimalGuess, probabilities, certainAnswers } = inferenceResult;
    
    if (!optimalGuess || optimalGuess.length < gameState.answerCount) {
      // 폴백: 기본 추측 사용
      return this.fallbackStrategy(gameState);
    }
    
    switch (phase) {
      case 'early':
        // 초반: 정보 수집 중심, 다양한 추측
        return this.earlyPhaseStrategy(optimalGuess, probabilities, gameState);
        
      case 'middle':
        // 중반: 균형잡힌 접근
        return optimalGuess;
        
      case 'late':
        // 후반: 확실한 정답 중심
        return this.latePhaseStrategy(
          optimalGuess,
          probabilities,
          certainAnswers,
          gameState
        );
        
      default:
        return optimalGuess;
    }
  }
  
  private earlyPhaseStrategy(
    baseGuess: number[],
    probabilities: Map<number, number>,
    gameState: GameStateForAI
  ): number[] {
    // 정보 획득을 위해 중간 확률(0.3~0.7)의 키워드 우선 선택
    const candidates: Array<[number, number]> = [];
    
    probabilities.forEach((prob, keyword) => {
      if (!gameState.revealedWrongAnswers.includes(keyword) &&
          !gameState.myHints.includes(keyword)) {
        // 불확실성이 높은 키워드에 보너스
        const uncertainty = Math.abs(prob - 0.5);
        const score = prob - uncertainty * 0.3; // 불확실할수록 약간 감점
        candidates.push([keyword, score]);
      }
    });
    
    candidates.sort((a, b) => b[1] - a[1]);
    
    const selected: number[] = [];
    const targetCount = gameState.answerCount;
    
    // 공개된 정답 먼저
    gameState.revealedAnswers.forEach(ans => selected.push(ans));
    
    // 점수 순으로 선택
    for (const [keyword] of candidates) {
      if (selected.length >= targetCount) break;
      if (!selected.includes(keyword)) {
        selected.push(keyword);
      }
    }
    
    return selected;
  }
  
  private latePhaseStrategy(
    baseGuess: number[],
    probabilities: Map<number, number>,
    certainAnswers: Set<number>,
    gameState: GameStateForAI
  ): number[] {
    // 후반: 높은 확률 위주로 안전하게
    const selected: number[] = [];
    
    // 확실한 정답 먼저
    certainAnswers.forEach(ans => {
      if (selected.length < gameState.answerCount) {
        selected.push(ans);
      }
    });
    
    // 높은 확률 키워드 추가
    const highProbCandidates: Array<[number, number]> = [];
    probabilities.forEach((prob, keyword) => {
      if (!selected.includes(keyword) && prob >= 0.7) {
        highProbCandidates.push([keyword, prob]);
      }
    });
    
    highProbCandidates.sort((a, b) => b[1] - a[1]);
    
    for (const [keyword] of highProbCandidates) {
      if (selected.length >= gameState.answerCount) break;
      selected.push(keyword);
    }
    
    // 부족하면 baseGuess에서 채우기
    if (selected.length < gameState.answerCount) {
      for (const keyword of baseGuess) {
        if (selected.length >= gameState.answerCount) break;
        if (!selected.includes(keyword)) {
          selected.push(keyword);
        }
      }
    }
    
    return selected;
  }
  
  private fallbackStrategy(gameState: GameStateForAI): number[] {
    // 추론 실패 시 기본 전략
    const selected = [...gameState.revealedAnswers];
    
    const available = Array.from(
      { length: gameState.keywords.length },
      (_, i) => i
    ).filter(i => 
      !gameState.revealedWrongAnswers.includes(i) &&
      !gameState.myHints.includes(i) &&
      !selected.includes(i)
    );
    
    // 이전 추측에서 성공률이 높았던 키워드 우선
    const scoreMap = new Map<number, number>();
    available.forEach(idx => scoreMap.set(idx, 0));
    
    gameState.previousGuesses.forEach(guess => {
      if (guess.correctCount > 0) {
        const successRate = guess.correctCount / guess.guess.length;
        guess.guess.forEach(idx => {
          if (scoreMap.has(idx)) {
            scoreMap.set(idx, scoreMap.get(idx)! + successRate);
          }
        });
      }
    });
    
    const sorted = available.sort((a, b) => {
      const scoreA = scoreMap.get(a) || 0;
      const scoreB = scoreMap.get(b) || 0;
      return scoreB - scoreA;
    });
    
    const needed = gameState.answerCount - selected.length;
    selected.push(...sorted.slice(0, needed));
    
    return selected;
  }

  getStrategyName(): string {
    return 'Hard AI';
  }

  getDescription(): string {
    return 'CSP와 베이지안 추론을 결합한 고급 AI 전략을 사용합니다.';
  }
}
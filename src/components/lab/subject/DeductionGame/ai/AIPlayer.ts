export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIStrategy {
  difficulty: AIDifficulty;
  makeGuess(gameInfo: AIGameInfo): number[];
}

export interface AIGameInfo {
  keywords: string[];
  playerHints: number[];
  revealedAnswers: number[];
  revealedWrongAnswers: number[];
  turnHistory: AITurnInfo[];
  answerCount: number;
  currentTurn: number;
  maxTurns?: number;
}

export interface AITurnInfo {
  playerId: number;
  guess: number[];
  correctCount: number;
  turnNumber: number;
}

export class AIPlayer {
  constructor(
    public readonly id: number,
    public readonly nickname: string,
    public readonly difficulty: AIDifficulty
  ) {}

  private strategy: AIStrategy = this.createStrategy();

  private createStrategy(): AIStrategy {
    switch (this.difficulty) {
      case 'easy':
        return new EasyAIStrategy();
      case 'medium':
        return new MediumAIStrategy();
      case 'hard':
        return new HardAIStrategy();
      default:
        return new MediumAIStrategy();
    }
  }

  makeGuess(gameInfo: AIGameInfo): number[] {
    return this.strategy.makeGuess(gameInfo);
  }
}

class EasyAIStrategy implements AIStrategy {
  difficulty: AIDifficulty = 'easy';

  makeGuess(gameInfo: AIGameInfo): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, playerHints } = gameInfo;
    
    // Easy AI: 랜덤 선택 전략 (힌트와 공개된 정보만 활용)
    const availableIndices = keywords
      .map((_, index) => index)
      .filter(index => !revealedWrongAnswers.includes(index) && !playerHints.includes(index));
    
    const selectedIndices: number[] = [];
    
    // 공개된 정답 우선 선택
    revealedAnswers.forEach(ans => {
      if (availableIndices.includes(ans)) {
        selectedIndices.push(ans);
      }
    });
    
    // 나머지는 랜덤 선택
    const remaining = availableIndices.filter(idx => !selectedIndices.includes(idx));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    
    while (selectedIndices.length < answerCount && shuffled.length > 0) {
      selectedIndices.push(shuffled.shift()!);
    }
    
    return selectedIndices;
  }
}

class MediumAIStrategy implements AIStrategy {
  difficulty: AIDifficulty = 'medium';

  makeGuess(gameInfo: AIGameInfo): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, playerHints, turnHistory } = gameInfo;
    
    // Medium AI: 이전 턴 정보를 활용한 전략
    const availableIndices = keywords
      .map((_, index) => index)
      .filter(index => !revealedWrongAnswers.includes(index) && !playerHints.includes(index));
    
    const selectedIndices: number[] = [];
    
    // 공개된 정답 우선 선택
    revealedAnswers.forEach(ans => {
      if (availableIndices.includes(ans)) {
        selectedIndices.push(ans);
      }
    });
    
    // 이전 턴에서 정답률이 높았던 키워드 우선 고려
    const keywordScores: Map<number, number> = new Map();
    
    turnHistory.forEach(turn => {
      const successRate = turn.correctCount / turn.guess.length;
      turn.guess.forEach(guessIndex => {
        if (availableIndices.includes(guessIndex) && !selectedIndices.includes(guessIndex)) {
          const currentScore = keywordScores.get(guessIndex) || 0;
          keywordScores.set(guessIndex, currentScore + successRate);
        }
      });
    });
    
    // 점수 기반으로 정렬
    const sortedByScore = Array.from(keywordScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // 높은 점수 키워드 우선 선택
    for (const idx of sortedByScore) {
      if (selectedIndices.length >= answerCount) break;
      if (!selectedIndices.includes(idx)) {
        selectedIndices.push(idx);
      }
    }
    
    // 부족하면 랜덤 선택
    const remaining = availableIndices.filter(idx => !selectedIndices.includes(idx));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    
    while (selectedIndices.length < answerCount && shuffled.length > 0) {
      selectedIndices.push(shuffled.shift()!);
    }
    
    return selectedIndices;
  }
}

class HardAIStrategy implements AIStrategy {
  difficulty: AIDifficulty = 'hard';
  private keywordCategories: Map<number, string> = new Map();

  makeGuess(gameInfo: AIGameInfo): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, playerHints, turnHistory } = gameInfo;
    
    // Hard AI: 카테고리 분석과 패턴 인식을 활용한 고급 전략
    this.analyzeKeywordCategories(keywords);
    
    const availableIndices = keywords
      .map((_, index) => index)
      .filter(index => !revealedWrongAnswers.includes(index) && !playerHints.includes(index));
    
    const selectedIndices: number[] = [];
    
    // 공개된 정답 우선 선택
    revealedAnswers.forEach(ans => {
      if (availableIndices.includes(ans)) {
        selectedIndices.push(ans);
      }
    });
    
    // 패턴 분석: 이전 정답들의 카테고리 분석
    const answerCategories: Map<string, number> = new Map();
    
    // 공개된 정답의 카테고리 분석
    revealedAnswers.forEach(ansIdx => {
      const category = this.keywordCategories.get(ansIdx);
      if (category) {
        answerCategories.set(category, (answerCategories.get(category) || 0) + 1);
      }
    });
    
    // 이전 턴에서 높은 정답률을 보인 추측의 카테고리 분석
    turnHistory.forEach(turn => {
      if (turn.correctCount > answerCount / 2) { // 절반 이상 맞춘 경우
        turn.guess.forEach(guessIdx => {
          const category = this.keywordCategories.get(guessIdx);
          if (category) {
            answerCategories.set(category, (answerCategories.get(category) || 0) + 0.5);
          }
        });
      }
    });
    
    // 카테고리 기반 점수 계산
    const keywordScores: Map<number, number> = new Map();
    
    availableIndices.forEach(idx => {
      if (!selectedIndices.includes(idx)) {
        let score = 0;
        const category = this.keywordCategories.get(idx);
        
        // 카테고리 점수
        if (category && answerCategories.has(category)) {
          score += answerCategories.get(category)! * 2;
        }
        
        // 이전 턴 분석 점수
        turnHistory.forEach(turn => {
          if (turn.guess.includes(idx)) {
            score += turn.correctCount / turn.guess.length;
          }
        });
        
        // 랜덤 요소 추가 (예측 불가능성)
        score += Math.random() * 0.5;
        
        keywordScores.set(idx, score);
      }
    });
    
    // 점수 기반으로 선택
    const sortedByScore = Array.from(keywordScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    for (const idx of sortedByScore) {
      if (selectedIndices.length >= answerCount) break;
      selectedIndices.push(idx);
    }
    
    return selectedIndices;
  }

  private analyzeKeywordCategories(keywords: string[]): void {
    // 간단한 카테고리 분석 (실제로는 더 정교한 분석 필요)
    const categories = {
      animals: ['사자', '호랑이', '코끼리', '기린', '원숭이', '코알라', '판다', '펭귄', '독수리', '상어', '고래', '돌고래', '토끼', '고양이', '강아지', '말', '소', '돼지', '양', '염소'],
      foods: ['피자', '햄버거', '스파게티', '초밥', '김치찌개', '불고기', '치킨', '라면', '떡볶이', '김밥', '샐러드', '스테이크', '카레', '우동', '냉면', '비빔밥', '갈비', '삼겹살', '회', '족발'],
      objects: ['컴퓨터', '스마트폰', '자동차', '비행기', '기차', '자전거', '책', '연필', '가방', '시계', '안경', '모자', '신발', '옷', '침대', '의자', '책상', '냉장고', '세탁기', '텔레비전'],
      places: ['학교', '병원', '은행', '카페', '식당', '공원', '해변', '산', '도서관', '박물관', '영화관', '쇼핑몰', '시장', '교회', '지하철역', '공항', '호텔', '집', '회사', '체육관'],
      actions: ['걷기', '뛰기', '수영', '춤추기', '노래하기', '요리하기', '공부하기', '운전하기', '그림그리기', '글쓰기', '읽기', '잠자기', '먹기', '마시기', '웃기', '울기', '생각하기', '말하기', '듣기', '보기']
    };
    
    keywords.forEach((keyword, index) => {
      for (const [category, words] of Object.entries(categories)) {
        if (words.includes(keyword)) {
          this.keywordCategories.set(index, category);
          break;
        }
      }
    });
  }
}
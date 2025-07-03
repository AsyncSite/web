export interface GuessHistory {
  playerId: number;
  guess: number[];
  correctCount: number;
}

export interface GameStateForAI {
  keywords: string[];
  myHints: number[];
  previousGuesses: GuessHistory[];
  revealedAnswers: number[];
  revealedWrongAnswers: number[];
  answerCount: number;
  currentTurn: number;
  maxTurns?: number;
  timeLimit: number;
}

export interface GameContext {
  keywords: string[];
  answers: number[];
  playerHints: { [playerId: number]: number[] };
  currentTurn: number;
  turnHistory: TurnResult[];
  revealedAnswers: number[];
  revealedWrongAnswers: number[];
}

export interface TurnResult {
  playerId: number;
  playerName: string;
  guess: number[];
  guessKeywords: string[];
  correctCount: number;
  turnNumber: number;
  timeUsed: number;
}
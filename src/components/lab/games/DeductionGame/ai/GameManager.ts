import { IPlayer } from './players/BasePlayer';
import { GameContext, GameStateForAI, TurnResult } from './types/GameTypes';
import { PlayerInfo } from './types/PlayerTypes';
import { PlayerFactory } from './PlayerFactory';

export interface GameManagerConfig {
  keywordPoolSize: number;
  answerCount: number;
  hintCount: number;
  timeLimit: number;
  maxTurns?: number;
}

export class GameManager {
  private players: IPlayer[] = [];
  private currentPlayerIndex: number = 0;
  private gameContext: GameContext;
  private config: GameManagerConfig;
  private isGameRunning: boolean = false;
  private turnTimer?: NodeJS.Timeout;
  private turnStartTime: number = 0;
  private revealedHintsPerPlayer: Map<number, { playerId: number; hints: number[] }[]> = new Map();
  private lastHintRevealTurn: Map<number, number> = new Map(); // 각 플레이어의 마지막 힌트 공개 턴
  
  private onTurnStart?: (player: IPlayer) => void;
  private onTurnEnd?: (result: TurnResult) => void;
  private onGameEnd?: (winner?: IPlayer) => void;
  private onTimerTick?: (remainingTime: number) => void;
  private onAIThinking?: (thinking: boolean) => void;

  constructor(config: GameManagerConfig) {
    this.config = config;
    this.gameContext = {
      keywords: [],
      answers: [],
      playerHints: {},
      currentTurn: 0,
      turnHistory: [],
      revealedAnswers: [],
      revealedWrongAnswers: []
    };
  }

  addPlayer(player: IPlayer): void {
    if (this.isGameRunning) {
      throw new Error('Cannot add players while game is running');
    }
    this.players.push(player);
  }

  setPlayers(players: IPlayer[]): void {
    if (this.isGameRunning) {
      throw new Error('Cannot set players while game is running');
    }
    this.players = players;
  }

  getCurrentPlayer(): IPlayer | null {
    if (!this.isGameRunning || this.players.length === 0) return null;
    return this.players[this.currentPlayerIndex];
  }

  getPlayers(): IPlayer[] {
    return [...this.players];
  }

  getGameContext(): GameContext {
    return { ...this.gameContext };
  }

  async startGame(keywords: string[], answers: number[], playerHints: { [playerId: number]: number[] }): Promise<void> {
    if (this.players.length === 0) {
      throw new Error('No players added to the game');
    }

    this.gameContext = {
      keywords,
      answers,
      playerHints,
      currentTurn: 1,
      turnHistory: [],
      revealedAnswers: [],
      revealedWrongAnswers: []
    };

    this.currentPlayerIndex = 0;
    this.isGameRunning = true;
    this.revealedHintsPerPlayer.clear();
    this.lastHintRevealTurn.clear();
    
    // 게임 시작 시 설정 정보 로그
    console.log('=== 게임 설정 ===');
    console.log(`키워드 풀: ${this.config.keywordPoolSize}개`);
    console.log(`정답 개수: ${this.config.answerCount}개`);
    console.log(`힌트 개수: ${this.config.hintCount}개`);
    console.log(`플레이어 수: ${this.players.length}명`);
    console.log(`게임 복잡도: ${this.calculateGameComplexity().toFixed(2)}`);
    console.log(`예상 게임 길이: ${this.calculateExpectedTurns(this.calculateGameComplexity())}턴`);
    console.log('================');

    await this.startNextTurn();
  }

  private async startNextTurn(): Promise<void> {
    if (!this.isGameRunning) return;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

    // 턴 시작 시간 기록
    this.turnStartTime = Date.now();

    if (this.onTurnStart) {
      this.onTurnStart(currentPlayer);
    }

    currentPlayer.onTurnStart?.();

    if (PlayerFactory.isHumanPlayer(currentPlayer)) {
      this.startTurnTimer();
      // 인간 플레이어의 경우에도 makeGuess를 호출하여 Promise를 생성
      const gameStateForAI = this.createGameStateForAI(currentPlayer);
      currentPlayer.makeGuess(gameStateForAI).then(guess => {
        this.processTurn(guess);
      });
    } else {
      // AI 플레이어의 경우에도 타이머 시작
      this.startTurnTimer();
      
      // AI 플레이어의 경우, 사람처럼 보이도록 약간의 딜레이 추가
      if (this.onAIThinking) {
        this.onAIThinking(true);
      }
      
      const thinkingTime = Math.random() * 2000 + 1500; // 1.5초 ~ 3.5초 사이의 랜덤 시간
      
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      const gameStateForAI = this.createGameStateForAI(currentPlayer);
      const guess = await currentPlayer.makeGuess(gameStateForAI);
      
      if (this.onAIThinking) {
        this.onAIThinking(false);
      }
      
      await this.processTurn(guess);
    }
  }

  private startTurnTimer(): void {
    let remainingTime = this.config.timeLimit;
    
    if (this.onTimerTick) {
      this.onTimerTick(remainingTime);
    }

    this.turnTimer = setInterval(() => {
      remainingTime--;
      
      if (this.onTimerTick) {
        this.onTimerTick(remainingTime);
      }

      if (remainingTime <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  private stopTurnTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = undefined;
    }
  }

  private handleTimeout(): void {
    this.stopTurnTimer();
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;
    
    const availableIndices = Array.from(
      { length: this.gameContext.keywords.length },
      (_, i) => i
    ).filter(idx => !this.gameContext.revealedWrongAnswers.includes(idx));
    
    const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
    const autoGuess = shuffled.slice(0, this.config.answerCount);
    
    if (PlayerFactory.isHumanPlayer(currentPlayer)) {
      // HumanPlayer의 경우 submitGuess를 통해 Promise를 resolve
      currentPlayer.submitGuess(autoGuess);
    } else {
      this.processTurn(autoGuess);
    }
  }

  async submitHumanGuess(indices: number[]): Promise<void> {
    const currentPlayer = this.getCurrentPlayer();
    
    if (!currentPlayer || !PlayerFactory.isHumanPlayer(currentPlayer)) {
      throw new Error('Current player is not a human player');
    }

    this.stopTurnTimer();
    currentPlayer.submitGuess(indices);
    // processTurn은 makeGuess Promise가 resolve될 때 자동으로 호출됨
  }

  private async processTurn(guess: number[]): Promise<void> {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

    // 타이머 중지 (중요: AI 플레이어도 타이머를 사용하므로)
    this.stopTurnTimer();

    const correctCount = guess.filter(idx => 
      this.gameContext.answers.includes(idx)
    ).length;

    const isWinner = correctCount === this.config.answerCount && 
                     guess.every(idx => this.gameContext.answers.includes(idx));

    // 실제 사용 시간 계산
    const actualTimeUsed = Math.round((Date.now() - this.turnStartTime) / 1000);
    
    const turnResult: TurnResult = {
      playerId: currentPlayer.getInfo().id,
      playerName: currentPlayer.getInfo().nickname,
      guess: [...guess],
      guessKeywords: guess.map(idx => this.gameContext.keywords[idx]),
      correctCount,
      turnNumber: this.gameContext.currentTurn,
      timeUsed: actualTimeUsed
    };

    this.gameContext.turnHistory.push(turnResult);
    
    currentPlayer.onTurnEnd?.({
      selectedIndices: guess,
      timeUsed: turnResult.timeUsed,
      timestamp: Date.now()
    });

    if (this.onTurnEnd) {
      this.onTurnEnd(turnResult);
    }

    if (isWinner) {
      this.endGame(currentPlayer);
    } else if (this.config.maxTurns && this.gameContext.currentTurn >= this.config.maxTurns) {
      this.endGame();
    } else {
      this.gameContext.currentTurn++;
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      await this.startNextTurn();
    }
  }

  private createGameStateForAI(player: IPlayer): GameStateForAI {
    const playerInfo = player.getInfo();
    const myHints = this.gameContext.playerHints[playerInfo.id] || [];
    
    const previousGuesses = this.gameContext.turnHistory.map(turn => ({
      playerId: turn.playerId,
      guess: turn.guess,
      correctCount: turn.correctCount
    }));

    // 난이도별 힌트 공개 주기 설정
    const hintRevealSchedule = this.getHintRevealSchedule(playerInfo);
    const revealedOtherHints = this.updateAndGetRevealedHints(playerInfo.id, hintRevealSchedule);

    return {
      keywords: [...this.gameContext.keywords],
      myHints,
      previousGuesses,
      revealedAnswers: [...this.gameContext.revealedAnswers],
      revealedWrongAnswers: [...this.gameContext.revealedWrongAnswers],
      answerCount: this.config.answerCount,
      currentTurn: this.gameContext.currentTurn,
      maxTurns: this.config.maxTurns,
      timeLimit: this.config.timeLimit,
      revealedOtherHints
    };
  }

  private getHintRevealSchedule(playerInfo: PlayerInfo): { startTurn: number; initialInterval: number; accelerationFactor: number } {
    // AI 난이도에 따른 힌트 공개 스케줄을 동적으로 계산
    if (playerInfo.type === 'built-in-ai') {
      // 게임 복잡도 계산
      const complexity = this.calculateGameComplexity();
      const expectedTurns = this.calculateExpectedTurns(complexity);
      
      // 난이도별 AI 성장 구간 비율 정의 (Medium 강화)
      const difficultyProfiles = {
        easy: { 
          startRatio: 0.5,       // 50%에서 시작 (훨씬 늦게)
          initialInterval: 8,    // 초기 간격 (2배로 증가)
          accelerationFactor: 1.2 // 가속도 계수 (더 느리게)
        },
        medium: { 
          startRatio: 0.25,      // 25%에서 시작 (기존 Easy 값 사용)
          initialInterval: 4,    // 초기 간격 (기존 Easy 값 사용)
          accelerationFactor: 1.5 // 가속도 계수 (기존 Easy 값 사용)
        },
        hard: { 
          startRatio: 0.05,      // 5%에서 시작
          initialInterval: 1,    // 초기 간격
          accelerationFactor: 8.0 // 가속도 계수
        }
      };
      
      const profile = difficultyProfiles[playerInfo.aiDifficulty || 'medium'];
      
      // 시작 턴 계산
      const startTurn = Math.max(1, Math.floor(expectedTurns * profile.startRatio));
      
      console.log(`[${playerInfo.aiDifficulty} AI] 예상 게임 길이: ${expectedTurns}턴, 시작: ${startTurn}턴, 초기 간격: ${profile.initialInterval}턴`);
      
      return { 
        startTurn, 
        initialInterval: profile.initialInterval,
        accelerationFactor: profile.accelerationFactor
      };
    }
    // 커스텀 AI나 휴먼 플레이어는 힌트 공개 없음
    return { startTurn: Infinity, initialInterval: Infinity, accelerationFactor: 1 };
  }
  
  private calculateGameComplexity(): number {
    // 게임 복잡도 = (키워드 풀 크기 - 정답 개수) / 정답 개수
    return (this.config.keywordPoolSize - this.config.answerCount) / this.config.answerCount;
  }
  
  private calculateExpectedTurns(complexity: number): number {
    // 복잡도 기반 예상 게임 길이 계산
    // 기본 공식: 복잡도 * 난이도 계수 + 최소 턴 수
    const baseTurns = Math.ceil(complexity * 1.5 + 10);
    
    // 최대 턴 수가 설정되어 있으면 그것도 고려
    if (this.config.maxTurns) {
      return Math.min(baseTurns, this.config.maxTurns * 0.8); // 최대 턴의 80%를 예상 길이로
    }
    
    return baseTurns;
  }

  private updateAndGetRevealedHints(playerId: number, schedule: { startTurn: number; initialInterval: number; accelerationFactor: number }): { playerId: number; hints: number[] }[] {
    const currentTurn = this.gameContext.currentTurn;
    
    // 아직 힌트 공개 시작 턴이 안 됐으면 빈 배열 반환
    if (currentTurn < schedule.startTurn) {
      return [];
    }

    // 마지막 힌트 공개 턴 가져오기
    const lastRevealTurn = this.lastHintRevealTurn.get(playerId) || schedule.startTurn - 1;
    const turnsPassedSinceStart = currentTurn - schedule.startTurn;
    
    // 가속도 기반 간격 계산: 간격 = 초기간격 / (경과턴 / 10 + 1)
    const acceleratedInterval = Math.max(1, Math.floor(
      schedule.initialInterval / (1 + turnsPassedSinceStart / (10 / schedule.accelerationFactor))
    ));
    
    // 이번 턴에 공개할 힌트 수 계산: 난이도별로 다르게
    let revealMultiplier = 0.15; // Easy: 매우 적게 공개
    if (schedule.accelerationFactor >= 1.5 && schedule.accelerationFactor < 8.0) { // Medium
      revealMultiplier = 0.3; // Medium: 기존 Easy 수준으로
    } else if (schedule.accelerationFactor >= 8.0) { // Hard
      revealMultiplier = 1.5; // Hard: 더 많이 공개
    }
    const hintsToRevealThisTurn = Math.max(1, Math.floor(turnsPassedSinceStart * revealMultiplier));
    
    // 간격이 지났는지 확인
    const shouldReveal = currentTurn >= lastRevealTurn + acceleratedInterval;
    
    // 이미 공개된 힌트 가져오기
    let revealedHints = this.revealedHintsPerPlayer.get(playerId) || [];
    
    if (shouldReveal) {
      // 다른 플레이어들의 힌트 중 아직 공개하지 않은 것들
      const otherPlayers = this.players.filter(p => p.getInfo().id !== playerId);
      const availableHints: { playerId: number; hints: number[] }[] = [];

      for (const otherPlayer of otherPlayers) {
        const otherPlayerId = otherPlayer.getInfo().id;
        const otherHints = this.gameContext.playerHints[otherPlayerId] || [];
        
        // 이미 공개된 플레이어인지 확인
        if (!revealedHints.find(rh => rh.playerId === otherPlayerId)) {
          availableHints.push({ playerId: otherPlayerId, hints: otherHints });
        }
      }

      // 이번 턴에 여러 힌트 공개
      let revealedThisTurn = 0;
      while (revealedThisTurn < hintsToRevealThisTurn && availableHints.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableHints.length);
        const newHint = availableHints.splice(randomIndex, 1)[0];
        revealedHints.push(newHint);
        revealedThisTurn++;
        
        // 힌트 공개 로그
        const playerInfo = this.players.find(p => p.getInfo().id === playerId)?.getInfo();
        if (playerInfo) {
          console.log(`[턴 ${currentTurn}] ${playerInfo.nickname}이(가) 플레이어 ${newHint.playerId}의 힌트 ${newHint.hints.length}개를 알게 되었습니다.`);
        }
      }
      
      // 난이도별 임계점: Medium은 40%, Hard는 즉시 전체 공개
      let thresholdRatio = 0.5; // Easy
      if (schedule.accelerationFactor >= 3.0 && schedule.accelerationFactor < 8.0) { // Medium
        thresholdRatio = 0.4;
      } else if (schedule.accelerationFactor >= 8.0) { // Hard
        thresholdRatio = 0.1; // 10%만 되어도 모두 공개
      }
      
      // Hard AI는 게임 후반(마지막 10%)에 모든 힌트 즉시 공개
      const gameProgress = currentTurn / (this.config.maxTurns || 30);
      const isHardAI = schedule.accelerationFactor >= 8.0;
      const isEndgame = gameProgress >= 0.7; // 70% 진행 시점
      
      const totalAvailableHints = (this.players.length - 1);
      if ((revealedHints.length >= totalAvailableHints * thresholdRatio || (isHardAI && isEndgame)) && availableHints.length > 0) {
        console.log(`[턴 ${currentTurn}] ${isHardAI && isEndgame ? 'Hard AI 후반 모드 -' : '임계점 도달 -'} 나머지 모든 힌트 공개`);
        for (const hint of availableHints) {
          revealedHints.push(hint);
          const playerInfo = this.players.find(p => p.getInfo().id === playerId)?.getInfo();
          if (playerInfo) {
            console.log(`[턴 ${currentTurn}] ${playerInfo.nickname}이(가) 플레이어 ${hint.playerId}의 힌트 ${hint.hints.length}개를 추가로 알게 되었습니다.`);
          }
        }
      }
      
      // 마지막 공개 턴 업데이트
      this.lastHintRevealTurn.set(playerId, currentTurn);
      
      // 다음 간격 로그
      const nextInterval = Math.max(1, Math.floor(
        schedule.initialInterval / (1 + (turnsPassedSinceStart + 1) / (10 / schedule.accelerationFactor))
      ));
      console.log(`[${this.players.find(p => p.getInfo().id === playerId)?.getInfo().nickname}] 다음 힌트 공개까지: ${nextInterval}턴`);
    }

    // 업데이트된 힌트 저장
    this.revealedHintsPerPlayer.set(playerId, revealedHints);

    return [...revealedHints];
  }

  revealAnswer(): boolean {
    const unrevealedAnswers = this.gameContext.answers.filter(
      ans => !this.gameContext.revealedAnswers.includes(ans)
    );
    
    if (unrevealedAnswers.length === 0) return false;
    
    const randomAnswer = unrevealedAnswers[
      Math.floor(Math.random() * unrevealedAnswers.length)
    ];
    
    this.gameContext.revealedAnswers.push(randomAnswer);
    return true;
  }

  revealWrongAnswer(): boolean {
    const wrongAnswers = Array.from(
      { length: this.gameContext.keywords.length },
      (_, i) => i
    ).filter(idx => 
      !this.gameContext.answers.includes(idx) && 
      !this.gameContext.revealedWrongAnswers.includes(idx)
    );
    
    if (wrongAnswers.length === 0) return false;
    
    const randomWrong = wrongAnswers[
      Math.floor(Math.random() * wrongAnswers.length)
    ];
    
    this.gameContext.revealedWrongAnswers.push(randomWrong);
    return true;
  }

  private endGame(winner?: IPlayer): void {
    this.stopTurnTimer();
    this.isGameRunning = false;
    
    if (this.onGameEnd) {
      this.onGameEnd(winner);
    }
  }

  stopGame(): void {
    this.stopTurnTimer();
    this.isGameRunning = false;
    this.players.forEach(player => player.reset());
    this.revealedHintsPerPlayer.clear();
    this.lastHintRevealTurn.clear();
  }

  isRunning(): boolean {
    return this.isGameRunning;
  }

  setEventHandlers(handlers: {
    onTurnStart?: (player: IPlayer) => void;
    onTurnEnd?: (result: TurnResult) => void;
    onGameEnd?: (winner?: IPlayer) => void;
    onTimerTick?: (remainingTime: number) => void;
    onAIThinking?: (thinking: boolean) => void;
  }): void {
    this.onTurnStart = handlers.onTurnStart;
    this.onTurnEnd = handlers.onTurnEnd;
    this.onGameEnd = handlers.onGameEnd;
    this.onTimerTick = handlers.onTimerTick;
    this.onAIThinking = handlers.onAIThinking;
  }
}
import { IPlayer } from './players/BasePlayer';
import { HumanPlayer } from './players/HumanPlayer';
import { GameContext, GameStateForAI, TurnResult } from './types/GameTypes';
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
  
  private onTurnStart?: (player: IPlayer) => void;
  private onTurnEnd?: (result: TurnResult) => void;
  private onGameEnd?: (winner?: IPlayer) => void;
  private onTimerTick?: (remainingTime: number) => void;

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

    await this.startNextTurn();
  }

  private async startNextTurn(): Promise<void> {
    if (!this.isGameRunning) return;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

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
      const gameStateForAI = this.createGameStateForAI(currentPlayer);
      const guess = await currentPlayer.makeGuess(gameStateForAI);
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

    const correctCount = guess.filter(idx => 
      this.gameContext.answers.includes(idx)
    ).length;

    const isWinner = correctCount === this.config.answerCount && 
                     guess.every(idx => this.gameContext.answers.includes(idx));

    const turnResult: TurnResult = {
      playerId: currentPlayer.getInfo().id,
      playerName: currentPlayer.getInfo().nickname,
      guess: [...guess],
      guessKeywords: guess.map(idx => this.gameContext.keywords[idx]),
      correctCount,
      turnNumber: this.gameContext.currentTurn,
      timeUsed: this.config.timeLimit // TODO: Track actual time used
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

    return {
      keywords: [...this.gameContext.keywords],
      myHints,
      previousGuesses,
      revealedAnswers: [...this.gameContext.revealedAnswers],
      revealedWrongAnswers: [...this.gameContext.revealedWrongAnswers],
      answerCount: this.config.answerCount,
      currentTurn: this.gameContext.currentTurn,
      maxTurns: this.config.maxTurns,
      timeLimit: this.config.timeLimit
    };
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
  }

  isRunning(): boolean {
    return this.isGameRunning;
  }

  setEventHandlers(handlers: {
    onTurnStart?: (player: IPlayer) => void;
    onTurnEnd?: (result: TurnResult) => void;
    onGameEnd?: (winner?: IPlayer) => void;
    onTimerTick?: (remainingTime: number) => void;
  }): void {
    this.onTurnStart = handlers.onTurnStart;
    this.onTurnEnd = handlers.onTurnEnd;
    this.onGameEnd = handlers.onGameEnd;
    this.onTimerTick = handlers.onTimerTick;
  }
}
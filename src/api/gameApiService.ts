import apiClient from './client';

// Game session types
export interface GameSession {
  sessionId: string;
  gameTypeCode: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  endedAt?: string;
}

export interface StartGameRequest {
  gameTypeCode: string;
  metadata?: Record<string, any>;
}

export interface EndGameRequest {
  sessionId: string;
  result?: GameResult;
}

// Base game result interface
export interface GameResult {
  gameType: string;
}

// Tetris specific result
export interface TetrisGameResult extends GameResult {
  gameType: 'TETRIS';
  score: number;
  linesCleared: number;
  level: number;
  maxCombo?: number;
  timeElapsedSeconds: number;
  gameData?: string;
}

// Deduction specific result
export interface DeductionGameResult extends GameResult {
  gameType: 'DEDUCTION';
  score: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  guessesCount: number;
  hintsUsed?: number;
  playersCount: number;
  timeElapsedSeconds: number;
  won: boolean;
  gameData?: string;
}

// Response types
export interface GameResultResponse {
  recordId: number;
  sessionId: string;
  gameType: string;
  score: number;
  isPersonalBest: boolean;
  rank?: number;
  previousBestRank?: number;
  previousBestScore?: number;
  playedAt: string;
  gameSpecificData?: any;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  score: number;
  playedAt: string;
  additionalData?: any;
}

export interface GameStatistics {
  gameType: string;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  lastPlayedAt: string;
  additionalStats?: any;
}

// Game state management
export interface GameState {
  sessionId: string;
  stateType: 'CHECKPOINT' | 'PAUSE' | 'DISCONNECT' | 'AUTO_SAVE';
  stateData: string;
  savedAt: string;
  expiresAt?: string;
}

class GameApiService {
  private readonly baseUrl = '/api/games';

  // Game session management
  async startGameSession(request: StartGameRequest): Promise<GameSession> {
    const response = await apiClient.post(`${this.baseUrl}/sessions/start`, request);
    return response.data;
  }

  async endGameSession(request: EndGameRequest): Promise<GameResultResponse> {
    const response = await apiClient.post(`${this.baseUrl}/sessions/end`, request);
    return response.data;
  }

  async abandonGameSession(sessionId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/sessions/abandon`, { sessionId });
  }

  async getGameSession(sessionId: string): Promise<GameSession> {
    const response = await apiClient.get(`${this.baseUrl}/sessions/${sessionId}`);
    return response.data;
  }

  // Leaderboards
  async getGlobalLeaderboard(gameType: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get(`${this.baseUrl}/leaderboards/global`, {
      params: { gameType, limit }
    });
    return response.data;
  }

  async getLeaderboardAroundUser(gameType: string, range: number = 5): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get(`${this.baseUrl}/leaderboards/${gameType}/around-me`, {
      params: { range }
    });
    return response.data;
  }

  async getUserLeaderboard(gameType: string, userId?: number): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get(`${this.baseUrl}/leaderboards/user`, {
      params: { gameType, userId }
    });
    return response.data;
  }

  // Statistics
  async getUserStatistics(gameType?: string): Promise<GameStatistics[]> {
    const response = await apiClient.get(`${this.baseUrl}/statistics/user`, {
      params: { gameType }
    });
    return response.data;
  }

  async getGameStatistics(gameType: string): Promise<GameStatistics> {
    const response = await apiClient.get(`${this.baseUrl}/statistics/game/${gameType}`);
    return response.data;
  }

  // Game state management
  async saveGameState(sessionId: string, stateData: any, stateType: GameState['stateType'] = 'CHECKPOINT'): Promise<GameState> {
    const response = await apiClient.post(`${this.baseUrl}/states/save`, {
      sessionId,
      stateType,
      stateData: JSON.stringify(stateData)
    });
    return response.data;
  }

  async loadGameState(sessionId: string): Promise<GameState | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/states/${sessionId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getLatestGameState(gameType: string, stateType?: GameState['stateType']): Promise<GameState | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/states/latest`, {
        params: { gameType, stateType }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async deleteGameState(sessionId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/states/${sessionId}`);
  }

  // Utility methods
  async getAvailableGames(): Promise<Array<{ code: string; name: string; description: string }>> {
    const response = await apiClient.get(`${this.baseUrl}/types`);
    return response.data;
  }

  // Helper method to submit game results
  async submitGameResult(sessionId: string, result: TetrisGameResult | DeductionGameResult): Promise<GameResultResponse> {
    return this.endGameSession({ sessionId, result });
  }
}

export default new GameApiService();
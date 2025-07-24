import { GameManagerFactory } from './game';

export interface GameActivity {
  name: string;
  link: string;
  totalCount: number;
  myRanking?: number;
  totalRanking?: number;
  lastPlayed?: string;
  wins?: number;
  participations?: number;
}

class GameActivityService {
  /**
   * Get game activities for current user
   */
  async getGameActivities(userId?: string): Promise<GameActivity[]> {
    const activities: GameActivity[] = [];
    
    // Get game manager instance
    const gameManager = GameManagerFactory.getDefaultGameManager();
    
    
    // Get Tetris stats from GameManager
    try {
      const tetrisStats = await gameManager.getGameStatistics('TETRIS');
      const tetrisHistory = await gameManager.getGameHistory('TETRIS', 1);
      const tetrisRank = await gameManager.getUserRank('TETRIS');
      
      if (tetrisStats.success && tetrisStats.data.length > 0) {
        const stat = tetrisStats.data[0];
        activities.push({
          name: 'Tetris',
          link: '/lab/tetris',
          totalCount: stat.totalGamesPlayed,
          myRanking: stat.bestScore,
          lastPlayed: stat.lastPlayedAt ? 
            new Date(stat.lastPlayedAt).toLocaleDateString('ko-KR') : undefined
        });
      }
    } catch (error) {
      console.error('Failed to load Tetris stats:', error);
    }
    
    // Get Deduction Game stats from GameManager
    try {
      const deductionStats = await gameManager.getGameStatistics('DEDUCTION');
      const deductionHistory = await gameManager.getGameHistory('DEDUCTION', 1);
      
      if (deductionStats.success && deductionStats.data.length > 0) {
        const stat = deductionStats.data[0];
        const wins = stat.additionalStats?.wins || 0;
        
        activities.push({
          name: 'Deduction Game',
          link: '/lab/deduction-game',
          totalCount: stat.totalGamesPlayed,
          wins: wins,
          participations: stat.totalGamesPlayed,
          lastPlayed: stat.lastPlayedAt ? 
            new Date(stat.lastPlayedAt).toLocaleDateString('ko-KR') : undefined
        });
      }
    } catch (error) {
      console.error('Failed to load Deduction Game stats:', error);
    }
    
    return activities;
  }
  
  
  /**
   * Get summary statistics for all games
   */
  async getGameSummary(userId?: string): Promise<{
    totalGames: number;
    totalWins: number;
    favoriteGame?: string;
    lastActivity?: string;
  }> {
    const activities = await this.getGameActivities(userId);
    
    const totalGames = activities.reduce((sum, activity) => sum + activity.totalCount, 0);
    const totalWins = activities.reduce((sum, activity) => sum + (activity.wins || 0), 0);
    
    // Find favorite game (most played)
    const favoriteGame = activities.length > 0 ? 
      activities.reduce((prev, current) => 
        current.totalCount > prev.totalCount ? current : prev
      ).name : undefined;
    
    // Find last activity
    const lastDates = activities
      .filter(a => a.lastPlayed)
      .map(a => new Date(a.lastPlayed!));
    
    const lastActivity = lastDates.length > 0 ? 
      new Date(Math.max(...lastDates.map(d => d.getTime()))).toLocaleDateString('ko-KR') : 
      undefined;
    
    return {
      totalGames,
      totalWins,
      favoriteGame,
      lastActivity
    };
  }
}

export default new GameActivityService();
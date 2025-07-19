import { gameHistoryService } from '../components/lab/utilities/spotlight-arena/shared/services';
import { participantStatsService } from '../components/lab/utilities/spotlight-arena/shared/services';

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
  getGameActivities(userId?: string): GameActivity[] {
    const activities: GameActivity[] = [];
    
    // Get Spotlight Arena stats
    const spotlightHistory = gameHistoryService.getHistory();
    const spotlightUserHistory = userId ? 
      spotlightHistory.filter(game => 
        game.participants.some(p => p.id === userId || p.name === userId)
      ) : spotlightHistory;
    
    const spotlightUserStats = userId ? 
      participantStatsService.getParticipantStats(userId) : null;
    
    if (spotlightHistory.length > 0) {
      // Get rankings from top winners
      const topWinners = participantStatsService.getTopWinners(100);
      const userRanking = userId ? 
        topWinners.findIndex(p => p.participantId === userId || p.name === userId) + 1 : 0;
      
      activities.push({
        name: 'Spotlight Arena',
        link: '/lab/spotlight-arena',
        totalCount: spotlightUserHistory.length,
        myRanking: userRanking > 0 ? userRanking : undefined,
        totalRanking: topWinners.length,
        wins: spotlightUserStats?.wins || 0,
        participations: spotlightUserStats?.totalGames || spotlightUserHistory.length,
        lastPlayed: spotlightUserHistory[0]?.timestamp ? 
          new Date(spotlightUserHistory[0].timestamp).toLocaleDateString('ko-KR') : undefined
      });
    }
    
    // Get Team Shuffle stats from localStorage if available
    const teamShuffleData = this.getTeamShuffleStats(userId);
    if (teamShuffleData) {
      activities.push(teamShuffleData);
    }
    
    // Get other game stats as they become available
    // For now, we'll check if there's any stored data
    const tetrisData = this.getTetrisStats(userId);
    if (tetrisData) {
      activities.push(tetrisData);
    }
    
    const deductionGameData = this.getDeductionGameStats(userId);
    if (deductionGameData) {
      activities.push(deductionGameData);
    }
    
    return activities;
  }
  
  /**
   * Get Team Shuffle stats from localStorage
   */
  private getTeamShuffleStats(userId?: string): GameActivity | null {
    try {
      const teamShuffleHistory = localStorage.getItem('team-shuffle-history');
      if (teamShuffleHistory) {
        const history = JSON.parse(teamShuffleHistory);
        if (Array.isArray(history) && history.length > 0) {
          return {
            name: 'Team Shuffle',
            link: '/lab/team-shuffle',
            totalCount: history.length,
            lastPlayed: history[0].timestamp ? 
              new Date(history[0].timestamp).toLocaleDateString('ko-KR') : undefined
          };
        }
      }
    } catch (error) {
      console.error('Failed to load team shuffle stats:', error);
    }
    return null;
  }
  
  /**
   * Get Tetris stats from localStorage
   */
  private getTetrisStats(userId?: string): GameActivity | null {
    try {
      const tetrisHighScore = localStorage.getItem('tetris-high-score');
      const tetrisLastPlayed = localStorage.getItem('tetris-last-played');
      
      if (tetrisHighScore || tetrisLastPlayed) {
        return {
          name: 'Tetris',
          link: '/lab/tetris',
          totalCount: parseInt(localStorage.getItem('tetris-play-count') || '0'),
          myRanking: tetrisHighScore ? parseInt(tetrisHighScore) : undefined,
          lastPlayed: tetrisLastPlayed ? 
            new Date(tetrisLastPlayed).toLocaleDateString('ko-KR') : undefined
        };
      }
    } catch (error) {
      console.error('Failed to load tetris stats:', error);
    }
    return null;
  }
  
  /**
   * Get Deduction Game stats from localStorage
   */
  private getDeductionGameStats(userId?: string): GameActivity | null {
    try {
      const deductionHistory = localStorage.getItem('deduction-game-history');
      if (deductionHistory) {
        const history = JSON.parse(deductionHistory);
        if (Array.isArray(history) && history.length > 0) {
          const wins = history.filter((game: any) => game.won).length;
          return {
            name: 'Deduction Game',
            link: '/lab/deduction-game',
            totalCount: history.length,
            wins: wins,
            participations: history.length,
            lastPlayed: history[0].timestamp ? 
              new Date(history[0].timestamp).toLocaleDateString('ko-KR') : undefined
          };
        }
      }
    } catch (error) {
      console.error('Failed to load deduction game stats:', error);
    }
    return null;
  }
  
  /**
   * Get summary statistics for all games
   */
  getGameSummary(userId?: string): {
    totalGames: number;
    totalWins: number;
    favoriteGame?: string;
    lastActivity?: string;
  } {
    const activities = this.getGameActivities(userId);
    
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
import { useState, useEffect } from 'react';
import { gameHistoryService, participantStatsService } from '../shared/services';
import { GlobalStats, ParticipantStats } from '../shared/types/storage';
import { 
  calculateGlobalStats, 
  getStatsForPeriod, 
  calculateParticipantRankings,
  getGamesByTimeOfDay,
  getAverageGameDuration
} from '../shared/utils/statsUtils';
import GlobalStatsCard from './components/GlobalStatsCard';
import TopWinnersCard from './components/TopWinnersCard';
import GameTypeChart from './components/GameTypeChart';
import RecentGamesCard from './components/RecentGamesCard';
import TimeHeatmap from './components/TimeHeatmap';
import ParticipantRankings from './components/ParticipantRankings';
import './StatsDashboard.css';

interface StatsDashboardProps {
  onBack: () => void;
  onViewHistory: () => void;
  onSelectParticipant: (participantId: string) => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ 
  onBack, 
  onViewHistory,
  onSelectParticipant 
}) => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [topWinners, setTopWinners] = useState<ParticipantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7); // 기본 7일
  const [selectedGameType, setSelectedGameType] = useState<string>(''); // 전체

  useEffect(() => {
    loadStats();
  }, [selectedPeriod, selectedGameType]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // 전체 통계
      const stats = calculateGlobalStats();
      setGlobalStats(stats);

      // 상위 당첨자
      const winners = participantStatsService.getTopWinners(10, selectedGameType || undefined);
      setTopWinners(winners);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const periodStats = getStatsForPeriod(selectedPeriod);
  const hourlyStats = getGamesByTimeOfDay();
  const rankings = calculateParticipantRankings(selectedGameType || undefined);
  const avgDuration = getAverageGameDuration(selectedGameType || undefined);

  if (isLoading) {
    return (
      <div className="stats-dashboard loading">
        <div className="loading-spinner">통계를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="stats-dashboard">
      <div className="dashboard-header">
        <button className="back-button" onClick={onBack}>
          ← 돌아가기
        </button>
        <h1>📊 통계 대시보드</h1>
        <button className="history-link" onClick={onViewHistory}>
          📋 게임 기록 보기
        </button>
      </div>

      <div className="dashboard-controls">
        <div className="period-selector">
          <label>기간:</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value))}>
            <option value={1}>오늘</option>
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
            <option value={365}>1년</option>
          </select>
        </div>

        <div className="game-type-selector">
          <label>게임 종류:</label>
          <select value={selectedGameType} onChange={(e) => setSelectedGameType(e.target.value)}>
            <option value="">전체</option>
            <option value="snail-race">달팽이 레이스</option>
            <option value="slot-machine">슬롯머신</option>
            <option value="dart-wheel">다트 휠</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {/* 전체 통계 카드 */}
        {globalStats && (
          <GlobalStatsCard 
            stats={globalStats} 
            periodStats={periodStats}
            avgDuration={avgDuration}
          />
        )}

        {/* 상위 당첨자 카드 */}
        <TopWinnersCard 
          winners={topWinners}
          onSelectParticipant={onSelectParticipant}
          gameType={selectedGameType}
        />

        {/* 게임 종류별 차트 */}
        {globalStats && (
          <GameTypeChart 
            gameTypeStats={globalStats.gameTypeStats}
          />
        )}

        {/* 최근 게임 카드 */}
        <RecentGamesCard 
          limit={5}
          onViewAll={onViewHistory}
        />

        {/* 시간대별 히트맵 */}
        <TimeHeatmap 
          hourlyStats={hourlyStats}
        />

        {/* 참가자 랭킹 */}
        <ParticipantRankings 
          rankings={rankings}
          onSelectParticipant={onSelectParticipant}
          gameType={selectedGameType}
        />
      </div>

      <div className="dashboard-footer">
        <p className="last-updated">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>
    </div>
  );
};

export default StatsDashboard;
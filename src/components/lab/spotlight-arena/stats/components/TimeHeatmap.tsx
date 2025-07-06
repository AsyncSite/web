import React from 'react';
import './StatsComponents.css';

interface TimeHeatmapProps {
  hourlyStats: { [hour: number]: number };
}

const TimeHeatmap: React.FC<TimeHeatmapProps> = ({ hourlyStats }) => {
  const maxCount = Math.max(...Object.values(hourlyStats), 1);
  
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    return Math.ceil((count / maxCount) * 5); // 1-5 단계
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12AM';
    if (hour === 12) return '12PM';
    return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
  };

  return (
    <div className="stats-card time-heatmap-card full-width">
      <h3>🕐 시간대별 활동</h3>
      
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = hourlyStats[hour] || 0;
            const intensity = getIntensity(count);
            
            return (
              <div key={hour} className="heatmap-cell-wrapper">
                <div className="hour-label">{formatHour(hour)}</div>
                <div 
                  className={`heatmap-cell intensity-${intensity}`}
                  title={`${count}게임`}
                >
                  {count > 0 && count}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="heatmap-legend">
          <span className="legend-label">적음</span>
          <div className="legend-cells">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`legend-cell intensity-${i}`} />
            ))}
          </div>
          <span className="legend-label">많음</span>
        </div>
      </div>
      
      <div className="heatmap-insight">
        <p>
          가장 활발한 시간대: {getBusiestHours(hourlyStats)}
        </p>
      </div>
    </div>
  );
};

const getBusiestHours = (hourlyStats: { [hour: number]: number }) => {
  const entries = Object.entries(hourlyStats);
  if (entries.length === 0) return '데이터 없음';
  
  const sorted = entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  const topHours = sorted.slice(0, 3)
    .filter(([_, count]) => Number(count) > 0)
    .map(([hour]) => {
      const h = Number(hour);
      if (h === 0) return '자정';
      if (h === 12) return '정오';
      return h > 12 ? `오후 ${h - 12}시` : `오전 ${h}시`;
    });
  
  return topHours.length > 0 ? topHours.join(', ') : '활동 없음';
};

export default TimeHeatmap;
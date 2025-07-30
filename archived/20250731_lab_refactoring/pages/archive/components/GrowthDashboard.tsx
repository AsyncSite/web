import React, { useState, useEffect } from 'react';

// GrowthMetric 인터페이스 정의
interface GrowthMetric {
  label: string;
  value: number;
  unit: string;
  trend: number; // 전주 대비 증감률
  icon: string;
}

// 성장 지표 데이터 (TecoTecoPage.tsx에서 가져옴)
const growthMetrics: GrowthMetric[] = [
  {
    label: '이번 주 해결 문제',
    value: 127,
    unit: '개',
    trend: 15,
    icon: '📝',
  },
  {
    label: '활발한 멤버',
    value: 24,
    unit: '명',
    trend: 8,
    icon: '👥',
  },
  {
    label: '코드 리뷰',
    value: 89,
    unit: '건',
    trend: 23,
    icon: '🔍',
  },
  {
    label: '평균 출석률',
    value: 92,
    unit: '%',
    trend: 5,
    icon: '📊',
  },
];

const GrowthDashboard: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // 숫자 애니메이션
    growthMetrics.forEach((metric, index) => {
      setTimeout(() => {
        const duration = 2000;
        const start = 0;
        const end = metric.value;
        const startTime = Date.now();

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / duration, 1);
          const value = Math.floor(start + (end - start) * progress);

          setAnimatedValues((prev) => ({ ...prev, [metric.label]: value }));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      }, index * 200);
    });
  }, []);

  return (
    <div className="growth-dashboard">
      <h3 className="dashboard-title">📈 이번 주 TecoTeco</h3>
      <div className="metrics-grid">
        {growthMetrics.map((metric, index) => (
          <div
            key={metric.label}
            className="metric-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <div className="metric-value">
                <span className="value-number">{animatedValues[metric.label] || 0}</span>
                <span className="value-unit">{metric.unit}</span>
              </div>
              <p className="metric-label">{metric.label}</p>
              <div className={`metric-trend ${metric.trend > 0 ? 'up' : 'down'}`}>
                {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowthDashboard;

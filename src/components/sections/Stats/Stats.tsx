import React from 'react';
import './Stats.css';

interface StatItem {
  number: string;
  label: string;
}

const Stats: React.FC = () => {
  const stats: StatItem[] = [
    {
      number: '10+',
      label: '현재 활동 인원'
    },
    {
      number: '350+',
      label: '활동 일수'
    },
    {
      number: '10+',
      label: '완성된 프로젝트'
    },
    {
      number: '0기',
      label: 'PRE-WAVE'
    }
  ];

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

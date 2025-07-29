import React, { useState, useEffect } from 'react';
import './Stats.css';

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Stats: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // 2024년 6월 11일부터 시작
    const startDate = new Date('2024-06-11T00:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = now - startDate;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeElapsed({ days, hours, minutes, seconds });
      }
    };

    // 초기 실행
    updateTimer();

    // 1초마다 업데이트
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section className="stats section-background">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Async와 함께한 시간</h2>
          <p className="section-subtitle">2024년 6월 11일부터 지금까지</p>
        </div>
        
        <div className="stats-timer">
          <div className="timer-item">
            <div className="timer-number">{formatNumber(timeElapsed.days)}</div>
            <div className="timer-label">일</div>
          </div>
          <div className="timer-item">
            <div className="timer-number">{formatNumber(timeElapsed.hours)}</div>
            <div className="timer-label">시간</div>
          </div>
          <div className="timer-item">
            <div className="timer-number">{formatNumber(timeElapsed.minutes)}</div>
            <div className="timer-label">분</div>
          </div>
          <div className="timer-item">
            <div className="timer-number">{formatNumber(timeElapsed.seconds)}</div>
            <div className="timer-label">초</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Stats;

import React, { useState, useEffect } from 'react';
import './CTA.css';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CTA: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // 2025년 10월 1일로 수정 (현재 날짜보다 미래)
    const targetDate = new Date('2025-10-01T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // 초기 실행
    updateCountdown();

    // 1초마다 업데이트
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section className="cta" id="recruit">
      <div className="container">
        <h2 className="cta-title">1기 모집 중</h2>
        <p className="cta-subtitle">열정 있는 당신을 기다립니다</p>

        <div className="cta-countdown">
          <div className="countdown-item">
            <div className="countdown-number">{formatNumber(timeLeft.days)}</div>
            <div className="countdown-label">일</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{formatNumber(timeLeft.hours)}</div>
            <div className="countdown-label">시간</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{formatNumber(timeLeft.minutes)}</div>
            <div className="countdown-label">분</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{formatNumber(timeLeft.seconds)}</div>
            <div className="countdown-label">초</div>
          </div>
        </div>

        <button className="cta-button">지원서 작성하기</button>
      </div>
    </section>
  );
};

export default CTA;

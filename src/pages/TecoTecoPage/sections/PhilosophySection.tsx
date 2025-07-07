// src/pages/TecoTecoPage/sections/PhilosophySection.tsx
import React from 'react';
import './PhilosophySection.css';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="tecoteco-philosophy-section">
      <h2 className="section-title">
        🤝 TecoTeco, <br className="mobile-only" />
        함께 쓰는 성장 스토리
      </h2>
      <p className="section-subtitle">
        우리는 알고리즘 풀이를 넘어, <span className="highlight">서로의 성장을 이끄는 여정</span>에
        집중합니다.
      </p>
      <div className="philosophy-grid">
        <div className="philosophy-item">
          <h3>
            <span className="philosophy-icon">✨</span> 시너지의 마법
          </h3>
          <p>
            혼자 꾸준히 하기 어려운 알고리즘 공부, 서로 이끌어주고 동기를 부여하며 함께 성장하는{' '}
            <span className="highlight">끈끈한 커뮤니티</span>를 지향합니다.
          </p>
        </div>
        <div className="philosophy-item">
          <h3>
            <span className="philosophy-icon">🔍</span> 본질적 탐구
          </h3>
          <p>
            정답 코드만 보지 않습니다. 동료의 코드를{' '}
            <span className="highlight">리뷰하고 토론하며 문제의 본질</span>을 깊이 파고듭니다.
            '아하!'하는 깨달음이 TecoTeco의 핵심입니다.
          </p>
        </div>
        <div className="philosophy-item">
          <h3>
            <span className="philosophy-icon">🚀</span> 미래로의 도약
          </h3>
          <p>
            AI를 도구로 활용하며, 더 나아가{' '}
            <span className="highlight">AI를 넘어서는 개발자의 통찰력</span>을 함께 고민하고
            공유하는 진보적인 스터디를 추구합니다.
          </p>
        </div>
      </div>
    </section>
  );
};

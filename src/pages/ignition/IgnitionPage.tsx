import React from 'react';
import { Link } from 'react-router-dom';
import './IgnitionPage.css';

const IgnitionPage: React.FC = () => {
  return (
    <div className="ignition-page">
      <div className="ignition-hero">
        <h1 className="ignition-title">Ignition</h1>
        <p className="ignition-subtitle">당신의 커리어 성장을 가속화하는 혁신적인 도구들</p>
      </div>

      <div className="ignition-services">
        <Link to="/ignition/navigator" className="ignition-service-card-link">
          <div className="ignition-service-card">
            <div className="service-icon">🚀</div>
            <h3 className="service-title">Career Navigator</h3>
            <p className="service-description">
              AI 기반 채용 공고 분석과 맞춤형 커리어 로드맵으로
              당신의 다음 도전을 설계합니다.
            </p>
            <span className="service-link">
              시작하기 →
            </span>
          </div>
        </Link>

        <div className="ignition-service-card coming-soon">
          <div className="service-icon">🤖</div>
          <h3 className="service-title">AI Resume Service</h3>
          <p className="service-description">
            곧 출시 예정! AI가 당신의 이력서를 분석하고 
            개선점을 제안합니다.
          </p>
          <span className="service-badge">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default IgnitionPage;
import React from 'react';
import './CTA.css';

const CTA: React.FC = () => {
  return (
    <section className="cta section-background" id="recruit">
      <div className="container">
        <h2 className="cta-title">1기 모집 중</h2>
        <p className="cta-subtitle">열정 있는 당신을 기다립니다</p>

        <button className="cta-button">지원서 작성하기</button>
      </div>
    </section>
  );
};

export default CTA;

import React, { useEffect, useRef } from 'react';
import './Intro.css';
import Header from '../../layout/Header';

const Intro: React.FC = () => {
  const starfieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 별 생성 최적화 (DocumentFragment 사용)
    const starfield = starfieldRef.current;
    if (starfield) {
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < 250; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        fragment.appendChild(star);
      }

      starfield.appendChild(fragment);
    }
  }, []);

  return (
    <div className="intro-wrapper">
      {/* 우주 배경 */}
      <div className="space-background"></div>
      <div className="starfield" ref={starfieldRef}></div>
      <div className="orbit-container">
        <div className="orbit orbit-1">
          <div className="planet"></div>
        </div>
        <div className="orbit orbit-2">
          <div className="planet"></div>
        </div>
        <div className="orbit orbit-3">
          <div className="planet"></div>
        </div>
      </div>

      {/* Header - Intro와 함께 움직임 */}
      <Header />

      {/* Hero Section */}
      <section id="intro" className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">AsyncSite</div>
            <h1 className="hero-title">
              따로 또 같이<br />
              <span>느슨히 끈끈히</span><br />
            </h1>
            <p className="hero-subtitle">
              작고 꾸준한 행동이 모여 집단 지성을 이루는 생태계
            </p>
            <div className="hero-cta">
              <a href="#recruit" className="btn-primary">1기 지원하기</a>
              <a href="#about" className="btn-secondary">더 알아보기</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intro;

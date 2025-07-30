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
            <h1 className="hero-title">
              성장은, 따라오는 거야.
            </h1>
            <p className="hero-subtitle">
              혼자 고민하던 밤, 그 다음 이야기.
            </p>
            <div className="hero-cta">
              <a href="#studies" className="btn-primary">지금 모집 중인 스터디</a>
              <a href="#about" className="btn-secondary">Async Site 이야기</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intro;

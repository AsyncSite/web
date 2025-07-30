import React, { useEffect, useRef } from 'react';
import './Intro.css';
import Header from '../../layout/Header';

const IntroOptimized: React.FC = () => {
  const starfieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // 방법 1: CSS 최적화로 250개 별 유지
    const optimizeWithCSS = () => {
      const starfield = starfieldRef.current;
      if (!starfield) return;
      
      // GPU 레이어 강제 생성
      starfield.style.transform = 'translateZ(0)';
      starfield.style.willChange = 'transform';
      
      // 별들을 그룹으로 나누어 생성 (렌더링 부하 분산)
      const createStarBatch = (startIndex: number, count: number) => {
        const fragment = document.createDocumentFragment();
        
        for (let i = startIndex; i < startIndex + count; i++) {
          const star = document.createElement('div');
          star.className = 'star star-optimized';
          
          // 위치는 CSS transform으로 설정 (reflow 방지)
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          star.style.transform = `translate3d(${x}vw, ${y}vh, 0)`;
          
          // 애니메이션 타이밍을 CSS 변수로 설정
          star.style.setProperty('--delay', `${Math.random() * 4}s`);
          star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
          
          fragment.appendChild(star);
        }
        
        starfield.appendChild(fragment);
      };
      
      // requestAnimationFrame으로 배치 생성 (초기 로딩 부하 분산)
      const batchSize = 50;
      let currentBatch = 0;
      
      const createNextBatch = () => {
        if (currentBatch * batchSize < 250) {
          createStarBatch(currentBatch * batchSize, batchSize);
          currentBatch++;
          requestAnimationFrame(createNextBatch);
        }
      };
      
      requestAnimationFrame(createNextBatch);
    };
    
    // 방법 2: Canvas로 250개 별 렌더링 (최고 성능)
    const optimizeWithCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 캔버스 크기 설정
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // 별 데이터 생성
      interface Star {
        x: number;
        y: number;
        size: number;
        opacity: number;
        twinkleSpeed: number;
        twinklePhase: number;
      }
      
      const stars: Star[] = Array(250).fill(null).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      }));
      
      // 애니메이션 루프
      let animationId: number;
      let time = 0;
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 별 렌더링
        stars.forEach(star => {
          // 반짝임 효과
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
          const opacity = star.opacity * twinkle;
          
          ctx.globalAlpha = opacity;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        time += 1;
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
      };
    };
    
    // CSS 최적화 방법 사용 (DOM 유지)
    optimizeWithCSS();
    
    // 또는 Canvas 방법 사용 (최고 성능)
    // return optimizeWithCanvas();
    
  }, []);
  
  return (
    <div className="intro-wrapper">
      {/* 우주 배경 - GPU 가속 */}
      <div className="space-background space-background-optimized"></div>
      
      {/* 별들 - CSS 최적화 버전 */}
      <div className="starfield starfield-optimized" ref={starfieldRef}></div>
      
      {/* 또는 Canvas 버전 (주석 해제하여 사용) */}
      {/* <canvas 
        ref={canvasRef} 
        className="starfield-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      /> */}
      
      {/* 궤도 애니메이션 - CSS 최적화 */}
      <div className="orbit-container orbit-container-optimized">
        <div className="orbit orbit-1 orbit-optimized">
          <div className="planet planet-optimized"></div>
        </div>
        <div className="orbit orbit-2 orbit-optimized">
          <div className="planet planet-optimized"></div>
        </div>
        <div className="orbit orbit-3 orbit-optimized">
          <div className="planet planet-optimized"></div>
        </div>
      </div>

      <Header />

      <section id="intro" className="hero">
        <div className="container">
          <h1 className="hero-title">
            <span className="highlight">비동기적</span>으로<br />
            <span className="highlight">동기화</span>되는 성장
          </h1>
          <p className="hero-subtitle">
            각자의 속도로, 함께 만들어가는 개발자 커뮤니티
          </p>
          <div className="cta-buttons">
            <a href="#about" className="btn btn-primary">시작하기</a>
            <a href="#studies" className="btn btn-secondary">스터디 둘러보기</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroOptimized;
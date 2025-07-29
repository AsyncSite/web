import React, { useEffect, useRef } from 'react';
import './CTA.css';

const CTA: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 크기 설정
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 별 파티클 시스템
    const stars: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      targetX: number;
      targetY: number;
    }[] = [];
    
    // 별 생성
    const createStar = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.max(canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.02 + 0.01,
        opacity: 0,
        targetX: centerX,
        targetY: centerY
      };
    };
    
    // 초기 별 생성
    for (let i = 0; i < 50; i++) {
      stars.push(createStar());
    }
    
    // 애니메이션
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star, index) => {
        // 페이드 인
        if (star.opacity < 1) {
          star.opacity += 0.02;
        }
        
        // 중심으로 이동
        star.x += (star.targetX - star.x) * star.speed;
        star.y += (star.targetY - star.y) * star.speed;
        
        // 별 그리기
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = '#C3E88D';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#C3E88D';
        
        // 별 모양 그리기
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * Math.PI / 180;
          const outerRadius = star.size;
          const innerRadius = star.size * 0.5;
          
          if (i === 0) {
            ctx.moveTo(
              star.x + Math.cos(angle) * outerRadius,
              star.y + Math.sin(angle) * outerRadius
            );
          }
          
          const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
          ctx.lineTo(
            star.x + Math.cos(innerAngle) * innerRadius,
            star.y + Math.sin(innerAngle) * innerRadius
          );
          
          const nextAngle = ((i + 1) * 72 - 90) * Math.PI / 180;
          ctx.lineTo(
            star.x + Math.cos(nextAngle) * outerRadius,
            star.y + Math.sin(nextAngle) * outerRadius
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // 중심에 도달한 별은 재생성
        const distanceFromCenter = Math.sqrt(
          Math.pow(star.x - star.targetX, 2) + 
          Math.pow(star.y - star.targetY, 2)
        );
        
        if (distanceFromCenter < 10) {
          stars[index] = createStar();
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <section className="cta section-background" id="cta">
      <div className="container cta-container" ref={containerRef}>
        <canvas className="cta-canvas" ref={canvasRef} />
        
        <div className="cta-content">
          <h2 className="cta-title">함께 시작할 준비가 되셨나요?</h2>
          <p className="cta-subtitle">
            당신의 별이 우리의 별자리와 만나<br />
            더 큰 빛을 만들어갈 시간입니다
          </p>
          
          <div className="cta-stats">
            <div className="cta-stat">
              <span className="cta-stat-number">152</span>
              <span className="cta-stat-label">명의 동료가 함께하고 있어요</span>
            </div>
            <div className="cta-stat-divider">•</div>
            <div className="cta-stat">
              <span className="cta-stat-number">8</span>
              <span className="cta-stat-label">개의 스터디가 진행 중이에요</span>
            </div>
          </div>
          
          <div className="cta-buttons">
            <a href="/studies" className="cta-button primary">
              지금 참여하기
            </a>
            <a href="/auth/signup" className="cta-button secondary">
              회원가입하고 시작하기
            </a>
          </div>
          
          <p className="cta-note">
            지금 가입하면 모든 스터디의 알림을 받을 수 있어요
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;

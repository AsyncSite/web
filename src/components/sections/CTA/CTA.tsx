import React, { useEffect, useRef, useState } from 'react';
import styles from './CTA.module.css';
import publicApiClient from '../../../api/publicClient';

const CTA: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [studyCount, setStudyCount] = useState<number>(0);
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [userResponse, studyResponse] = await Promise.all([
          publicApiClient.get('/api/public/users/statistics'),
          publicApiClient.get('/api/studies')
        ]);
        
        const userData = userResponse.data;
        const studyData = studyResponse.data;
        
        if (userData.totalUsers) {
          setUserCount(userData.totalUsers);
        }
        
        if (studyData.data && Array.isArray(studyData.data)) {
          setStudyCount(studyData.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };
    
    fetchStatistics();
  }, []);
  
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
    
    // CTA 타이틀 그라데이션과 정확히 일치하는 색상 팔레트
    const colorPalette = [
      '#C3E88D', // 네온 그린 (그라데이션 시작)
      '#82AAFF', // 일렉트릭 블루 (그라데이션 끝)
      '#A3DE9D', // 네온 그린과 블루 사이 25%
      '#92C99E', // 네온 그린과 블루 사이 50%
      '#8AAFAA', // 네온 그린과 블루 사이 75%
    ];
    
    // 별 파티클 시스템
    const stars: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      targetX: number;
      targetY: number;
      color: string;
      shadowColor: string;
    }[] = [];
    
    // 별 생성
    const createStar = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.max(canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const selectedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.02 + 0.01,
        opacity: 0,
        targetX: centerX,
        targetY: centerY,
        color: selectedColor,
        shadowColor: selectedColor
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
        
        // 별 그리기 (다양한 색상 적용)
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = star.shadowColor;
        
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
    <section className={`${styles.cta} section-background`} id="cta">
      <div className={styles.ctaContainer} ref={containerRef}>
        <canvas className={styles.ctaCanvas} ref={canvasRef} />
        
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>함께 시작할 준비가 되셨나요?</h2>
          <p className={styles.ctaSubtitle}>
            별과 별이 만나 별자리를 만들어요.<br />
            더 큰 빛을 만들어갈 시간이에요.
          </p>
          
          <div className={styles.ctaStats}>
            <div className={styles.ctaStat}>
              <span className={styles.ctaStatNumber}>{userCount}</span>
              <span className={styles.ctaStatLabel}>명의 동료가 함께하고 있어요</span>
            </div>
            <div className={styles.ctaStatDivider}>•</div>
            <div className={styles.ctaStat}>
              <span className={styles.ctaStatNumber}>{studyCount}</span>
              <span className={styles.ctaStatLabel}>개의 스터디가 진행 중이에요</span>
            </div>
          </div>
          
          <div className={styles.ctaButtons}>
            <a href="/study" className={styles.btnPrimary}>
              지금 참여하기
            </a>
            <a href="/signup" className={styles.btnSecondary}>
              회원가입하고 시작하기
            </a>
          </div>
          
          <p className={styles.ctaNote}>
            지금 가입하면 모든 스터디의 알림을 받을 수 있어요
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;

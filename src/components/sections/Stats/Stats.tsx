import React, { useState, useEffect, useRef } from 'react';
import './Stats.css';

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Thread {
  id: number;
  name: string;
  generation: number;
  color: string;
  points: { x: number; y: number }[];
  controlPoints: { x: number; y: number }[];
  amplitude: number;
  frequency: number;
  phase: number;
  opacity: number;
}

interface StudyLabel {
  id: number;
  name: string;
  generation: number;
  x: number;
  y: number;
  opacity: number;
  appearTime: number;
}

const Stats: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [hoveredThread, setHoveredThread] = useState<number | null>(null);
  const [studyLabels, setStudyLabels] = useState<StudyLabel[]>([]);
  const weavingCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement>(null);
  const threadsRef = useRef<Thread[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationPhaseRef = useRef(0);
  
  // 스터디 데이터 - 실로 표현
  const activeStudies = [
    { name: '테코테코', generation: 3, color: '#C3E88D' },
    { name: '11루틴', generation: 2, color: '#82aaff' },
    { name: '데브로그', generation: 1, color: '#ffea00' },
    { name: '알고리즘 마스터', generation: 2, color: '#89ddff' },
  ];

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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    // 스터디 라벨 등장 타이머
    const labelInterval = setInterval(() => {
      const currentTime = Date.now();
      setStudyLabels(prev => {
        const newLabels = [...prev];
        
        // 새로운 라벨 추가 (최대 4개)
        if (newLabels.length < 4) {
          const studyIndex = newLabels.length;
          if (studyIndex < activeStudies.length) {
            const study = activeStudies[studyIndex];
            const angle = (studyIndex / activeStudies.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 180;
            
            newLabels.push({
              id: studyIndex,
              name: study.name,
              generation: study.generation,
              x: weavingCanvasRef.current!.offsetWidth / 2 + Math.cos(angle) * radius,
              y: weavingCanvasRef.current!.offsetHeight / 2 + Math.sin(angle) * radius,
              opacity: 0,
              appearTime: currentTime
            });
          }
        }
        
        // 오래된 라벨 제거 및 투명도 업데이트
        return newLabels.map(label => {
          const age = currentTime - label.appearTime;
          if (age < 1000) {
            // 페이드 인
            label.opacity = age / 1000;
          } else if (age > 8000) {
            // 페이드 아웃
            label.opacity = Math.max(0, 1 - (age - 8000) / 1000);
          } else {
            label.opacity = 1;
          }
          return label;
        }).filter(label => label.opacity > 0);
      });
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(labelInterval);
    };
  }, []);

  // 마우스 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = weavingCanvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 실타래 애니메이션
  useEffect(() => {
    const canvas = weavingCanvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    if (!canvas || !glowCanvas) return;

    const ctx = canvas.getContext('2d');
    const glowCtx = glowCanvas.getContext('2d');
    if (!ctx || !glowCtx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      glowCanvas.width = glowCanvas.offsetWidth * window.devicePixelRatio;
      glowCanvas.height = glowCanvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      glowCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 실(Thread) 초기화
    if (threadsRef.current.length === 0) {
      const threads: Thread[] = activeStudies.map((study, index) => ({
        id: index,
        name: study.name,
        generation: study.generation,
        color: study.color,
        points: [],
        controlPoints: [],
        amplitude: 40 + Math.random() * 30,
        frequency: 0.6 + Math.random() * 0.4,
        phase: (index / activeStudies.length) * Math.PI * 2,
        opacity: 0.6 + Math.random() * 0.2
      }));
      
      threadsRef.current = threads;
    }

    let animationId: number;

    const drawThread = (thread: Thread, time: number) => {
      const centerY = canvas.offsetHeight / 2;
      const width = canvas.offsetWidth;
      
      ctx.beginPath();
      ctx.strokeStyle = thread.color;
      ctx.lineWidth = hoveredThread === thread.id ? 5 : 3;
      ctx.globalAlpha = hoveredThread === thread.id ? 1 : thread.opacity;
      ctx.shadowBlur = hoveredThread === thread.id ? 25 : 12;
      ctx.shadowColor = thread.color;
      
      // 사인파 기반의 물결 패턴 - 화면 밖에서 시작
      const points = [];
      const extendedWidth = width + 400; // 화면 밖까지 확장
      for (let x = -200; x <= extendedWidth; x += 5) {
        const progress = (x + 200) / (extendedWidth + 200);
        
        // 기본 사인파
        let y = centerY + Math.sin((progress * Math.PI * 2 * thread.frequency) + thread.phase + time) * thread.amplitude;
        
        // 마우스 인터랙션
        const dx = mouseRef.current.x - x;
        const dy = mouseRef.current.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const force = (100 - distance) / 100;
          y += dy * force * 0.3;
        }
        
        // 느슨함 표현: 약간의 랜덤성
        y += Math.sin(x * 0.01 + time * 0.5) * 5;
        
        points.push({ x, y });
        
        if (x === -200) {
          ctx.moveTo(x, y);
        } else {
          // 부드러운 곡선
          const prevPoint = points[points.length - 2];
          const cpx = (prevPoint.x + x) / 2;
          const cpy = (prevPoint.y + y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
        }
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // 실 끝부분에 스터디 이름 표시
      if (hoveredThread === thread.id && points.length > 0) {
        const midPoint = points[Math.floor(points.length / 2)];
        if (midPoint.x > 0 && midPoint.x < canvas.offsetWidth) {
          ctx.fillStyle = thread.color;
          ctx.font = 'bold 16px Pretendard';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 15;
          ctx.shadowColor = thread.color;
          ctx.fillText(`${thread.name} ${thread.generation}기`, midPoint.x, midPoint.y - 25);
          ctx.shadowBlur = 0;
        }
      }
    };

    const drawIntersections = (time: number) => {
      // 교차점에서 빛나는 효과
      glowCtx.clearRect(0, 0, glowCanvas.offsetWidth, glowCanvas.offsetHeight);
      
      for (let i = 0; i < threadsRef.current.length - 1; i++) {
        for (let j = i + 1; j < threadsRef.current.length; j++) {
          const thread1 = threadsRef.current[i];
          const thread2 = threadsRef.current[j];
          
          // 교차점 찾기 (간단한 근사치) - 화면 내에서만
          for (let x = 100; x < canvas.offsetWidth - 100; x += 50) {
            const progress = x / canvas.offsetWidth;
            const y1 = canvas.offsetHeight / 2 + Math.sin((progress * Math.PI * 2 * thread1.frequency) + thread1.phase + time) * thread1.amplitude;
            const y2 = canvas.offsetHeight / 2 + Math.sin((progress * Math.PI * 2 * thread2.frequency) + thread2.phase + time) * thread2.amplitude;
            
            if (Math.abs(y1 - y2) < 10) {
              // 교차점에 빛나는 원
              const gradient = glowCtx.createRadialGradient(x, (y1 + y2) / 2, 0, x, (y1 + y2) / 2, 20);
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
              gradient.addColorStop(0.5, 'rgba(195, 232, 141, 0.2)');
              gradient.addColorStop(1, 'transparent');
              
              glowCtx.fillStyle = gradient;
              glowCtx.beginPath();
              glowCtx.arc(x, (y1 + y2) / 2, 20, 0, Math.PI * 2);
              glowCtx.fill();
            }
          }
        }
      }
    };

    const checkHover = () => {
      const centerY = canvas.offsetHeight / 2;
      let foundHover = false;
      
      threadsRef.current.forEach((thread) => {
        const x = mouseRef.current.x;
        const progress = x / canvas.offsetWidth;
        const y = centerY + Math.sin((progress * Math.PI * 2 * thread.frequency) + thread.phase + animationPhaseRef.current) * thread.amplitude;
        
        const distance = Math.abs(mouseRef.current.y - y);
        if (distance < 20 && !foundHover) {
          setHoveredThread(thread.id);
          foundHover = true;
        }
      });
      
      if (!foundHover) {
        setHoveredThread(null);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      const time = Date.now() * 0.0005;
      animationPhaseRef.current = time;
      
      // 배경은 완전히 투명하게 (전체 페이지와 자연스럽게 연결)
      
      // 각 실 그리기
      threadsRef.current.forEach((thread) => {
        drawThread(thread, time);
      });
      
      // 교차점 효과
      drawIntersections(time);
      
      // 호버 체크
      checkHover();
      
      // 스터디 라벨 그리기
      studyLabels.forEach(label => {
        ctx.save();
        ctx.globalAlpha = label.opacity * 0.8;
        ctx.fillStyle = '#C3E88D';
        ctx.font = '14px Pretendard';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#C3E88D';
        ctx.fillText(`${label.name} ${label.generation}기`, label.x, label.y);
        ctx.restore();
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hoveredThread, studyLabels]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section className="stats section-background">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <div className="title-layout">
              <div className="title-main">
                함께 연결되는
              </div>
              <div className="title-sub">
                당신의 가장 치열한 사생활
              </div>
            </div>
          </h2>
        </div>
        
        {/* 전체 화면을 차지하는 캔버스 */}
        <canvas ref={weavingCanvasRef} className="weaving-canvas" />
        <canvas ref={glowCanvasRef} className="glow-canvas" />
        
        <div className="weaving-container">
          {/* 중앙 시간 표시 */}
          <div className="time-display-weaving">
            <div className="time-flow">
              <div className="time-segment">
                <span className="time-number">{formatNumber(timeElapsed.days)}</span>
                <span className="time-label">일</span>
              </div>
              <div className="time-connector">·</div>
              <div className="time-segment">
                <span className="time-number">{formatNumber(timeElapsed.hours)}</span>
                <span className="time-label">시간</span>
              </div>
              <div className="time-connector">·</div>
              <div className="time-segment">
                <span className="time-number">{formatNumber(timeElapsed.minutes)}</span>
                <span className="time-label">분</span>
              </div>
              <div className="time-connector">·</div>
              <div className="time-segment">
                <span className="time-number">{formatNumber(timeElapsed.seconds)}</span>
                <span className="time-label">초</span>
              </div>
            </div>
            {/* 은은한 서브 텍스트 */}
            <div className="time-origin">
              <span className="origin-date">Since 2024.06.11</span>
              <span className="origin-divider">·</span>
              <span className="origin-text">첫 모임</span>
            </div>
          </div>
        </div>
        
        {/* 하단 설명 */}
        <div className="weaving-legend">
          <p>각각의 실은 하나의 스터디를 나타내요.</p>
          <p>서로 엮이며 성취하고 성장합니다.</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
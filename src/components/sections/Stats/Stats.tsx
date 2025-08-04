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

interface JourneyStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  testimonial: {
    content: string;
    author: string;
    studyName: string;
  };
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

  const starsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const journeySteps: JourneyStep[] = [
    {
      id: 1,
      title: '발견',
      subtitle: '나와 맞는 스터디를 찾는 순간',
      description: '관심사와 목표가 비슷한 동료들과의 첫 만남',
      testimonial: {
        content: '처음엔 어떤 스터디가 맞을지 고민했는데, 상세한 소개를 보고 바로 결정했어요.',
        author: '김○○',
        studyName: '테코테코 2기'
      }
    },
    {
      id: 2,
      title: '연결',
      subtitle: '동료들과 코드로 대화하기 시작',
      description: '매주 만나 서로의 코드를 리뷰하고 더 나은 방법을 함께 고민하는 시간',
      testimonial: {
        content: '코드 리뷰를 통해 다른 관점을 배웠어요. 혼자서는 생각하지 못했던 방법들을 알게 됐죠.',
        author: '이○○',
        studyName: '11루틴 1기'
      }
    },
    {
      id: 3,
      title: '성장',
      subtitle: '피드백과 리뷰로 실력이 빛나는 순간',
      description: '수료증과 함께 남는 나만의 성장 포트폴리오',
      testimonial: {
        content: '3개월 전과 비교하면 정말 많이 성장했어요. 특히 코드 품질에 대한 시각이 달라졌습니다.',
        author: '박○○',
        studyName: '데브로그 1기'
      }
    },
    {
      id: 4,
      title: '나눔',
      subtitle: '이제는 내가 다른 이들의 길잡이 별이 되어',
      description: '받은 것을 나누며 다음 시즌의 스터디 리더로',
      testimonial: {
        content: '리더가 되어 더 많이 배우게 됐어요. 가르치면서 제가 더 성장하는 것을 느낍니다.',
        author: '정○○',
        studyName: '알고리즘 마스터 리더'
      }
    }
  ];

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
    
    // 그라데이션 캐시 (성능 최적화)
    const gradientCache = new Map<string, CanvasGradient>();
    
    const getOrCreateGradient = (key: string, width: number, baseColor: string, intensity: number = 1) => {
      if (gradientCache.has(key)) {
        return gradientCache.get(key)!;
      }
      
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 * intensity})`);
      gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${0.9 * intensity})`);
      gradient.addColorStop(0.5, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, ${0.8 * intensity})`);
      gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${0.9 * intensity})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.4 * intensity})`);
      
      gradientCache.set(key, gradient);
      return gradient;
    };

    const drawThread = (thread: Thread, time: number) => {
      const centerY = canvas.offsetHeight / 2;
      const width = canvas.offsetWidth;

      // 4레이어 시스템으로 최적화하면서 시각적 품질 유지
      const isHovered = hoveredThread === thread.id;
      const baseWidth = isHovered ? 3 : 1.5;
      const glowWidth = isHovered ? 12 : 6;
      
      // 고급스러운 색상 처리
      const baseColor = thread.color;
      
      // 사인파 기반의 물결 패턴 - 화면 밖에서 시작
      const points = [];
      const extendedWidth = width + 400;
      const step = 4; // 성능 최적화를 위해 step 증가
      
      for (let x = -200; x <= extendedWidth; x += step) {
        const progress = (x + 200) / (extendedWidth + 200);

        // 다중 사인파로 더 자연스러운 물결 효과 (최적화된 계산)
        let y = centerY;
        
        // 주요 파동
        y += Math.sin((progress * Math.PI * 2 * thread.frequency) + thread.phase + time) * thread.amplitude;
        
        // 보조 파동 (더 자연스러운 움직임)
        y += Math.sin((progress * Math.PI * 4 * thread.frequency * 0.7) + thread.phase * 1.3 + time * 1.2) * (thread.amplitude * 0.3);
        
        // 미세한 떨림 효과
        y += Math.sin((progress * Math.PI * 8 * thread.frequency * 0.4) + thread.phase * 2.1 + time * 1.8) * (thread.amplitude * 0.1);

        // 마우스 인터랙션 - 더 부드럽고 자연스럽게
        const dx = mouseRef.current.x - x;
        const dy = mouseRef.current.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;
        
        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          const easedForce = Math.pow(force, 2) * 0.4; // 부드러운 easing
          y += dy * easedForce;
          
          // 마우스 근처에서 약간의 좌우 흔들림
          const sideForce = Math.sin(time * 3 + distance * 0.05) * easedForce * 10;
          y += sideForce;
        }

        // 바람 효과 - 전체적인 자연스러운 흔들림
        const windEffect = Math.sin(x * 0.02 + time * 0.7) * 3 + Math.sin(x * 0.015 + time * 1.1) * 2;
        y += windEffect;

        points.push({ x, y });
      }

      // 4레이어 프리미엄 렌더링 시스템 (성능 최적화)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 1. 외부 아우라 - 가장 넓은 블러 효과
      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = glowWidth * 2;
      ctx.globalAlpha = isHovered ? 0.15 : 0.06;
      ctx.shadowBlur = 40;
      ctx.shadowColor = baseColor;
      ctx.filter = 'blur(1px)';
      
      drawSmoothCurve(ctx, points);
      ctx.stroke();
      ctx.filter = 'none';

      // 2. 메인 글로우 - 색상 정의와 확산
      const mainGradient = getOrCreateGradient(`main-${thread.id}`, canvas.offsetWidth, baseColor, 0.8);
      ctx.beginPath();
      ctx.strokeStyle = mainGradient;
      ctx.lineWidth = glowWidth;
      ctx.globalAlpha = isHovered ? 0.4 : 0.2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = baseColor;
      
      drawSmoothCurve(ctx, points);
      ctx.stroke();

      // 3. 코어 라인 - 선명한 정의
      const coreGradient = getOrCreateGradient(`core-${thread.id}`, canvas.offsetWidth, baseColor, 1.0);
      ctx.beginPath();
      ctx.strokeStyle = coreGradient;
      ctx.lineWidth = baseWidth * 1.5;
      ctx.globalAlpha = isHovered ? 0.8 : (thread.opacity * 0.7);
      ctx.shadowBlur = 10;
      ctx.shadowColor = baseColor;
      
      drawSmoothCurve(ctx, points);
      ctx.stroke();

      // 4. 하이라이트 코어 - 색상이 들어간 중심부
      const brightBaseColor = `rgba(${Math.min(255, parseInt(baseColor.slice(1, 3), 16) + 60)}, ${Math.min(255, parseInt(baseColor.slice(3, 5), 16) + 60)}, ${Math.min(255, parseInt(baseColor.slice(5, 7), 16) + 60)}, 0.9)`;
      ctx.beginPath();
      ctx.strokeStyle = isHovered ? brightBaseColor : baseColor;
      ctx.lineWidth = baseWidth * 0.6;
      ctx.globalAlpha = isHovered ? 0.8 : 0.6;
      ctx.shadowBlur = 6;
      ctx.shadowColor = baseColor;
      
      drawSmoothCurve(ctx, points);
      ctx.stroke();
      
      // 호버 시 추가 반짝임 효과 - 색상이 들어간 반짝임
      if (isHovered) {
        const sparkleTime = time * 3;
        const sparkleIntensity = (Math.sin(sparkleTime) + 1) / 2;
        const sparkleColor = `rgba(${Math.min(255, parseInt(baseColor.slice(1, 3), 16) + 80)}, ${Math.min(255, parseInt(baseColor.slice(3, 5), 16) + 80)}, ${Math.min(255, parseInt(baseColor.slice(5, 7), 16) + 80)}, ${sparkleIntensity * 0.7})`;
        
        ctx.beginPath();
        ctx.strokeStyle = sparkleColor;
        ctx.lineWidth = baseWidth * 0.3;
        ctx.globalAlpha = sparkleIntensity * 0.8;
        ctx.shadowBlur = 4;
        ctx.shadowColor = baseColor;
        
        drawSmoothCurve(ctx, points);
        ctx.stroke();
      }

      // 리셋
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // 호버 시 스터디 이름 표시 (마우스 위치에 따라)
      if (isHovered) {
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;
        
        // 텍스트가 화면 밖으로 나가지 않도록 조정
        const textPadding = 80;
        const adjustedX = Math.max(textPadding, Math.min(canvas.offsetWidth - textPadding, mouseX));
        const adjustedY = Math.max(40, mouseY - 25);
        
        // 텍스트 배경 글로우 (더 넓은 범위)
        ctx.save();
        ctx.font = 'bold 16px Pretendard';
        ctx.textAlign = 'center';
        ctx.fillStyle = baseColor;
        ctx.shadowBlur = 25;
        ctx.shadowColor = baseColor;
        ctx.globalAlpha = 0.6;
        ctx.fillText(`${thread.name} ${thread.generation}기`, adjustedX, adjustedY);
        
        // 중간 글로우
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = baseColor;
        ctx.fillText(`${thread.name} ${thread.generation}기`, adjustedX, adjustedY);
        
        // 텍스트 메인 (밝은 흰색 코어)
        ctx.shadowBlur = 4;
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${thread.name} ${thread.generation}기`, adjustedX, adjustedY);
        ctx.restore();
      }
    };

    // 부드러운 곡선 그리기 헬퍼 함수 (Catmull-Rom 스플라인 기반)
    const drawSmoothCurve = (context: CanvasRenderingContext2D, points: {x: number, y: number}[]) => {
      if (points.length < 2) return;
      
      context.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      
      // 마지막 점들 처리
      if (points.length > 2) {
        context.quadraticCurveTo(
          points[points.length - 2].x, 
          points[points.length - 2].y,
          points[points.length - 1].x, 
          points[points.length - 1].y
        );
      }
    };

    const drawIntersections = (time: number) => {
      // 성능 최적화된 교차점 효과
      glowCtx.clearRect(0, 0, glowCanvas.offsetWidth, glowCanvas.offsetHeight);


      // 실들의 교차점에서 발생하는 자연스러운 에너지 필드
      const intersectionPoints: {x: number, y: number, intensity: number, color1: string, color2: string}[] = [];
      
      for (let i = 0; i < threadsRef.current.length - 1; i++) {
        for (let j = i + 1; j < threadsRef.current.length; j++) {
          const thread1 = threadsRef.current[i];
          const thread2 = threadsRef.current[j];

          // 성능 최적화를 위해 간격 증가
          for (let x = 0; x < canvas.offsetWidth; x += 60) {
            const progress = x / canvas.offsetWidth;
            
            // 실제 곡선 계산과 정확히 동일한 방식으로 위치 계산
            let y1 = canvas.offsetHeight / 2;
            y1 += Math.sin((progress * Math.PI * 2 * thread1.frequency) + thread1.phase + time) * thread1.amplitude;
            y1 += Math.sin((progress * Math.PI * 4 * thread1.frequency * 0.7) + thread1.phase * 1.3 + time * 1.2) * (thread1.amplitude * 0.3);
            y1 += Math.sin((progress * Math.PI * 8 * thread1.frequency * 0.4) + thread1.phase * 2.1 + time * 1.8) * (thread1.amplitude * 0.1);
            
            let y2 = canvas.offsetHeight / 2;
            y2 += Math.sin((progress * Math.PI * 2 * thread2.frequency) + thread2.phase + time) * thread2.amplitude;
            y2 += Math.sin((progress * Math.PI * 4 * thread2.frequency * 0.7) + thread2.phase * 1.3 + time * 1.2) * (thread2.amplitude * 0.3);
            y2 += Math.sin((progress * Math.PI * 8 * thread2.frequency * 0.4) + thread2.phase * 2.1 + time * 1.8) * (thread2.amplitude * 0.1);

            const distance = Math.abs(y1 - y2);
            const threshold = 25; // 더 넓은 교차 영역
            
            if (distance < threshold) {
              const intersectionY = (y1 + y2) / 2;
              const intensity = Math.pow((threshold - distance) / threshold, 1.5); // 부드러운 감쇠
              
              intersectionPoints.push({
                x,
                y: intersectionY,
                intensity,
                color1: thread1.color,
                color2: thread2.color
              });
            }
          }
        }
      }

      // 성능 최적화된 클러스터 처리
      if (intersectionPoints.length > 0) {
        const clusters = groupNearbyPoints(intersectionPoints, 100);
        
        // 최대 처리할 클러스터 수 제한 (성능 최적화)
        const maxClusters = Math.min(clusters.length, 8);
        
        for (let i = 0; i < maxClusters; i++) {
          const cluster = clusters[i];
          const centerX = cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length;
          const centerY = cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length;
          const totalIntensity = cluster.reduce((sum, p) => sum + p.intensity, 0) / cluster.length;
          
          // 최적화된 에너지 필드 (비활성화)
          // drawOptimizedEnergyField(glowCtx, centerX, centerY, totalIntensity, time, cluster[0].color1);
        }
      }

    };

    // 교차점들을 그룹으로 묶는 헬퍼 함수
    const groupNearbyPoints = (points: any[], maxDistance: number) => {
      const clusters: any[][] = [];
      const used = new Set();
      
      points.forEach((point, index) => {
        if (used.has(index)) return;
        
        const cluster = [point];
        used.add(index);
        
        points.forEach((otherPoint, otherIndex) => {
          if (used.has(otherIndex)) return;
          
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) + 
            Math.pow(point.y - otherPoint.y, 2)
          );
          
          if (distance < maxDistance) {
            cluster.push(otherPoint);
            used.add(otherIndex);
          }
        });
        
        clusters.push(cluster);
      });
      
      return clusters;
    };

    // 은은한 원형 글로우 효과 (배경용)
    const drawOptimizedEnergyField = (
      context: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      intensity: number, 
      time: number,
      color1: string
    ) => {
      // 원형 반짝임 (더 자주 나타나도록 조정)
      if (intensity > 0.2 && Math.random() > 0.7) { // 30% 확률로 나타남
        const r = parseInt(color1.slice(1, 3), 16);
        const g = parseInt(color1.slice(3, 5), 16);
        const b = parseInt(color1.slice(5, 7), 16);
        
        // 시간 기반 페이드 인/아웃 애니메이션
        const pulsePhase = (time * 3 + x * 0.01 + y * 0.01) % (Math.PI * 2);
        const pulseBrightness = Math.max(0, Math.sin(pulsePhase));
        const fadeIntensity = intensity * pulseBrightness * 0.6; // 더 눈에 띄게
        
        if (fadeIntensity > 0.03) { // 낮은 임계값
          // 부드러운 원형 글로우
          const glowRadius = 12 + Math.sin(time * 1.5 + x * 0.02) * 3; // 더 큰 크기
          const centralGlow = context.createRadialGradient(x, y, 0, x, y, glowRadius);
          
          // 더 진한 그라데이션
          centralGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fadeIntensity * 0.8})`);
          centralGlow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${fadeIntensity * 0.6})`);
          centralGlow.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${fadeIntensity * 0.3})`);
          centralGlow.addColorStop(1, 'transparent');
          
          context.save();
          context.fillStyle = centralGlow;
          context.globalAlpha = fadeIntensity * 3; // 더 진하게
          
          context.beginPath();
          context.arc(x, y, glowRadius, 0, Math.PI * 2);
          context.fill();
          context.restore();
          
          // 중심점 더 잘 보이게
          if (fadeIntensity > 0.1) {
            const coreGlow = context.createRadialGradient(x, y, 0, x, y, 3);
            coreGlow.addColorStop(0, `rgba(255, 255, 255, ${fadeIntensity})`);
            coreGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${fadeIntensity * 0.7})`);
            coreGlow.addColorStop(1, 'transparent');
            
            context.save();
            context.fillStyle = coreGlow;
            context.globalAlpha = fadeIntensity * 1.5;
            context.beginPath();
            context.arc(x, y, 3, 0, Math.PI * 2);
            context.fill();
            context.restore();
          }
        }
      }
    };

    // 최적화된 우주 에너지 펄스
    const drawCosmicPulse = (context: CanvasRenderingContext2D, time: number) => {
      const pulseIntensity = Math.sin(time * 2) * 0.4 + 0.6;
      const gradient = context.createLinearGradient(0, 0, canvas.offsetWidth, 0);
      
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, `rgba(195, 232, 141, ${0.008 * pulseIntensity})`);
      gradient.addColorStop(1, 'transparent');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
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

    let frameCount = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const time = Date.now() * 0.0005;
      animationPhaseRef.current = time;
      frameCount++;

      // 각 실 그리기
      threadsRef.current.forEach((thread) => {
        drawThread(thread, time);
      });

      // 교차점 효과 (성능을 위해 매 2프레임마다)
      if (frameCount % 2 === 0) {
        drawIntersections(time);
      }

      // 호버 체크 (성능을 위해 매 3프레임마다)
      if (frameCount % 3 === 0) {
        checkHover();
      }

      // 스터디 라벨 그리기 (최적화)
      studyLabels.forEach(label => {
        ctx.save();
        ctx.globalAlpha = label.opacity * 0.8;
        ctx.fillStyle = '#C3E88D';
        ctx.font = '14px Pretendard';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
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
      // 메모리 정리
      gradientCache.clear();
    };
  }, [hoveredThread, studyLabels]);

  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('active');
              }, index * 200);
            }
          });
        },
        { threshold: 0.5 }
    );

    starsRef.current.forEach((star) => {
      if (star) observer.observe(star);
    });

    return () => observer.disconnect();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
      <>
        <section className="stats section-background">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <div className="title-layout">
                  <div className="title-main">
                    <span className="title-part first">꾸준히 연결되는</span>
                  </div>
                  <div className="title-sub">
                    <span className="title-part accent">가장 치열한 사생활</span>
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
        {/*<section className="journey" id="journey">*/}
        {/*  <div className="container" ref={containerRef}>*/}
        {/*    <div className="section-header">*/}
        {/*      <h2 className="section-title">당신의 Async 여정</h2>*/}
        {/*      <p className="section-subtitle">함께 성장하는 여정의 네 가지 별</p>*/}
        {/*    </div>*/}

        {/*    <div className="journey-constellation">*/}
        {/*      /!* SVG 별자리 연결선 *!/*/}
        {/*      <svg className="constellation-svg" viewBox="0 0 1200 600">*/}
        {/*        <defs>*/}
        {/*          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">*/}
        {/*            <stop offset="0%" stopColor="#C3E88D" stopOpacity="0.3" />*/}
        {/*            <stop offset="50%" stopColor="#82aaff" stopOpacity="0.5" />*/}
        {/*            <stop offset="100%" stopColor="#C3E88D" stopOpacity="0.3" />*/}
        {/*          </linearGradient>*/}
        {/*        </defs>*/}
        {/*        <path*/}
        {/*            ref={pathRef}*/}
        {/*            className="constellation-path"*/}
        {/*            d="M150,150 Q300,50 450,150 T750,150 Q900,250 1050,150"*/}
        {/*            fill="none"*/}
        {/*            stroke="url(#pathGradient)"*/}
        {/*            strokeWidth="2"*/}
        {/*            strokeDasharray="5,5"*/}
        {/*        />*/}
        {/*      </svg>*/}

        {/*      /!* 별들과 내용 *!/*/}
        {/*      <div className="journey-steps">*/}
        {/*        {journeySteps.map((step, index) => (*/}
        {/*            <div*/}
        {/*                key={step.id}*/}
        {/*                className={`journey-step step-${step.id}`}*/}
        {/*                ref={(el) => (starsRef.current[index] = el)}*/}
        {/*            >*/}
        {/*              <div className="star-container">*/}
        {/*                <div className="star-glow"></div>*/}
        {/*                <div className="star">*/}
        {/*                  <span className="star-number">{step.id}</span>*/}
        {/*                </div>*/}
        {/*                <div className="star-pulse"></div>*/}
        {/*              </div>*/}

        {/*              <div className="step-content">*/}
        {/*                <h3 className="step-title">{step.title}</h3>*/}
        {/*                <p className="step-subtitle">{step.subtitle}</p>*/}

        {/*                <div className="step-testimonial">*/}
        {/*                  <p className="testimonial-content">"{step.testimonial.content}"</p>*/}
        {/*                  <p className="testimonial-author">*/}
        {/*                    - {step.testimonial.author}, {step.testimonial.studyName}*/}
        {/*                  </p>*/}
        {/*                </div>*/}
        {/*              </div>*/}
        {/*            </div>*/}
        {/*        ))}*/}
        {/*      </div>*/}
        {/*    </div>*/}

        {/*  </div>*/}
        {/*</section>*/}
      </>
  );
};

export default Stats;
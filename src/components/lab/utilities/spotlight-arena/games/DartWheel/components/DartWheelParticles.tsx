import { useEffect, useRef } from 'react';
import { Circle, Group } from 'react-konva';
import Konva from 'konva';

interface DartWheelParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  life: number;
}

interface DartWheelParticlesProps {
  dartWheelEmitX: number;
  dartWheelEmitY: number;
  dartWheelEmitActive: boolean;
  dartWheelParticleColor?: string;
  dartWheelParticleCount?: number;
  dartWheelIsBonus?: boolean;
  dartWheelParticleType?: 'default' | 'gold' | 'confetti' | 'stars' | 'sparks' | 'leaves';
}

function DartWheelParticles({
  dartWheelEmitX,
  dartWheelEmitY,
  dartWheelEmitActive,
  dartWheelParticleColor = '#FFD700',
  dartWheelParticleCount = 30,
  dartWheelIsBonus = false,
  dartWheelParticleType = 'default'
}: DartWheelParticlesProps): React.ReactNode {
  const dartWheelParticlesRef = useRef<DartWheelParticle[]>([]);
  const dartWheelAnimationRef = useRef<Konva.Animation | null>(null);
  const dartWheelGroupRef = useRef<Konva.Group>(null);

  // 파티클 생성
  const createDartWheelParticle = (index: number): DartWheelParticle => {
    const angle = (Math.PI * 2 * index) / dartWheelParticleCount + Math.random() * 0.5;
    const speed = dartWheelIsBonus ? 8 + Math.random() * 4 : 4 + Math.random() * 3;
    
    let colors: string[];
    let particleSize: number;
    
    switch (dartWheelParticleType) {
      case 'confetti':
        colors = ['#E53935', '#FB8C00', '#43A047', '#00ACC1', '#FFEB3B', '#9C27B0'];
        particleSize = 4 + Math.random() * 4;
        break;
      case 'gold':
        colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493'];
        particleSize = 3 + Math.random() * 3;
        break;
      case 'stars':
        colors = ['#64B5F6', '#2196F3', '#1976D2', '#E3F2FD'];
        particleSize = 3 + Math.random() * 2;
        break;
      case 'sparks':
        colors = ['#FF006E', '#FFBE0B', '#06FFB4', '#8338EC'];
        particleSize = 2 + Math.random() * 2;
        break;
      case 'leaves':
        colors = ['#66BB6A', '#4CAF50', '#388E3C', '#81C784'];
        particleSize = 5 + Math.random() * 3;
        break;
      default:
        colors = dartWheelIsBonus 
          ? ['#FFD700', '#FFA500', '#FF6347', '#FF1493'] 
          : [dartWheelParticleColor, '#FFFFFF'];
        particleSize = dartWheelIsBonus ? 3 + Math.random() * 3 : 2 + Math.random() * 2;
    }
    
    return {
      id: `particle-${Date.now()}-${index}`,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      radius: particleSize,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      life: 1,
    };
  };

  // 파티클 업데이트
  const updateDartWheelParticles = () => {
    dartWheelParticlesRef.current = dartWheelParticlesRef.current
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.3, // 중력
        vx: particle.vx * 0.98, // 마찰
        life: particle.life - 0.02,
        opacity: particle.life,
      }))
      .filter(particle => particle.life > 0);
  };

  useEffect(() => {
    if (dartWheelEmitActive && dartWheelGroupRef.current) {
      // 파티클 초기화
      dartWheelParticlesRef.current = Array.from(
        { length: dartWheelParticleCount }, 
        (_, i) => createDartWheelParticle(i)
      );

      // 애니메이션 시작
      dartWheelAnimationRef.current = new Konva.Animation(() => {
        updateDartWheelParticles();
        
        // 파티클 렌더링
        if (dartWheelGroupRef.current) {
          dartWheelGroupRef.current.destroyChildren();
          
          dartWheelParticlesRef.current.forEach(particle => {
            const circle = new Konva.Circle({
              x: particle.x,
              y: particle.y,
              radius: particle.radius,
              fill: particle.color,
              opacity: particle.opacity,
              shadowColor: particle.color,
              shadowBlur: dartWheelIsBonus ? 10 : 5,
              shadowOpacity: 0.8,
            });
            
            dartWheelGroupRef.current?.add(circle);
          });
        }

        // 모든 파티클이 사라지면 애니메이션 종료
        if (dartWheelParticlesRef.current.length === 0) {
          dartWheelAnimationRef.current?.stop();
        }
      }, dartWheelGroupRef.current.getLayer());

      dartWheelAnimationRef.current.start();

      return () => {
        dartWheelAnimationRef.current?.stop();
      };
    }
  }, [dartWheelEmitActive, dartWheelParticleCount, dartWheelIsBonus]);

  return (
    <Group 
      ref={dartWheelGroupRef} 
      x={dartWheelEmitX} 
      y={dartWheelEmitY}
    />
  );
}

export default DartWheelParticles;
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
}

function DartWheelParticles({
  dartWheelEmitX,
  dartWheelEmitY,
  dartWheelEmitActive,
  dartWheelParticleColor = '#FFD700',
  dartWheelParticleCount = 30,
  dartWheelIsBonus = false
}: DartWheelParticlesProps): React.ReactNode {
  const dartWheelParticlesRef = useRef<DartWheelParticle[]>([]);
  const dartWheelAnimationRef = useRef<Konva.Animation | null>(null);
  const dartWheelGroupRef = useRef<Konva.Group>(null);

  // 파티클 생성
  const createDartWheelParticle = (index: number): DartWheelParticle => {
    const angle = (Math.PI * 2 * index) / dartWheelParticleCount + Math.random() * 0.5;
    const speed = dartWheelIsBonus ? 8 + Math.random() * 4 : 4 + Math.random() * 3;
    const colors = dartWheelIsBonus 
      ? ['#FFD700', '#FFA500', '#FF6347', '#FF1493'] 
      : [dartWheelParticleColor, '#FFFFFF'];
    
    return {
      id: `particle-${Date.now()}-${index}`,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      radius: dartWheelIsBonus ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
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
import React, { useEffect, useState } from 'react';
import './CascadeEffects.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
}

interface CascadeEffectsProps {
  cascadeLevel: number;
  isActive: boolean;
}

export const CascadeEffects: React.FC<CascadeEffectsProps> = ({ cascadeLevel, isActive }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive || cascadeLevel === 0) return;

    // 캐스케이드 레벨에 따라 파티클 생성
    const newParticles: Particle[] = [];
    const particleCount = cascadeLevel * 5 + 10;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 4)],
        size: Math.random() * 6 + 4,
        duration: Math.random() * 1 + 0.5,
      });
    }

    setParticles(newParticles);

    // 애니메이션 후 파티클 제거
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [cascadeLevel, isActive]);

  if (!isActive || cascadeLevel === 0) return null;

  return (
    <div className="cascade-effects">
      {/* 캐스케이드 레벨 표시 */}
      <div className="cascade-level-display">
        <div className="level-text">CASCADE</div>
        <div className="level-number">x{cascadeLevel}</div>
      </div>

      {/* 파티클 효과 */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* 배경 광선 효과 */}
      <div className="cascade-rays">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="ray"
            style={{
              transform: `rotate(${i * 60}deg)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
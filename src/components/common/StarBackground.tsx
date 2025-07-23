import React, { useMemo } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
}

interface ShootingStar {
  id: number;
  animationDelay: number;
}

interface StarBackgroundProps {
  starCount?: number;
  shootingStarCount?: number;
}

function StarBackground({ 
  starCount = 50, 
  shootingStarCount = 2 
}: StarBackgroundProps): React.ReactNode {
  // 별들의 위치와 애니메이션 값을 메모이제이션
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2
    }));
  }, [starCount]);

  // 별똥별 애니메이션 값을 메모이제이션
  const shootingStars = useMemo<ShootingStar[]>(() => {
    return Array.from({ length: shootingStarCount }, (_, i) => ({
      id: i,
      animationDelay: i * 15 + Math.random() * 10
    }));
  }, [shootingStarCount]);

  return (
    <>
      {/* 움직이는 별 배경 */}
      <div className="auth-stars">
        {stars.map((star) => (
          <div 
            key={star.id} 
            className="auth-star" 
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`
            }}
          />
        ))}
      </div>
      
      {/* 별똥별 효과 */}
      <div className="auth-shooting-stars">
        {shootingStars.map((shootingStar) => (
          <div
            key={shootingStar.id}
            className="auth-shooting-star"
            style={{
              animationDelay: `${shootingStar.animationDelay}s`
            }}
          />
        ))}
      </div>
    </>
  );
}

export default StarBackground;
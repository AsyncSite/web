import React, { useState, useEffect, useRef } from 'react';
import './WhoWeAreV2Page.css';

// Team member data - 동일한 데이터 사용
export const whoweareV2TeamMembers = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    darkColor: '#4f46e5',
    constellation: { x: 20, y: 30 }
  },
  {
    id: 'jinwoo-cho',
    name: '진우 조',
    initials: 'JC',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#82aaff',
    darkColor: '#5b82d8',
    constellation: { x: 70, y: 25 }
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    darkColor: '#a3c76d',
    constellation: { x: 30, y: 65 }
  },
  {
    id: 'geon-lee',
    name: 'GEON LEE',
    initials: 'GL',
    role: 'Connection Engineer',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    color: '#f87171',
    darkColor: '#dc2626',
    constellation: { x: 75, y: 70 }
  },
  {
    id: 'jiyeon-kim',
    name: '지연 김',
    initials: 'JK',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    darkColor: '#10b981',
    constellation: { x: 50, y: 45 }
  },
  {
    id: 'dongmin-cha',
    name: '차동민',
    initials: 'DC',
    role: 'Platform Engineer',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    color: '#f59e0b',
    darkColor: '#d97706',
    constellation: { x: 45, y: 80 }
  }
];

interface WhoWeAreV2MemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  darkColor: string;
  constellation: { x: number; y: number };
}

const WhoWeAreV2Page: React.FC = () => {
  const [whoweareV2SelectedMember, setWhoweareV2SelectedMember] = useState<WhoWeAreV2MemberData | null>(null);
  const [whoweareV2HoveredMember, setWhoweareV2HoveredMember] = useState<string | null>(null);
  const [whoweareV2MousePos, setWhoweareV2MousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Canvas drawing for constellation lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw constellation lines
      ctx.strokeStyle = 'rgba(195, 232, 141, 0.1)';
      ctx.lineWidth = 1;

      // Draw base connections (always visible but faint)
      whoweareV2TeamMembers.forEach((member, index) => {
        const startX = (member.constellation.x / 100) * canvas.width;
        const startY = (member.constellation.y / 100) * canvas.height;

        // Connect to nearby members
        whoweareV2TeamMembers.forEach((otherMember, otherIndex) => {
          if (index < otherIndex) {
            const endX = (otherMember.constellation.x / 100) * canvas.width;
            const endY = (otherMember.constellation.y / 100) * canvas.height;
            
            const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            
            if (distance < 400) {
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            }
          }
        });
      });

      // Draw hover connections
      if (whoweareV2HoveredMember) {
        const hoveredMemberData = whoweareV2TeamMembers.find(m => m.id === whoweareV2HoveredMember);
        if (hoveredMemberData) {
          const hoveredX = (hoveredMemberData.constellation.x / 100) * canvas.width;
          const hoveredY = (hoveredMemberData.constellation.y / 100) * canvas.height;

          ctx.strokeStyle = hoveredMemberData.color;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 20;
          ctx.shadowColor = hoveredMemberData.color;

          // Draw connections to all other members
          whoweareV2TeamMembers.forEach((member) => {
            if (member.id !== whoweareV2HoveredMember) {
              const x = (member.constellation.x / 100) * canvas.width;
              const y = (member.constellation.y / 100) * canvas.height;

              ctx.beginPath();
              ctx.moveTo(hoveredX, hoveredY);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
          });

          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [whoweareV2HoveredMember]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setWhoweareV2MousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const closeWhoWeareV2MemberPanel = () => {
    setWhoweareV2SelectedMember(null);
  };

  return (
    <div className="whoweare-v2-container">
      {/* Background stars */}
      <div className="whoweare-v2-stars-layer" />
      
      {/* Constellation canvas */}
      <canvas ref={canvasRef} className="whoweare-v2-constellation-canvas" />

      {/* Header */}
      <div className="whoweare-v2-header">
        <h1 className="whoweare-v2-title">CONSTELLATION OF MINDS</h1>
        <p className="whoweare-v2-subtitle">AsyncSite 팀의 별자리</p>
      </div>

      {/* Team members as stars */}
      <div 
        className="whoweare-v2-constellation-map"
        style={{
          transform: `translate(${whoweareV2MousePos.x * 20}px, ${whoweareV2MousePos.y * 20}px)`
        }}
      >
        {whoweareV2TeamMembers.map((member) => (
          <div
            key={member.id}
            className={`whoweare-v2-star ${whoweareV2HoveredMember === member.id ? 'hovered' : ''}`}
            style={{
              left: `${member.constellation.x}%`,
              top: `${member.constellation.y}%`,
              '--star-color': member.color,
              '--star-dark-color': member.darkColor
            } as React.CSSProperties}
            onMouseEnter={() => setWhoweareV2HoveredMember(member.id)}
            onMouseLeave={() => setWhoweareV2HoveredMember(null)}
            onClick={() => setWhoweareV2SelectedMember(member)}
          >
            <div className="whoweare-v2-star-core">
              <span className="whoweare-v2-star-initials">{member.initials}</span>
            </div>
            <div className="whoweare-v2-star-label">
              <div className="whoweare-v2-star-name">{member.name}</div>
              <div className="whoweare-v2-star-role">{member.role}</div>
            </div>
            <div className="whoweare-v2-star-glow" />
            <div className="whoweare-v2-star-pulse" />
          </div>
        ))}
      </div>

      {/* Member detail panel */}
      {whoweareV2SelectedMember && (
        <div className="whoweare-v2-overlay">
          <div 
            className="whoweare-v2-member-panel"
            style={{
              '--panel-color': whoweareV2SelectedMember.color,
              '--panel-dark-color': whoweareV2SelectedMember.darkColor
            } as React.CSSProperties}
          >
            <button 
              className="whoweare-v2-close-btn"
              onClick={closeWhoWeareV2MemberPanel}
              aria-label="닫기"
            >
              ×
            </button>
            
            <div className="whoweare-v2-member-content">
              <div className="whoweare-v2-member-avatar">
                {whoweareV2SelectedMember.initials}
              </div>
              
              <h2 className="whoweare-v2-member-name">
                {whoweareV2SelectedMember.name}
              </h2>
              
              <div className="whoweare-v2-member-role">
                {whoweareV2SelectedMember.role}
              </div>
              
              <blockquote className="whoweare-v2-member-quote">
                {whoweareV2SelectedMember.quote}
              </blockquote>
              
              <p className="whoweare-v2-member-story">
                {whoweareV2SelectedMember.story}
              </p>
              
              <div className="whoweare-v2-member-links">
                <a href="#" className="whoweare-v2-link-btn" aria-label="GitHub">
                  <span>G</span>
                </a>
                <a href="#" className="whoweare-v2-link-btn" aria-label="Blog">
                  <span>B</span>
                </a>
                <a href="#" className="whoweare-v2-link-btn" aria-label="LinkedIn">
                  <span>L</span>
                </a>
              </div>
            </div>
            
            <div className="whoweare-v2-panel-footer">
              <a href="/study" className="whoweare-v2-cta-link">
                함께 여행을 떠나요 →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="whoweare-v2-navigation-hint">
        <span className="whoweare-v2-hint-text">별을 클릭해 팀원을 만나보세요</span>
        <div className="whoweare-v2-hint-controls">
          <span className="whoweare-v2-key">ESC</span>
          <span className="whoweare-v2-key-desc">닫기</span>
        </div>
      </div>
    </div>
  );
};

export default WhoWeAreV2Page;
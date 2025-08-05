import React, { useState, useEffect, useRef } from 'react';
import './WhoWeAreV4Page.css';

// Team member data with workstation positions
export const whoweareV4TeamMembers = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Product Architect',
    title: 'CAPTAIN',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    station: {
      position: 'captain',
      screens: ['System Architecture', 'Team Status', 'Mission Control'],
      tools: ['Blueprint Hologram', 'Decision Matrix']
    }
  },
  {
    id: 'jinwoo-cho',
    name: '진우 조',
    initials: 'JC',
    role: 'System Engineer',
    title: 'ENGINEER',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#82aaff',
    station: {
      position: 'engineering',
      screens: ['System Diagnostics', 'Code Terminal', 'Performance Metrics'],
      tools: ['Debug Console', 'System Monitor']
    }
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    title: 'DESIGNER',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    station: {
      position: 'design',
      screens: ['User Interface', '3D Prototypes', 'Color Systems'],
      tools: ['Design Tablet', 'Holographic Mockup']
    }
  },
  {
    id: 'geon-lee',
    name: 'GEON LEE',
    initials: 'GL',
    role: 'Connection Engineer',
    title: 'DATA OPS',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    color: '#f87171',
    station: {
      position: 'data',
      screens: ['Data Flow', 'Analytics Dashboard', 'Connection Map'],
      tools: ['Stream Monitor', 'Query Builder']
    }
  },
  {
    id: 'jiyeon-kim',
    name: '지연 김',
    initials: 'JK',
    role: 'Growth Path Builder',
    title: 'COMMUNITY',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    station: {
      position: 'community',
      screens: ['Member Journey', 'Community Stats', 'Growth Paths'],
      tools: ['Engagement Radar', 'Member Directory']
    }
  },
  {
    id: 'dongmin-cha',
    name: '차동민',
    initials: 'DC',
    role: 'Platform Engineer',
    title: 'INFRASTRUCTURE',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    color: '#f59e0b',
    station: {
      position: 'platform',
      screens: ['Cloud Console', 'Security Grid', 'Infrastructure Map'],
      tools: ['Deploy Terminal', 'Resource Monitor']
    }
  }
];

interface WhoWeAreV4MemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  title: string;
  quote: string;
  story: string;
  color: string;
  station: {
    position: string;
    screens: string[];
    tools: string[];
  };
}

const WhoWeAreV4Page: React.FC = () => {
  const [whoweareV4SelectedMember, setWhoweareV4SelectedMember] = useState<WhoWeAreV4MemberData | null>(null);
  const [whoweareV4ActiveStation, setWhoweareV4ActiveStation] = useState<string | null>(null);
  const [whoweareV4ViewAngle, setWhoweareV4ViewAngle] = useState(0);
  const bridgeRef = useRef<HTMLDivElement>(null);

  // Mouse parallax effect for bridge rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      setWhoweareV4ViewAngle(x);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && whoweareV4SelectedMember) {
        closeWhoWeareV4MemberPanel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [whoweareV4SelectedMember]);

  const closeWhoWeareV4MemberPanel = () => {
    setWhoweareV4SelectedMember(null);
    setWhoweareV4ActiveStation(null);
  };

  const handleStationClick = (member: WhoWeAreV4MemberData) => {
    setWhoweareV4SelectedMember(member);
    setWhoweareV4ActiveStation(member.station.position);
  };

  return (
    <div className="whoweare-v4-container">
      {/* Space background with moving stars */}
      <div className="whoweare-v4-space-bg">
        <div className="whoweare-v4-stars-layer-1" />
        <div className="whoweare-v4-stars-layer-2" />
        <div className="whoweare-v4-nebula" />
      </div>

      {/* Ship exterior view */}
      <div className="whoweare-v4-ship-exterior">
        <div className="whoweare-v4-ship-hull" />
        <div className="whoweare-v4-ship-engines" />
      </div>

      {/* Main bridge container */}
      <div 
        ref={bridgeRef}
        className="whoweare-v4-bridge"
        style={{
          transform: `translate(-50%, -50%) perspective(1200px) rotateY(${whoweareV4ViewAngle}deg)`
        }}
      >
        {/* Bridge floor */}
        <div className="whoweare-v4-bridge-floor" />
        
        {/* Central hologram */}
        <div className="whoweare-v4-central-hologram">
          <div className="whoweare-v4-hologram-base" />
          <div className="whoweare-v4-hologram-projection">
            <div className="whoweare-v4-hologram-logo">ASYNCSITE</div>
            <div className="whoweare-v4-hologram-tagline">Growing Together in Space</div>
          </div>
          <div className="whoweare-v4-hologram-particles" />
        </div>

        {/* Workstations */}
        {whoweareV4TeamMembers.map((member) => (
          <div
            key={member.id}
            className={`whoweare-v4-workstation whoweare-v4-station-${member.station.position} ${
              whoweareV4ActiveStation === member.station.position ? 'active' : ''
            }`}
            onClick={() => handleStationClick(member)}
          >
            {/* Station structure */}
            <div className="whoweare-v4-station-base" />
            <div className="whoweare-v4-station-chair" />
            
            {/* Holographic operator */}
            <div 
              className="whoweare-v4-operator"
              style={{ '--operator-color': member.color } as React.CSSProperties}
            >
              <div className="whoweare-v4-operator-avatar">
                {member.initials}
              </div>
              <div className="whoweare-v4-operator-aura" />
            </div>

            {/* Station screens */}
            <div className="whoweare-v4-station-screens">
              {member.station.screens.map((screen, index) => (
                <div 
                  key={index} 
                  className={`whoweare-v4-screen whoweare-v4-screen-${index + 1}`}
                  style={{ '--screen-color': member.color } as React.CSSProperties}
                >
                  <div className="whoweare-v4-screen-content">
                    <div className="whoweare-v4-screen-title">{screen}</div>
                    <div className="whoweare-v4-screen-data" />
                  </div>
                </div>
              ))}
            </div>

            {/* Station label */}
            <div className="whoweare-v4-station-label">
              <div className="whoweare-v4-station-title">{member.title}</div>
              <div className="whoweare-v4-station-name">{member.name}</div>
            </div>
          </div>
        ))}

        {/* Bridge windows */}
        <div className="whoweare-v4-bridge-windows">
          <div className="whoweare-v4-window whoweare-v4-window-main">
            <div className="whoweare-v4-window-frame" />
            <div className="whoweare-v4-window-view">
              <div className="whoweare-v4-planet" />
              <div className="whoweare-v4-starfield" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="whoweare-v4-header">
        <h1 className="whoweare-v4-title">BRIDGE CREW</h1>
        <p className="whoweare-v4-subtitle">우주선 AsyncSite호의 승무원들</p>
      </div>

      {/* Member detail panel */}
      {whoweareV4SelectedMember && (
        <div className="whoweare-v4-overlay">
          <div 
            className="whoweare-v4-member-panel"
            style={{
              '--member-color': whoweareV4SelectedMember.color
            } as React.CSSProperties}
          >
            {/* Holographic effect background */}
            <div className="whoweare-v4-panel-hologram-bg" />
            
            <button 
              className="whoweare-v4-close-btn"
              onClick={closeWhoWeareV4MemberPanel}
            >
              <span>×</span>
            </button>

            <div className="whoweare-v4-panel-content">
              {/* Member info header */}
              <div className="whoweare-v4-panel-header">
                <div className="whoweare-v4-member-badge">
                  <div className="whoweare-v4-badge-inner">
                    {whoweareV4SelectedMember.initials}
                  </div>
                  <div className="whoweare-v4-badge-ring" />
                </div>
                
                <div className="whoweare-v4-member-info">
                  <h2 className="whoweare-v4-member-name">
                    {whoweareV4SelectedMember.name}
                  </h2>
                  <div className="whoweare-v4-member-designation">
                    <span className="whoweare-v4-member-title">
                      {whoweareV4SelectedMember.title}
                    </span>
                    <span className="whoweare-v4-member-separator">•</span>
                    <span className="whoweare-v4-member-role">
                      {whoweareV4SelectedMember.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="whoweare-v4-member-quote">
                {whoweareV4SelectedMember.quote}
              </blockquote>

              {/* Story */}
              <p className="whoweare-v4-member-story">
                {whoweareV4SelectedMember.story}
              </p>

              {/* Station details */}
              <div className="whoweare-v4-station-details">
                <h3 className="whoweare-v4-details-title">STATION EQUIPMENT</h3>
                <div className="whoweare-v4-equipment-grid">
                  <div className="whoweare-v4-equipment-section">
                    <h4>DISPLAYS</h4>
                    <ul className="whoweare-v4-equipment-list">
                      {whoweareV4SelectedMember.station.screens.map((screen, index) => (
                        <li key={index}>{screen}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="whoweare-v4-equipment-section">
                    <h4>TOOLS</h4>
                    <ul className="whoweare-v4-equipment-list">
                      {whoweareV4SelectedMember.station.tools.map((tool, index) => (
                        <li key={index}>{tool}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="whoweare-v4-member-links">
                <a href="#" className="whoweare-v4-link-btn">
                  <span className="whoweare-v4-link-icon">G</span>
                  <span className="whoweare-v4-link-text">GitHub</span>
                </a>
                <a href="#" className="whoweare-v4-link-btn">
                  <span className="whoweare-v4-link-icon">B</span>
                  <span className="whoweare-v4-link-text">Blog</span>
                </a>
                <a href="#" className="whoweare-v4-link-btn">
                  <span className="whoweare-v4-link-icon">L</span>
                  <span className="whoweare-v4-link-text">LinkedIn</span>
                </a>
              </div>

              {/* CTA */}
              <div className="whoweare-v4-panel-cta">
                <a href="/study" className="whoweare-v4-cta-link">
                  승선 신청하기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation instructions */}
      <div className="whoweare-v4-instructions">
        <span>클릭으로 승무원 정보 확인</span>
        <span className="whoweare-v4-separator">•</span>
        <span>마우스로 함교 둘러보기</span>
      </div>
    </div>
  );
};

export default WhoWeAreV4Page;
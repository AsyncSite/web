import React, { useState, useEffect } from 'react';
import ThreeSceneEnhanced, { ThreeSceneEnhancedMemberData } from '../components/whoweare/ThreeSceneEnhanced';
import './WhoWeAreEnhancedPage.css';

export const whoweareEnhancedTeamMembers: ThreeSceneEnhancedMemberData[] = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    position: { x: -5, y: 0, z: 3 },
    techStack: ['React', 'TypeScript', 'AWS', 'MSA']
  },
  {
    id: 'jinwoo-cho',
    name: '진우 조',
    initials: 'JC',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#82aaff',
    position: { x: 5, y: 0, z: -3 },
    techStack: ['Java', 'Spring', 'Kubernetes', 'Redis']
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    position: { x: -3, y: 0, z: -5 },
    techStack: ['Figma', 'CSS', 'Animation', 'Three.js']
  },
  {
    id: 'geon-lee',
    name: 'GEON LEE',
    initials: 'GL',
    role: 'Connection Engineer',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    color: '#f87171',
    position: { x: 3, y: 0, z: 5 },
    techStack: ['Python', 'Kafka', 'Elasticsearch', 'GraphQL']
  },
  {
    id: 'jiyeon-kim',
    name: '지연 김',
    initials: 'JK',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    position: { x: 0, y: 0, z: 0 },
    techStack: ['Community', 'Mentoring', 'Education', 'Growth']
  },
  {
    id: 'dongmin-cha',
    name: '차동민',
    initials: 'DC',
    role: 'Platform Engineer',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    color: '#f59e0b',
    position: { x: -5, y: 0, z: -2 },
    techStack: ['DevOps', 'Terraform', 'Jenkins', 'Monitoring']
  }
];

const WhoWeAreEnhancedPage: React.FC = () => {
  const [whoweareEnhancedSelectedMember, setWhoweareEnhancedSelectedMember] = useState<ThreeSceneEnhancedMemberData | null>(null);
  const [whoweareEnhancedLoading, setWhoweareEnhancedLoading] = useState(true);
  const [whoweareEnhancedError, setWhoweareEnhancedError] = useState<string | null>(null);
  const [whoweareEnhancedShowInfo, setWhoweareEnhancedShowInfo] = useState(false);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setWhoweareEnhancedError('WebGL이 지원되지 않는 브라우저입니다.');
      setWhoweareEnhancedLoading(false);
    }
  }, []);

  const handleMemberSelect = (member: ThreeSceneEnhancedMemberData | null) => {
    setWhoweareEnhancedSelectedMember(member);
    setWhoweareEnhancedShowInfo(!!member);
  };

  const handleLoadComplete = () => {
    setWhoweareEnhancedLoading(false);
  };

  const handleLoadError = (error: string) => {
    setWhoweareEnhancedError(error);
    setWhoweareEnhancedLoading(false);
  };

  if (whoweareEnhancedError) {
    return (
      <div className="whoweare-enhanced-container">
        <div className="whoweare-enhanced-error">
          <h1>오류가 발생했습니다</h1>
          <p>{whoweareEnhancedError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whoweare-enhanced-container">
      {/* 3D Scene */}
      <div className="whoweare-enhanced-scene-container">
        <ThreeSceneEnhanced
          members={whoweareEnhancedTeamMembers}
          onMemberSelect={handleMemberSelect}
          onLoadComplete={handleLoadComplete}
          onLoadError={handleLoadError}
        />
      </div>

      {/* Loading overlay */}
      {whoweareEnhancedLoading && (
        <div className="whoweare-enhanced-loading">
          <div className="whoweare-enhanced-loading-spinner">
            <div className="whoweare-enhanced-loading-ring"></div>
            <div className="whoweare-enhanced-loading-ring"></div>
            <div className="whoweare-enhanced-loading-ring"></div>
          </div>
          <p>우주 작업실을 준비하는 중...</p>
        </div>
      )}

      {/* Header */}
      <div className="whoweare-enhanced-header">
        <h1 className="whoweare-enhanced-title">ASYNCSITE TEAM</h1>
        <p className="whoweare-enhanced-subtitle">Living Workspace</p>
      </div>

      {/* Member info panel */}
      <div className={`whoweare-enhanced-info-panel ${whoweareEnhancedShowInfo ? 'show' : ''}`}>
        {whoweareEnhancedSelectedMember && (
          <>
            <button 
              className="whoweare-enhanced-close-btn"
              onClick={() => handleMemberSelect(null)}
            >
              ✕
            </button>
            
            <div className="whoweare-enhanced-member-card">
              <div 
                className="whoweare-enhanced-member-avatar"
                style={{ backgroundColor: whoweareEnhancedSelectedMember.color }}
              >
                {whoweareEnhancedSelectedMember.initials}
              </div>
              
              <h2 className="whoweare-enhanced-member-name">
                {whoweareEnhancedSelectedMember.name}
              </h2>
              
              <p className="whoweare-enhanced-member-role">
                {whoweareEnhancedSelectedMember.role}
              </p>
              
              <blockquote className="whoweare-enhanced-member-quote">
                {whoweareEnhancedSelectedMember.quote}
              </blockquote>
              
              <p className="whoweare-enhanced-member-story">
                {whoweareEnhancedSelectedMember.story}
              </p>
              
              <div className="whoweare-enhanced-member-tech">
                <h3>Tech Stack</h3>
                <div className="whoweare-enhanced-tech-list">
                  {whoweareEnhancedSelectedMember.techStack.map((tech, index) => (
                    <span 
                      key={index} 
                      className="whoweare-enhanced-tech-item"
                      style={{ borderColor: whoweareEnhancedSelectedMember.color }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation hint */}
      <div className="whoweare-enhanced-nav-hint">
        <p>작업실을 탐험하며 팀원들을 만나보세요</p>
      </div>
    </div>
  );
};

export default WhoWeAreEnhancedPage;
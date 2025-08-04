import React, { useState, useEffect } from 'react';
import ThreeSceneProfile, { ThreeSceneProfileMemberData } from '../components/whoweare/ThreeSceneProfile';
import './WhoWeAreProfilePage.css';

export const whoweareProfileTeamMembers: ThreeSceneProfileMemberData[] = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    darkColor: '#4338ca',
    position: { x: -5, y: 0, z: 3 }
  },
  {
    id: 'jinwoo-cho',
    name: '진우 조',
    initials: 'JC',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#82aaff',
    darkColor: '#5b7dd6',
    position: { x: 5, y: 0, z: -3 }
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    darkColor: '#95b857',
    position: { x: -3, y: 0, z: -5 }
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
    position: { x: 3, y: 0, z: 5 }
  },
  {
    id: 'jiyeon-kim',
    name: '지연 김',
    initials: 'JK',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    darkColor: '#059669',
    position: { x: 0, y: 0, z: 0 }
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
    position: { x: -5, y: 0, z: -2 }
  }
];

const WhoWeAreProfilePage: React.FC = () => {
  const [whoweareProfileSelectedMember, setWhoweareProfileSelectedMember] = useState<ThreeSceneProfileMemberData | null>(null);
  const [whoweareProfileLoading, setWhoweareProfileLoading] = useState(true);
  const [whoweareProfileError, setWhoweareProfileError] = useState<string | null>(null);
  const [whoweareProfileShowInfo, setWhoweareProfileShowInfo] = useState(false);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setWhoweareProfileError('WebGL이 지원되지 않는 브라우저입니다.');
      setWhoweareProfileLoading(false);
    }
  }, []);

  const handleMemberSelect = (member: ThreeSceneProfileMemberData | null) => {
    setWhoweareProfileSelectedMember(member);
    setWhoweareProfileShowInfo(!!member);
  };

  const handleLoadComplete = () => {
    setWhoweareProfileLoading(false);
  };

  const handleLoadError = (error: string) => {
    setWhoweareProfileError(error);
    setWhoweareProfileLoading(false);
  };

  if (whoweareProfileError) {
    return (
      <div className="whoweare-profile-container">
        <div className="whoweare-profile-error">
          <h1>오류가 발생했습니다</h1>
          <p>{whoweareProfileError}</p>
          <div className="whoweare-profile-fallback">
            <h2>AsyncSite Team</h2>
            <div className="whoweare-profile-grid">
              {whoweareProfileTeamMembers.map((member) => (
                <div key={member.id} className="whoweare-profile-card-2d">
                  <div 
                    className="whoweare-profile-avatar-2d" 
                    style={{ background: `linear-gradient(135deg, ${member.color}, ${member.darkColor})` }}
                  >
                    {member.initials}
                  </div>
                  <h3>{member.name}</h3>
                  <p className="whoweare-profile-role-2d">{member.role}</p>
                  <p className="whoweare-profile-quote-2d">{member.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="whoweare-profile-container">
      {/* 3D Scene */}
      <div className="whoweare-profile-scene-container">
        <ThreeSceneProfile
          members={whoweareProfileTeamMembers}
          onMemberSelect={handleMemberSelect}
          onLoadComplete={handleLoadComplete}
          onLoadError={handleLoadError}
        />
      </div>

      {/* Loading overlay */}
      {whoweareProfileLoading && (
        <div className="whoweare-profile-loading">
          <div className="whoweare-profile-loading-spinner"></div>
          <p>팀 프로필을 준비하는 중...</p>
        </div>
      )}

      {/* Header */}
      <div className="whoweare-profile-header">
        <h1 className="whoweare-profile-title">ASYNCSITE TEAM</h1>
        <p className="whoweare-profile-subtitle">우리가 만들어가는 이야기</p>
      </div>

      {/* Member detail panel */}
      {whoweareProfileSelectedMember && (
        <div className={`whoweare-profile-detail ${whoweareProfileShowInfo ? 'show' : ''}`}>
          <div className="whoweare-profile-detail-content">
            <blockquote className="whoweare-profile-detail-quote">
              {whoweareProfileSelectedMember.quote}
            </blockquote>
            
            <p className="whoweare-profile-detail-story">
              {whoweareProfileSelectedMember.story}
            </p>
            
            <button 
              className="whoweare-profile-detail-close"
              onClick={() => handleMemberSelect(null)}
            >
              프로필 닫기
            </button>
          </div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="whoweare-profile-nav-hint">
        <p>프로필 카드를 클릭해 자세히 알아보세요</p>
      </div>
    </div>
  );
};

export default WhoWeAreProfilePage;
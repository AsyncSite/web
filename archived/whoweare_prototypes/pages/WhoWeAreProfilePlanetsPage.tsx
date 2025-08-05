import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';

// Lazy load Three.js scene
const ThreeSceneProfilePlanets = lazy(() => import('../components/whoweare/ThreeSceneProfilePlanets'));

// Team member data - 실제 팀원 데이터로 업데이트
// 랜딩 페이지의 멤버 데이터와 동일하게 설정
export const whoweareProfilePlanetsMembers = [
  {
    id: 'renechoi',
    name: 'renechoi',
    initials: 'RC',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    darkColor: '#4f46e5',
    github: 'renechoi',
    position: { x: -4, y: 0, z: 3 }
  },
  {
    id: 'jo94kr',
    name: 'Jo Jin Woo',
    initials: 'JW',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#82aaff',
    darkColor: '#5b82d8',
    github: 'jo94kr',
    position: { x: 4, y: 0, z: 3 }
  },
  {
    id: 'mihioon',
    name: 'mihioon',
    initials: 'MH',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    darkColor: '#a3c76d',
    github: 'mihioon',
    position: { x: -4, y: 0, z: -3 }
  },
  {
    id: 'KrongDev',
    name: 'KrongDev',
    initials: 'KD',
    role: 'Connection Engineer',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    color: '#f87171',
    darkColor: '#dc2626',
    github: 'KrongDev',
    position: { x: 4, y: 0, z: -3 }
  },
  {
    id: 'kdelay',
    name: '김지연',
    initials: 'JY',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    darkColor: '#10b981',
    github: 'kdelay',
    position: { x: 0, y: 0, z: 5 }
  },
  {
    id: 'chadongmin',
    name: 'Dongmin Cha',
    initials: 'DC',
    role: 'Platform Engineer',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    color: '#f59e0b',
    darkColor: '#d97706',
    github: 'chadongmin',
    position: { x: 0, y: 0, z: -5 }
  }
];

export interface WhoWeAreProfilePlanetsMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  darkColor: string;
  github: string;
  position: { x: number; y: number; z: number };
}

const WhoWeAreProfilePlanetsPage: React.FC = () => {
  const [whoweareProfilePlanetsSelectedMember, setWhoweareProfilePlanetsSelectedMember] = useState<WhoWeAreProfilePlanetsMemberData | null>(null);
  const [whoweareProfilePlanetsIsLoading, setWhoweareProfilePlanetsIsLoading] = useState(true);
  const [whoweareProfilePlanetsLoadError, setWhoweareProfilePlanetsLoadError] = useState<string | null>(null);
  const [whoweareProfilePlanetsShow3D, setWhoweareProfilePlanetsShow3D] = useState(true);

  // Check WebGL support and device capabilities
  React.useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPerformance = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
        
        if (!gl || isMobile || isLowPerformance) {
          setWhoweareProfilePlanetsShow3D(false);
          setWhoweareProfilePlanetsIsLoading(false);
        }
      } catch (e) {
        setWhoweareProfilePlanetsShow3D(false);
        setWhoweareProfilePlanetsIsLoading(false);
      }
    };

    checkWebGLSupport();
  }, []);

  const closeWhoWeAreProfilePlanetsMemberPanel = () => {
    setWhoweareProfilePlanetsSelectedMember(null);
  };

  // 2D Fallback UI - TecoTeco style
  const FallbackUI = () => (
    <div className="whoweare-fallback-container">
      <div className="whoweare-fallback-header">
        <h1>OUR TEAM</h1>
        <div className="whoweare-subtitle">AsyncSite를 만들어가는 사람들</div>
      </div>
      <div className="whoweare-fallback-grid">
        {whoweareProfilePlanetsMembers.map((member) => (
          <div
            key={member.id}
            className="whoweare-fallback-card"
            style={{ '--member-color': member.color, '--member-color-dark': member.darkColor } as React.CSSProperties}
            onClick={() => setWhoweareProfilePlanetsSelectedMember(member)}
          >
            <div className="whoweare-fallback-avatar">{member.initials}</div>
            <div className="whoweare-fallback-name">{member.name}</div>
            <div className="whoweare-fallback-role">{member.role}</div>
          </div>
        ))}
      </div>
      
      {/* CTA Section */}
      <div className="whoweare-cta-section">
        <a href="/study" className="whoweare-cta-button">
          함께 성장할 스터디 찾아보기 →
        </a>
      </div>
    </div>
  );

  return (
    <div className="whoweare-page-container">
      {whoweareProfilePlanetsShow3D ? (
        <>
          {/* Loading screen */}
          {whoweareProfilePlanetsIsLoading && (
            <div className="whoweare-loading">
              <div className="whoweare-loading-text">LOADING TEAM PROFILES...</div>
            </div>
          )}

          {/* 3D Scene */}
          <Suspense fallback={null}>
            <ThreeSceneProfilePlanets
              members={whoweareProfilePlanetsMembers}
              onMemberSelect={(member) => {
                if (member && member.github) {
                  setWhoweareProfilePlanetsSelectedMember(member as WhoWeAreProfilePlanetsMemberData);
                } else if (member === null) {
                  setWhoweareProfilePlanetsSelectedMember(null);
                }
              }}
              onLoadComplete={() => setWhoweareProfilePlanetsIsLoading(false)}
              onLoadError={(error) => {
                setWhoweareProfilePlanetsLoadError(error);
                setWhoweareProfilePlanetsShow3D(false);
                setWhoweareProfilePlanetsIsLoading(false);
              }}
            />
          </Suspense>

          {/* UI Overlay for 3D */}
          <div className="whoweare-ui-overlay">
            <div className="whoweare-header">
              <h1>MEET OUR TEAM</h1>
              <div className="whoweare-subtitle">AsyncSite 팀원들의 프로필을 탐색해보세요</div>
            </div>

            {/* Instructions */}
            <div className="whoweare-instructions">
              <div className="whoweare-control-hint">🖱️ 마우스로 둘러보기 · 프로필에 호버하여 정보 확인</div>
              <div className="whoweare-control-keys">
                <span className="whoweare-key">드래그</span>
                <span className="whoweare-key">스크롤</span>
                <span className="whoweare-key">클릭</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <FallbackUI />
      )}

      {/* Member Panel (TecoTeco style) */}
      {whoweareProfilePlanetsSelectedMember && (
        <div className="whoweare-ui-overlay">
          <div 
            className="whoweare-member-panel active" 
            style={{ 
              '--member-color': whoweareProfilePlanetsSelectedMember.color, 
              '--member-color-dark': whoweareProfilePlanetsSelectedMember.darkColor 
            } as React.CSSProperties}
          >
            <button className="whoweare-close-btn" onClick={closeWhoWeAreProfilePlanetsMemberPanel}>×</button>
            
            {/* Profile section with activity indicator */}
            <div className="whoweare-member-profile-section">
              <div className="whoweare-member-avatar-wrapper">
                <div className="whoweare-member-avatar">{whoweareProfilePlanetsSelectedMember.initials}</div>
                <div className="whoweare-activity-indicator"></div>
              </div>
              <div className="whoweare-member-name">{whoweareProfilePlanetsSelectedMember.name}</div>
              <div className="whoweare-member-role">{whoweareProfilePlanetsSelectedMember.role}</div>
            </div>
            
            <div className="whoweare-member-divider"></div>
            
            <div className="whoweare-member-quote">{whoweareProfilePlanetsSelectedMember.quote}</div>
            <div className="whoweare-member-story">{whoweareProfilePlanetsSelectedMember.story}</div>
            
            {/* Stats section (TecoTeco style) */}
            <div className="whoweare-member-stats">
              <div className="whoweare-stat-item">
                <span className="whoweare-stat-label">활동</span>
                <span className="whoweare-stat-value" style={{ color: '#4caf50' }}>● Active</span>
              </div>
              <div className="whoweare-stat-item">
                <span className="whoweare-stat-label">팀 합류</span>
                <span className="whoweare-stat-value">2024</span>
              </div>
            </div>
            
            <div className="whoweare-member-links">
              <a href="#" className="whoweare-link-btn">GitHub</a>
              <a href="#" className="whoweare-link-btn">Blog</a>
              <a href="#" className="whoweare-link-btn">LinkedIn</a>
            </div>
            
            {/* CTA in panel */}
            <div className="whoweare-panel-cta">
              <a href="/study" className="whoweare-panel-cta-link">
                함께 성장하기 →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhoWeAreProfilePlanetsPage;
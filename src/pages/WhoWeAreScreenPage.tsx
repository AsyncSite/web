import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';

// Lazy load Three.js scene
const ThreeSceneScreen = lazy(() => import('../components/whoweare/ThreeSceneScreen'));

// Team member data - 실제 팀원 데이터로 업데이트
export const whoweareScreenTeamMembers = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    darkColor: '#4f46e5',
    position: { x: -4, y: 0, z: 3 }
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
    position: { x: 4, y: 0, z: 3 }
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
    position: { x: -4, y: 0, z: -3 }
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
    position: { x: 4, y: 0, z: -3 }
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
    position: { x: 0, y: 0, z: 5 }
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
    position: { x: 0, y: 0, z: -5 }
  }
];

export interface WhoWeAreScreenMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  darkColor: string;
  position: { x: number; y: number; z: number };
}

const WhoWeAreScreenPage: React.FC = () => {
  const [whoweareScreenSelectedMember, setWhoweareScreenSelectedMember] = useState<WhoWeAreScreenMemberData | null>(null);
  const [whoweareScreenIsLoading, setWhoweareScreenIsLoading] = useState(true);
  const [whoweareScreenLoadError, setWhoweareScreenLoadError] = useState<string | null>(null);
  const [whoweareScreenShow3D, setWhoweareScreenShow3D] = useState(true);

  // Check WebGL support and device capabilities
  React.useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPerformance = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
        
        if (!gl || isMobile || isLowPerformance) {
          setWhoweareScreenShow3D(false);
          setWhoweareScreenIsLoading(false);
        }
      } catch (e) {
        setWhoweareScreenShow3D(false);
        setWhoweareScreenIsLoading(false);
      }
    };

    checkWebGLSupport();
  }, []);

  const closeWhoWeAreScreenMemberPanel = () => {
    setWhoweareScreenSelectedMember(null);
  };

  // 2D Fallback UI
  const FallbackUI = () => (
    <div className="whoweare-fallback-container">
      <div className="whoweare-fallback-header">
        <h1>TEAM SPACE</h1>
        <div className="whoweare-subtitle">AsyncSite 크루들의 작업실</div>
      </div>
      <div className="whoweare-fallback-grid">
        {whoweareScreenTeamMembers.map((member) => (
          <div
            key={member.id}
            className="whoweare-fallback-card"
            style={{ '--member-color': member.color, '--member-color-dark': member.darkColor } as React.CSSProperties}
            onClick={() => setWhoweareScreenSelectedMember(member)}
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
      {whoweareScreenShow3D ? (
        <>
          {/* Loading screen */}
          {whoweareScreenIsLoading && (
            <div className="whoweare-loading">
              <div className="whoweare-loading-text">INITIALIZING WORKSTATIONS...</div>
            </div>
          )}

          {/* 3D Scene */}
          <Suspense fallback={null}>
            <ThreeSceneScreen
              members={whoweareScreenTeamMembers}
              onMemberSelect={setWhoweareScreenSelectedMember}
              onLoadComplete={() => setWhoweareScreenIsLoading(false)}
              onLoadError={(error) => {
                setWhoweareScreenLoadError(error);
                setWhoweareScreenShow3D(false);
                setWhoweareScreenIsLoading(false);
              }}
            />
          </Suspense>

          {/* UI Overlay for 3D */}
          <div className="whoweare-ui-overlay">
            <div className="whoweare-header">
              <h1>TEAM WORKSTATIONS</h1>
              <div className="whoweare-subtitle">AsyncSite 크루들의 디지털 워크스페이스</div>
            </div>

            {/* Instructions */}
            <div className="whoweare-instructions">
              <div className="whoweare-control-hint">🖱️ 마우스로 둘러보기 · 클릭으로 프로필 확인</div>
              <div className="whoweare-control-keys">
                <span className="whoweare-key">WASD</span>
                <span className="whoweare-key">마우스 드래그</span>
                <span className="whoweare-key">스크롤 줌</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <FallbackUI />
      )}

      {/* Member Panel (shared between 3D and 2D) */}
      {whoweareScreenSelectedMember && (
        <div className="whoweare-ui-overlay">
          <div 
            className="whoweare-member-panel active" 
            style={{ 
              '--member-color': whoweareScreenSelectedMember.color, 
              '--member-color-dark': whoweareScreenSelectedMember.darkColor 
            } as React.CSSProperties}
          >
            <button className="whoweare-close-btn" onClick={closeWhoWeAreScreenMemberPanel}>×</button>
            <div className="whoweare-member-avatar">{whoweareScreenSelectedMember.initials}</div>
            <div className="whoweare-member-name">{whoweareScreenSelectedMember.name}</div>
            <div className="whoweare-member-role">{whoweareScreenSelectedMember.role}</div>
            <div className="whoweare-member-quote">{whoweareScreenSelectedMember.quote}</div>
            <div className="whoweare-member-story">{whoweareScreenSelectedMember.story}</div>
            <div className="whoweare-member-links">
              <a href="#" className="whoweare-link-btn">G</a>
              <a href="#" className="whoweare-link-btn">B</a>
              <a href="#" className="whoweare-link-btn">L</a>
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

export default WhoWeAreScreenPage;
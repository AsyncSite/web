import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';

// Lazy load Three.js scene
const ThreeSceneLoader = lazy(() => import('../components/whoweare/ThreeSceneLoader'));

// Team member data - 실제 팀원 데이터로 업데이트
export const whoweareTeamMembers = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'The Visionary Builder\nProduct Architect',
    quote: '"결국, 세상은 만드는 사람들의 것이라고 믿어요."',
    story: 'AsyncSite의 비전을 세우고 아키텍처를 설계하며, 함께 성취하고 성장하는 전체 여정의 지도를 그리고 있어요.\n\n머릿속 아이디어가 코드가 되고, 코드가 살아있는 서비스가 되는 그 순간의 희열을 사랑해요.\n\n막연한 성장에 대한 불안감 대신, 치열하게 몰입하고 단단하게 성장하는 즐거움. 그 값진 경험을 더 많은 동료들과 함께 만들어가고 싶어요.',
    color: '#6366f1',
    darkColor: '#4f46e5',
    position: { x: -4, y: 0, z: 3 },
    profileImage: '/images/face/rene.png'
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
    position: { x: 4, y: 0, z: 3 },
    profileImage: '/images/face/KrongDev.png'
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
    position: { x: -4, y: 0, z: -3 },
    profileImage: '/images/face/vvoohhee.png'
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
    position: { x: 4, y: 0, z: -3 },
    profileImage: '/images/face/kdelay.png'
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

export interface WhoWeAreMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  darkColor: string;
  github?: string;
  position: { x: number; y: number; z: number };
  profileImage?: string;
}

const WhoWeArePage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);

  // Check WebGL support and device capabilities
  React.useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPerformance = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
        
        if (!gl || isMobile || isLowPerformance) {
          setWhoweareShow3D(false);
          setWhoweareIsLoading(false);
        }
      } catch (e) {
        setWhoweareShow3D(false);
        setWhoweareIsLoading(false);
      }
    };

    checkWebGLSupport();
  }, []);

  const closeWhoWeareMemberPanel = () => {
    setWhoweareSelectedMember(null);
  };

  // 2D Fallback UI
  const FallbackUI = () => (
    <div className="whoweare-fallback-container">
      <div className="whoweare-fallback-header">
        <h1>TEAM SPACE</h1>
        <div className="whoweare-subtitle">AsyncSite 크루들의 작업실</div>
      </div>
      <div className="whoweare-fallback-grid">
        {whoweareTeamMembers.map((member) => (
          <div
            key={member.id}
            className="whoweare-fallback-card"
            style={{ '--member-color': member.color, '--member-color-dark': member.darkColor } as React.CSSProperties}
            onClick={() => setWhoweareSelectedMember(member)}
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
      {whoweareShow3D ? (
        <>
          {/* Loading screen */}
          {whoweareIsLoading && (
            <div className="whoweare-loading">
              <div className="whoweare-loading-text">ENTERING TEAM SPACE...</div>
            </div>
          )}

          {/* 3D Scene */}
          <Suspense fallback={null}>
            <ThreeSceneLoader
              members={whoweareTeamMembers}
              onMemberSelect={setWhoweareSelectedMember}
              onLoadComplete={() => setWhoweareIsLoading(false)}
              onLoadError={(error) => {
                setWhoweareLoadError(error);
                setWhoweareShow3D(false);
                setWhoweareIsLoading(false);
              }}
            />
          </Suspense>

          {/* UI Overlay for 3D */}
          <div className="whoweare-ui-overlay">
            <div className="whoweare-header">
              <h1>TEAM SPACE</h1>
              <div className="whoweare-subtitle">AsyncSite 크루들의 작업실</div>
            </div>

            {/* Instructions */}
            <div className="whoweare-instructions">
              <div className="whoweare-control-hint">🖱️ 마우스로 둘러보기 · 클릭으로 멤버 선택</div>
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
      {whoweareSelectedMember && (
        <div className="whoweare-ui-overlay">
          <div 
            className="whoweare-member-panel active" 
            style={{ 
              '--member-color': whoweareSelectedMember.color, 
              '--member-color-dark': whoweareSelectedMember.darkColor 
            } as React.CSSProperties}
          >
            <button className="whoweare-close-btn" onClick={closeWhoWeareMemberPanel}>×</button>
            <div className="whoweare-member-avatar">{whoweareSelectedMember.initials}</div>
            <div className="whoweare-member-name">{whoweareSelectedMember.name}</div>
            <div className="whoweare-member-role">{whoweareSelectedMember.role}</div>
            <div className="whoweare-member-quote">{whoweareSelectedMember.quote}</div>
            <div className="whoweare-member-story">{whoweareSelectedMember.story}</div>
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

export default WhoWeArePage;
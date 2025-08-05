import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneStoryPlanets = lazy(() => import('../components/whoweare/ThreeSceneStoryPlanets'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeAreStoryPlanetsPage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  };

  // Check WebGL support
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
    const event = new CustomEvent('resetCamera');
    window.dispatchEvent(event);
  };

  return (
    <div className="whoweare-planets-random-container">
      {/* 3D Scene */}
      {whoweareShow3D && (
        <div className="whoweare-3d-container">
          <Suspense fallback={null}>
            <ThreeSceneStoryPlanets
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
        </div>
      )}

      {/* Loading screen */}
      {whoweareIsLoading && (
        <div className="whoweare-loading">
          <div className="whoweare-loading-text">EXPLORING THE UNIVERSE...</div>
        </div>
      )}

      {/* Instructions */}
      <div className="whoweare-instructions" style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="whoweare-control-hint">
          <span style={{ color: '#C3E88D' }}>●</span> 스토리 행성 탐험
          <span style={{ margin: '0 10px' }}>·</span>
          <span style={{ color: '#82AAFF' }}>●</span> 멤버 위성 클릭
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '15px 20px',
        color: '#fff',
        fontSize: '14px',
        zIndex: 100
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 600 }}>행성 시스템</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#C3E88D', marginRight: '8px' }} />
          <span>AsyncSite Core</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#82AAFF', marginRight: '8px' }} />
          <span>시작 이야기</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F78C6C', marginRight: '8px' }} />
          <span>핵심 가치들</span>
        </div>
      </div>

      {/* Member 2D Card */}
      <div className={`whoweare-member-card-container ${whoweareSelectedMember ? 'active' : ''}`}>
        {whoweareSelectedMember && (
          <div 
            className={`whoweare-member-card ${whoweareSelectedMember ? 'active' : ''}`}
            style={{ 
              '--member-color': whoweareSelectedMember.color, 
              '--member-dark-color': whoweareSelectedMember.darkColor || whoweareSelectedMember.color,
              '--member-color-rgb': hexToRgb(whoweareSelectedMember.color)
            } as React.CSSProperties}
          >
            <button className="whoweare-close-btn" onClick={closeWhoWeareMemberPanel}>×</button>
            
            <div className="whoweare-member-avatar">
              {whoweareSelectedMember.profileImage ? (
                <img src={whoweareSelectedMember.profileImage} alt={whoweareSelectedMember.name} />
              ) : (
                whoweareSelectedMember.initials
              )}
            </div>
            
            <div className="whoweare-member-name">{whoweareSelectedMember.name}</div>
            <div className="whoweare-member-role">{whoweareSelectedMember.role}</div>
            <div className="whoweare-member-quote">{whoweareSelectedMember.quote}</div>
            <div className="whoweare-member-story">{whoweareSelectedMember.story}</div>
            
            <div className="whoweare-member-links">
              <a href="#" className="whoweare-link-btn">G</a>
              <a href="#" className="whoweare-link-btn">B</a>
              <a href="#" className="whoweare-link-btn">L</a>
            </div>
            
            <div className="whoweare-card-cta">
              <a href="/study" className="whoweare-card-cta-link">
                함께 성장하기 →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Version Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100
      }}>
        <a href="/whoweare-profile-cards" 
           style={{
             padding: '6px 12px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '8px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.8rem',
             textAlign: 'center'
           }}>
          원본
        </a>
        <a href="/whoweare-profile-cards-floating" 
           style={{
             padding: '6px 12px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '8px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.8rem',
             textAlign: 'center'
           }}>
          떠다니는
        </a>
        <span style={{
          padding: '6px 12px',
          background: 'rgba(195, 232, 141, 0.2)',
          border: '1px solid #C3E88D',
          borderRadius: '8px',
          color: '#C3E88D',
          fontSize: '0.8rem',
          textAlign: 'center'
        }}>
          행성 스토리
        </span>
      </div>
    </div>
  );
};

export default WhoWeAreStoryPlanetsPage;
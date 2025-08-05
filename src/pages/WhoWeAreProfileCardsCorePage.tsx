import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneCoreStory = lazy(() => import('../components/whoweare/ThreeSceneCoreStory'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeAreProfileCardsCorePage: React.FC = () => {
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
  };

  return (
    <div className="whoweare-planets-random-container">
      {/* 3D Scene with Central Core */}
      {whoweareShow3D && (
        <div className="whoweare-3d-container">
          <Suspense fallback={null}>
            <ThreeSceneCoreStory
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
          <div className="whoweare-loading-text">INITIALIZING CORE...</div>
        </div>
      )}

      {/* Core interaction hint */}
      <div className="whoweare-instructions" style={{ 
        left: '50%', 
        transform: 'translateX(-50%)',
        bottom: '40px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(195, 232, 141, 0.3)'
      }}>
        <div className="whoweare-control-hint">✨ 중앙 코어에 마우스를 가져가보세요</div>
        <div className="whoweare-control-keys">
          <span className="whoweare-key">클릭하여 스토리 펼치기</span>
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
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <a href="/whoweare-profile-cards" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          원본
        </a>
        <a href="/whoweare-profile-cards-floating" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          떠다니는 스토리
        </a>
        <span style={{
          padding: '8px 16px',
          background: 'rgba(195, 232, 141, 0.2)',
          border: '1px solid #C3E88D',
          borderRadius: '20px',
          color: '#C3E88D',
          fontSize: '0.9rem'
        }}>
          중앙 코어
        </span>
        <a href="/whoweare-profile-cards-sequence" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          시퀀스
        </a>
        <a href="/whoweare-profile-cards-journey" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          여행
        </a>
      </div>
    </div>
  );
};

export default WhoWeAreProfileCardsCorePage;
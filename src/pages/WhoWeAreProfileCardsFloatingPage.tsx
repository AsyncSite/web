import React, { useState, Suspense, lazy, useEffect } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneFloatingStory = lazy(() => import('../components/whoweare/ThreeSceneFloatingStory'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeAreProfileCardsFloatingPage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [selectedStoryCard, setSelectedStoryCard] = useState<any>(null);


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

  const closeStoryCard = () => {
    setSelectedStoryCard(null);
    const event = new CustomEvent('resetCamera');
    window.dispatchEvent(event);
  };

  return (
    <div className="whoweare-planets-random-container">
      {/* 3D Scene with Floating Story Panels */}
      {whoweareShow3D && (
        <div className="whoweare-3d-container">
          <Suspense fallback={null}>
            <ThreeSceneFloatingStory
              members={whoweareTeamMembers}
              onMemberSelect={setWhoweareSelectedMember}
              onStoryCardSelect={setSelectedStoryCard}
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

      {/* Fixed Header Text */}
      <div style={{
        position: 'fixed',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        color: '#ffffff',
        width: '90%',
        maxWidth: '1200px',
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '12px',
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(195, 232, 141, 0.3)',
          lineHeight: 1.5,
          fontWeight: 600,
          letterSpacing: '-0.02em'
        }}>
          AsyncSite는 성취하며 성장하는<br />백엔드 중심의 개발자 커뮤니티에요
        </h1>
        <p style={{
          fontSize: '1.2rem',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.01em'
        }}>
          각자의 궤도를 돌면서 서로의 중력이 되어주고 있어요
        </p>
      </div>


      {/* Loading screen */}
      {whoweareIsLoading && (
        <div className="whoweare-loading">
          <div className="whoweare-loading-text">ENTERING ASYNC UNIVERSE...</div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="whoweare-instructions" style={{ left: '50%', transform: 'translateX(-50%)', right: 'auto' }}>
        <div className="whoweare-control-keys">
          <span className="whoweare-key">클릭하여 상세보기</span>
          <span className="whoweare-key">드래그로 회전</span>
        </div>
      </div>

      {/* Story 2D Card */}
      {selectedStoryCard && (
        <div className="whoweare-member-card-container active" onClick={closeStoryCard}>
          <div 
            className="whoweare-member-card active"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              '--member-color': '#C3E88D', 
              '--member-dark-color': '#7CB342',
              '--member-color-rgb': '195, 232, 141',
              maxWidth: '600px',
              padding: '40px'
            } as React.CSSProperties}
          >
            <button className="whoweare-close-btn" onClick={closeStoryCard}>×</button>
            
            {selectedStoryCard.title && (
              <h2 style={{
                color: '#C3E88D',
                fontSize: '2.5rem',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: 700
              }}>
                {selectedStoryCard.title}
              </h2>
            )}
            
            <div style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              textAlign: 'center',
              whiteSpace: 'pre-line',
              color: '#ffffff'
            }}>
              {selectedStoryCard.content}
            </div>
          </div>
        </div>
      )}

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
          </div>
        )}
      </div>

    </div>
  );
};

export default WhoWeAreProfileCardsFloatingPage;
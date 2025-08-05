import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';
import './WhoWeArePlanetsIntuitivePage.css';

// Lazy load Three.js scene
const ThreeScenePlanetsIntuitive = lazy(() => import('../components/whoweare/ThreeScenePlanetsIntuitive'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeArePlanetsIntuitivePage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

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
    
    // Hide guide after a few seconds
    setTimeout(() => {
      setShowGuide(false);
    }, 4000);
  }, []);

  const closeWhoWeareMemberPanel = () => {
    setWhoweareSelectedMember(null);
  };

  // 2D Fallback UI
  const FallbackUI = () => (
    <div className="whoweare-fallback-container">
      <div className="whoweare-intro-section">
        <div className="whoweare-intro-text">
          <h1>정답을 몰라요. 그래서 시작했어요.</h1>
          <p className="subtitle">함께 길을 찾아가는 사람들</p>
          <p>최고의 개발자가 되는 정해진 답이 있다면 AsyncSite는 존재하지 않았을 거예요.</p>
          <p>우리에게 필요한 것은 함께 오래 길을 찾을 "동료"란 걸 깨달았어요.</p>
        </div>
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
    <div className="whoweare-planets-intuitive-container">
      {whoweareShow3D ? (
        <>
          {/* Loading screen */}
          {whoweareIsLoading && (
            <div className="whoweare-loading">
              <div className="whoweare-loading-text">LOADING...</div>
            </div>
          )}

          {/* Top Text Section */}
          <div className="whoweare-intro-section">
            <div className="whoweare-intro-text">
              <h1>정답을 몰라요. 그래서 시작했어요.</h1>
              <p className="subtitle">함께 길을 찾아가는 사람들</p>
              <p>최고의 개발자가 되는 정해진 답이 있다면 AsyncSite는 존재하지 않았을 거예요.</p>
              <p>우리에게 필요한 것은 함께 오래 길을 찾을 "동료"란 걸 깨달았어요.</p>
            </div>
          </div>

          {/* Guide Hint */}
          {showGuide && !whoweareIsLoading && (
            <div className="whoweare-guide-hint">
              🌟 행성을 클릭하면 팀원을 만날 수 있어요
            </div>
          )}

          {/* 3D Scene Container */}
          <div className="whoweare-3d-container">
            <Suspense fallback={null}>
              <ThreeScenePlanetsIntuitive
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
              {/* Instructions */}
              <div className="whoweare-instructions">
                <div className="whoweare-control-hint">🖱️ 마우스로 둘러보기 · 클릭으로 멤버 선택</div>
                <div className="whoweare-control-keys">
                  <span className="whoweare-key">드래그</span>
                  <span className="whoweare-key">스크롤 줌</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="whoweare-bottom-cta">
                <a href="/study" className="whoweare-cta-button">
                  함께 성장할 스터디 찾아보기 →
                </a>
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

export default WhoWeArePlanetsIntuitivePage;
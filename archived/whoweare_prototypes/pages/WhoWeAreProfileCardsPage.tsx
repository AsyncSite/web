import React, { useState, Suspense, lazy } from 'react';
import './WhoWeArePage.css';
import './WhoWeArePlanetsRandomPage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneProfileCards = lazy(() => import('../components/whoweare/ThreeSceneProfileCards'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeAreProfileCardsPage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [showStoryPanel, setShowStoryPanel] = useState(false);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  };

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
    // Trigger camera reset in 3D scene
    const event = new CustomEvent('resetCamera');
    window.dispatchEvent(event);
  };

  const toggleStoryPanel = () => {
    setShowStoryPanel(!showStoryPanel);
  };

  return (
    <div className="whoweare-planets-random-container">
      {/* 3D Scene Background */}
      {whoweareShow3D && (
        <div className="whoweare-3d-container">
          <Suspense fallback={null}>
            <ThreeSceneProfileCards
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
          <div className="whoweare-loading-text">LOADING...</div>
        </div>
      )}

      {/* Main Content Overlay */}
      <div className="whoweare-content-overlay">
        {/* Story Button */}
        <button 
          className={`whoweare-story-button ${showStoryPanel ? 'hidden' : ''}`}
          onClick={toggleStoryPanel}
        >
          우리의 이야기
        </button>

        {/* Story Panel - 3D 공간 중앙에 떠있는 패널 */}
        <div className={`whoweare-story-panel ${showStoryPanel ? 'active' : ''}`}>
          <button className="whoweare-close-story" onClick={toggleStoryPanel}>×</button>
          
          <h2 className="whoweare-story-title">AsyncSite</h2>
          <p className="whoweare-story-intro">
            각자의 궤도를 도는 개발자들이 서로의 중력이 되어주는,<br />
            지속가능한 성장 생태계입니다.
          </p>

          <div className="whoweare-story-section">
            <p className="whoweare-story-paragraph">
              우리는 <span className="whoweare-story-highlight">'점'으로 흩어진 지식의 시대</span>에 지쳐 시작했어요.
            </p>
            <p className="whoweare-story-paragraph">
              수많은 강의를 완강해도 연결되지 않는 단편적인 지식들, 
              리더의 헌신에만 의존하다 '반짝하고 사라지는' 스터디들. 
              AI가 코드 작성을 돕는 시대가 되었지만, 
              역설적으로 개발자의 성장은 점점 더 고독한 싸움이 되어가고 있어요.
            </p>
          </div>

          <div className="whoweare-story-section">
            <h3>
              <span className="whoweare-story-number">1</span>
              우리는 '점들을 연결하여 큰 그림'을 그려요
            </h3>
            <p className="whoweare-story-paragraph">
              단순히 지식을 전달하는 것을 넘어, 코드 리뷰와 동료 피드백, 
              팀 프로젝트를 통해 학습한 지식을 실제 경험으로 꿰어내는 
              <span className="whoweare-story-highlight">'총체적 성장'</span>을 지향해요.
            </p>
            <p className="whoweare-story-paragraph">
              나의 코드가 동료의 시선을 통해 더 나은 해답이 되는 순간, 
              혼자서는 결코 얻을 수 없었던 '집단 지성'의 힘을 경험하게 됩니다.
            </p>
          </div>

          <div className="whoweare-story-section">
            <h3>
              <span className="whoweare-story-number">2</span>
              우리는 '느슨하지만 끈끈한 연결'을 시스템으로 만들어요
            </h3>
            <p className="whoweare-story-paragraph">
              모든 멤버가 같은 시간에, 같은 방식으로 참여할 필요는 없어요. 
              각자의 속도와 리듬을 존중하는 <span className="whoweare-story-highlight">비동기적(Async) 참여</span>를 기반으로 하되, 
              검증된 리더와 체계적인 시즌 운영을 통해 그 연결이 끊어지지 않는 
              안정적인 터전(Site)을 제공합니다.
            </p>
            <p className="whoweare-story-paragraph">
              우리는 '따로 또 같이'의 힘을 믿습니다.
            </p>
          </div>

          <div className="whoweare-story-section">
            <h3>
              <span className="whoweare-story-number">3</span>
              우리는 '지속가능성'을 가장 중요한 가치로 생각해요
            </h3>
            <p className="whoweare-story-paragraph">
              열정과 헌신만으로는 커뮤니티가 유지될 수 없어요. 
              우리는 리더에게 합당한 보상을 제공하고, 
              멤버들에게는 다음 시즌을 기대하게 만드는 명확한 운영 시스템을 통해, 
              일회성 만남이 아닌 <span className="whoweare-story-highlight">평생의 성장 파트너</span>가 될 수 있는 
              커뮤니티를 만들어 갑니다.
            </p>
          </div>

          <p className="whoweare-story-quote">
            "어떻게 하면, 이 외로운 여정을<br />
            함께, 그리고 꾸준히 걸어갈 수 있을까?"
          </p>
          
          <p className="whoweare-story-answer">
            우리는 그 답을 여기서 찾아가고 있습니다.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="whoweare-cta-section">
        <a href="/study" className="whoweare-cta-button">
          함께 성장하기 →
        </a>
      </div>

      {/* Instructions */}
      <div className="whoweare-instructions">
        <div className="whoweare-control-hint">🖱️ 마우스로 둘러보기 · 클릭으로 프로필 선택</div>
        <div className="whoweare-control-keys">
          <span className="whoweare-key">드래그</span>
          <span className="whoweare-key">스크롤 줌</span>
        </div>
      </div>

      {/* Member 2D Card - Center Transform */}
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
    </div>
  );
};

export default WhoWeAreProfileCardsPage;
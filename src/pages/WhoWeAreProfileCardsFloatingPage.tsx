import React, { useState, Suspense, lazy, useEffect } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneFloatingStory = lazy(() => import('../components/whoweare/ThreeSceneFloatingStory'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

interface FontOption {
  name: string;
  style: {
    fontFamily: string;
    fontWeight: number;
    letterSpacing: string;
  };
  cssUrl?: string;
}

const WhoWeAreProfileCardsFloatingPage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [selectedFont, setSelectedFont] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedStoryCard, setSelectedStoryCard] = useState<any>(null);

  // Font options
  const fontOptions: FontOption[] = [
    {
      name: '배민 한나체 Pro',
      style: {
        fontFamily: '"BM HANNA Pro", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 400,
        letterSpacing: '-0.02em'
      },
      cssUrl: 'https://cdn.jsdelivr.net/gh/fonts-archive/BMHANNAPro/BMHANNAPro.css'
    },
    {
      name: '배민 주아체',
      style: {
        fontFamily: '"BM JUA", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 400,
        letterSpacing: '-0.02em'
      },
      cssUrl: 'https://cdn.jsdelivr.net/gh/fonts-archive/BMJUA/BMJUA.css'
    },
    {
      name: '배민 도현체',
      style: {
        fontFamily: '"BM DOHYEON", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 400,
        letterSpacing: '-0.02em'
      },
      cssUrl: 'https://cdn.jsdelivr.net/gh/fonts-archive/BMDOHYEON/BMDOHYEON.css'
    },
    {
      name: '배민 연성체',
      style: {
        fontFamily: '"BM YEONSUNG", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 400,
        letterSpacing: '-0.02em'
      },
      cssUrl: 'https://cdn.jsdelivr.net/gh/fonts-archive/BMYEONSUNG/BMYEONSUNG.css'
    },
    {
      name: '기본 시스템 폰트',
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.02em'
      }
    },
    {
      name: '모던 산세리프',
      style: {
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.03em'
      }
    },
    {
      name: '부드러운 라운드',
      style: {
        fontFamily: '"Nunito Sans", "Open Sans", Arial, sans-serif',
        fontWeight: 800,
        letterSpacing: '-0.01em'
      }
    }
  ];

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  };

  // Load Baemin fonts dynamically
  useEffect(() => {
    const loadFonts = async () => {
      const fontPromises = fontOptions
        .filter(font => font.cssUrl)
        .map(font => {
          return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = font.cssUrl!;
            link.onload = () => resolve(true);
            link.onerror = () => resolve(false);
            document.head.appendChild(link);
          });
        });

      await Promise.all(fontPromises);
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

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
          ...fontOptions[selectedFont].style
        }}>
          AsyncSite는 성취하며 성장하는<br />백엔드 중심의 개발자 커뮤니티에요
        </h1>
        <p style={{
          fontSize: '1.2rem',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.01em',
          fontFamily: fontOptions[selectedFont].style.fontFamily
        }}>
          각자의 궤도를 돌면서 서로의 중력이 되어주고 있어요
        </p>
      </div>

      {/* Font Selector */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 101
      }}>
        <div style={{
          color: '#C3E88D',
          fontSize: '0.9rem',
          marginBottom: '10px',
          fontWeight: 600
        }}>
          폰트 선택: {fontOptions[selectedFont].name}
        </div>
        {!fontsLoaded && fontOptions[selectedFont].cssUrl && (
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem',
            marginBottom: '8px'
          }}>
            폰트 로딩 중...
          </div>
        )}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '200px' }}>
          {fontOptions.map((font, index) => (
            <button
              key={index}
              onClick={() => setSelectedFont(index)}
              title={font.name}
              style={{
                width: '30px',
                height: '30px',
                border: selectedFont === index ? '2px solid #C3E88D' : '1px solid rgba(255, 255, 255, 0.3)',
                background: selectedFont === index ? 'rgba(195, 232, 141, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {index + 1}
              {font.cssUrl && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#F78C6C',
                  fontSize: '0'
                }}>●</div>
              )}
            </button>
          ))}
        </div>
        <div style={{
          marginTop: '10px',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <span style={{ color: '#F78C6C' }}>●</span> 배민 폰트
        </div>
      </div>

      {/* Loading screen */}
      {whoweareIsLoading && (
        <div className="whoweare-loading">
          <div className="whoweare-loading-text">ENTERING ASYNC UNIVERSE...</div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="whoweare-instructions" style={{ left: '20px', right: 'auto' }}>
        <div className="whoweare-control-hint">🌌 스토리 패널과 팀원들이 함께 떠있는 공간</div>
        <div className="whoweare-control-keys">
          <span className="whoweare-key">자동 회전 중</span>
          <span className="whoweare-key">드래그로 탐색</span>
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
        <span style={{
          padding: '8px 16px',
          background: 'rgba(195, 232, 141, 0.2)',
          border: '1px solid #C3E88D',
          borderRadius: '20px',
          color: '#C3E88D',
          fontSize: '0.9rem'
        }}>
          떠다니는 스토리
        </span>
        <a href="/whoweare-profile-cards-core" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          중앙 코어
        </a>
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

export default WhoWeAreProfileCardsFloatingPage;
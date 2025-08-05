import React, { useState, Suspense, lazy, useEffect } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneProfileCards = lazy(() => import('../components/whoweare/ThreeSceneProfileCards'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeAreProfileCardsSequencePage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [sequencePhase, setSequencePhase] = useState<'intro' | 'story' | 'transition' | 'complete'>('intro');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [skipRequested, setSkipRequested] = useState(false);

  // Story sequence content
  const storySequence = [
    {
      text: "AsyncSite",
      duration: 2000,
      style: 'title'
    },
    {
      text: "각자의 궤도를 도는 개발자들이",
      duration: 2500,
      style: 'subtitle'
    },
    {
      text: "서로의 중력이 되어주는",
      duration: 2500,
      style: 'subtitle'
    },
    {
      text: "지속가능한 성장 생태계",
      duration: 3000,
      style: 'subtitle'
    },
    {
      text: "",
      duration: 1000,
      style: 'pause'
    },
    {
      text: "우리는 '점'으로 흩어진 지식의 시대에 지쳤어요.",
      duration: 3000,
      style: 'content'
    },
    {
      text: "수많은 강의를 완강해도 연결되지 않는 단편적인 지식들,",
      duration: 3000,
      style: 'content'
    },
    {
      text: "리더의 헌신에만 의존하다 '반짝하고 사라지는' 스터디들.",
      duration: 3000,
      style: 'content'
    },
    {
      text: "",
      duration: 1000,
      style: 'pause'
    },
    {
      text: "그래서 우리는 다르게 시작했습니다.",
      duration: 3000,
      style: 'emphasis'
    },
    {
      text: "",
      duration: 500,
      style: 'pause'
    },
    {
      text: "점들을 연결하여 큰 그림을 그리고",
      duration: 2500,
      style: 'value'
    },
    {
      text: "느슨하지만 끈끈한 연결을 만들며",
      duration: 2500,
      style: 'value'
    },
    {
      text: "지속가능한 성장을 추구합니다",
      duration: 2500,
      style: 'value'
    },
    {
      text: "",
      duration: 1000,
      style: 'pause'
    },
    {
      text: "이제, 우리의 이야기를 만나보세요.",
      duration: 3000,
      style: 'outro'
    }
  ];

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

  // Story sequence animation
  useEffect(() => {
    if (sequencePhase !== 'story' || skipRequested) return;

    const timer = setTimeout(() => {
      if (currentStoryIndex < storySequence.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        // Story complete, start transition
        setSequencePhase('transition');
        setTimeout(() => {
          setSequencePhase('complete');
        }, 1500);
      }
    }, storySequence[currentStoryIndex].duration);

    return () => clearTimeout(timer);
  }, [currentStoryIndex, sequencePhase, skipRequested]);

  // Start sequence after intro
  useEffect(() => {
    if (sequencePhase === 'intro') {
      const timer = setTimeout(() => {
        setSequencePhase('story');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sequencePhase]);

  const handleSkip = () => {
    setSkipRequested(true);
    setSequencePhase('transition');
    setTimeout(() => {
      setSequencePhase('complete');
    }, 1000);
  };

  const closeWhoWeareMemberPanel = () => {
    setWhoweareSelectedMember(null);
    const event = new CustomEvent('resetCamera');
    window.dispatchEvent(event);
  };

  const currentStory = storySequence[currentStoryIndex];

  return (
    <div className="whoweare-planets-random-container">
      {/* Opening Sequence */}
      {sequencePhase !== 'complete' && (
        <div 
          className="whoweare-sequence-container"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            transition: 'opacity 1.5s ease',
            opacity: sequencePhase === 'transition' ? 0 : 1,
            pointerEvents: sequencePhase === 'transition' ? 'none' : 'auto'
          }}
        >
          {sequencePhase === 'intro' && (
            <div style={{
              animation: 'fadeIn 1.5s ease-out',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 30px',
                border: '2px solid #C3E88D',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#C3E88D',
                  borderRadius: '50%',
                  opacity: 0.8
                }} />
              </div>
              <h2 style={{
                color: '#C3E88D',
                fontSize: '1.5rem',
                fontWeight: 300,
                letterSpacing: '0.1em'
              }}>
                INITIALIZING
              </h2>
            </div>
          )}

          {sequencePhase === 'story' && currentStory && (
            <div style={{
              width: '90%',
              maxWidth: '800px',
              textAlign: 'center',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              {currentStory.style === 'title' && (
                <h1 style={{
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  color: '#C3E88D',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginBottom: 0
                }}>
                  {currentStory.text}
                </h1>
              )}
              
              {currentStory.style === 'subtitle' && (
                <p style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  lineHeight: 1.4,
                  margin: '20px 0'
                }}>
                  {currentStory.text}
                </p>
              )}
              
              {currentStory.style === 'content' && (
                <p style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  margin: '30px auto',
                  maxWidth: '700px'
                }}>
                  {currentStory.text}
                </p>
              )}
              
              {currentStory.style === 'emphasis' && (
                <p style={{
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  color: '#C3E88D',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  margin: '40px 0'
                }}>
                  {currentStory.text}
                </p>
              )}
              
              {currentStory.style === 'value' && (
                <p style={{
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                  color: 'rgba(195, 232, 141, 0.9)',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  margin: '20px 0'
                }}>
                  {currentStory.text}
                </p>
              )}
              
              {currentStory.style === 'outro' && (
                <p style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  color: '#ffffff',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  margin: '50px 0'
                }}>
                  {currentStory.text}
                </p>
              )}
            </div>
          )}

          {/* Skip button */}
          {sequencePhase === 'story' && (
            <button
              onClick={handleSkip}
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '30px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C3E88D';
                e.currentTarget.style.color = '#C3E88D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              건너뛰기 →
            </button>
          )}

          {/* Progress indicator */}
          {sequencePhase === 'story' && (
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px'
            }}>
              {storySequence.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: index === currentStoryIndex ? '24px' : '8px',
                    height: '3px',
                    background: index <= currentStoryIndex ? '#C3E88D' : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3D Scene */}
      {whoweareShow3D && sequencePhase === 'complete' && (
        <div className="whoweare-3d-container" style={{
          animation: 'fadeIn 2s ease-out'
        }}>
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

      {/* Instructions */}
      {sequencePhase === 'complete' && (
        <div className="whoweare-instructions">
          <div className="whoweare-control-hint">🖱️ 마우스로 둘러보기 · 클릭으로 프로필 선택</div>
          <div className="whoweare-control-keys">
            <span className="whoweare-key">드래그</span>
            <span className="whoweare-key">스크롤 줌</span>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {sequencePhase === 'complete' && (
        <div className="whoweare-cta-section">
          <a href="/study" className="whoweare-cta-button">
            함께 성장하기 →
          </a>
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
            
            <div className="whoweare-card-cta">
              <a href="/study" className="whoweare-card-cta-link">
                함께 성장하기 →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Version Navigation */}
      {sequencePhase === 'complete' && (
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
          <span style={{
            padding: '8px 16px',
            background: 'rgba(195, 232, 141, 0.2)',
            border: '1px solid #C3E88D',
            borderRadius: '20px',
            color: '#C3E88D',
            fontSize: '0.9rem'
          }}>
            시퀀스
          </span>
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
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WhoWeAreProfileCardsSequencePage;
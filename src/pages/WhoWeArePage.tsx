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
    role: 'Visionary Builder\n& Product Architect',
    quote: '혼자만의 성장에 마침표를 찍어요.',
    story: '강의만으로는 채워지지 않는 갈증,\n\n동료의 피드백이 절실했던 순간들.\n\n우리는 \'함께\'라는 가장 강력한 변수를 더해\n\n성장의 방정식을 새로 써요.',
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
    quote: '나의 \'아웃풋\'으로 증명하고, 동료의 \'피드백\'으로 완성해요.',
    story: '책으로만 배우는 시대를 넘어\n\n나만의 결과물을 만드는 경험에 집중해요.\n\n서로의 아웃풋을 기꺼이 공유하고\n\n건설적인 피드백으로 함께 완성도를 높여요.',
    color: '#f472b6',
    darkColor: '#e11d48',
    position: { x: 4, y: 0, z: 3 },
    profileImage: '/images/face/KrongDev.png'
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    quote: '따로 또 같이, 느슨하게 연결돼요.',
    story: '모두가 같은 속도로 뛸 필요는 없어요.\n\n각자의 궤도를 존중하는 비동기(Async) 참여로\n\n오래 지속할 우리만의 터전(Site)을 만들어요.',
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
    quote: '성장의 선순환 구조를 만들어요.',
    story: '성장에 기여한 리더에겐 합당한 보상을,\n\n참여하는 동료에겐 다음이 기대되는 경험을.\n\n서로가 서로의 성장을 돕는 투명한 시스템으로\n\n지속가능한 생태계를 꾸려나가요.',
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
    quote: '우리의 여정에 동참해요.',
    story: '결국 우리의 질문은 하나예요.\n\n"어떻게 하면 이 외로운 항해를\n\n함께, 그리고 끝까지 완주할 수 있을까?"\n\n그 답을 여기서 함께 찾아요.',
    color: '#34d399',
    darkColor: '#10b981',
    position: { x: 0, y: 0, z: 5 },
    profileImage: '/images/face/vvoohhee.png'
  },
  {
    id: 'dongmin-cha',
    name: '차동민',
    initials: 'DC',
    role: 'Platform Engineer',
    quote: '혼자만의 성장에 마침표를 찍어요.',
    story: '강의만으로는 채워지지 않는 갈증,\n\n동료의 피드백이 절실했던 순간들.\n\n우리는 \'함께\'라는 가장 강력한 변수를 더해\n\n성장의 방정식을 새로 써요.',
    color: '#f59e0b',
    darkColor: '#d97706',
    position: { x: 0, y: 0, z: -5 },
    profileImage: '/images/face/kdelay.png'
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
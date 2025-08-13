import React, { useState, useEffect } from 'react';
import './MembersSection.css';
import './MembersSection-tecoteco.css';
import {
  MemberProfile, 
  MemberLayoutType,
  MembersSectionData 
} from '../types/memberTypes';
import { fetchAndMergeMembersData } from '../utils/membersDataFetcher';

interface MembersSectionProps {
  data: MembersSectionData;
  studyId?: string; // Optional studyId to fetch real member data
}

// 개별 멤버 카드 컴포넌트
const MemberCard: React.FC<{
  member: MemberProfile;
  onClick?: () => void;
  // 상호작용 지원
  onHoverChange?: (hovered: boolean) => void;
  hoveredActiveName?: string | null;
  isMvpHint?: boolean;
}> = ({ member, onClick, onHoverChange, hoveredActiveName, isMvpHint }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPos, setHoverPos] = useState<{x:number; y:number}>({ x: 0, y: 0 });
  
  // 기본 이미지 처리
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/default-avatar.png';
  };
  
  // 가입 기간 계산
  const getMemberDuration = (joinDate?: string): string => {
    if (!joinDate) return '';
    const joined = new Date(joinDate);
    const today = new Date();
    const months = (today.getFullYear() - joined.getFullYear()) * 12 + today.getMonth() - joined.getMonth();
    // 기본 표기: "함께한 지 N개월"
    return `함께한 지 ${months}개월`;
  };
  
  const isBlurred = !!hoveredActiveName && hoveredActiveName !== member.name;

  return (
    <div 
      className={`tecoteco-contributor-card ${isHovered ? 'hovered' : ''} ${isBlurred ? 'blurred' : ''} ${isMvpHint ? 'mvp-card' : ''}`}
      onClick={onClick}
      onMouseEnter={(e) => { setIsHovered(true); onHoverChange?.(true); setHoverPos({ x: e.clientX, y: e.clientY }); }}
      onMouseMove={(e) => { if (isHovered) setHoverPos({ x: e.clientX, y: e.clientY }); }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false); }}
    >
      {/* MVP 배지 */}
      {(isMvpHint || (member.badges && member.badges.some(b => b.type === 'mvp'))) && (
        <div className="mvp-badge">👑 이주의 MVP</div>
      )}
      
      {/* 프로필 이미지 */}
      <div className="tecoteco-profile-wrapper">
        <img 
          src={member.imageUrl || '/images/default-avatar.png'} 
          alt={member.name}
          onError={handleImageError}
          className="tecoteco-profile-img"
        />
        {member.isActive && <div className="activity-indicator" />}
      </div>
      
      {/* 기본 정보 */}
      <h3 className="tecoteco-contributor-name">{member.name}</h3>
      
      {/* 가입 기간 */}
      {member.joinDate && (
        <p className="tecoteco-contributor-duration">{getMemberDuration(member.joinDate)}</p>
      )}
      
      {/* 한 줄 소개 */}
      {member.tagline && (
        <p className="tecoteco-contributor-contribution">
          {member.tagline}
        </p>
      )}
      

      {/* 미니 통계 프리뷰 (streak) */}
      {typeof member.streak === 'number' && (
        <div className="member-stats-preview">
          <span className="streak-preview">🔥 {member.streak}</span>
        </div>
      )}
      
      {/* 호버 디테일(화면 중앙 고정) */}
      {isHovered && (
        <div className="hover-detail-overlay">
          <div className="hover-detail-popup">
            <div className="hover-detail-header">
              <span className="hover-detail-role">{member.role}</span>
              <span className="hover-detail-streak">🔥 {(() => {
                return typeof member.streak === 'number' ? member.streak : '';
              })()}일 연속</span>
            </div>
            {member.memorableProblem && (
              <div className="hover-detail-problem">
                <strong>최근 도전한 문제</strong>
                {member.memorableProblem.split(' - ')[1] || member.memorableProblem}
              </div>
            )}
            {member.testimonial && (
              <div className="hover-detail-testimonial">"{member.testimonial}"</div>
            )}
            <div className="hover-detail-footer">클릭해서 더 자세한 이야기 보기 →</div>
          </div>
        </div>
      )}
      
      {/* 레거시 bio 지원 */}
      {!member.tagline && member.bio && (
        <p className="member-bio">{member.bio}</p>
      )}
    </div>
  );
};

// 멤버 상세 모달
const MemberDetailModal: React.FC<{
  member: MemberProfile;
  isOpen: boolean;
  onClose: () => void;
}> = ({ member, isOpen, onClose }) => {
  
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="member-modal-overlay" onClick={onClose}>
      <div className="member-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <img 
            src={member.imageUrl || '/images/default-avatar.png'} 
            alt={member.name}
            className="modal-profile-img"
          />
          <div className="modal-member-info">
            <h3>{member.name}</h3>
            <span className="modal-role">{member.role}</span>
            {member.recentActivity && (
              <span className="modal-recent-activity">{member.recentActivity}</span>
            )}
            {member.currentFocus && (
              <span className="modal-current-focus">📚 {member.currentFocus}</span>
            )}
            <div className="modal-stats">
              {typeof member.streak === 'number' && member.streak > 0 && (
                <span className="modal-streak">🔥 {member.streak}일 연속</span>
              )}
              {typeof member.solvedProblems === 'number' && member.solvedProblems > 0 && (
                <span className="modal-solved">✅ {member.solvedProblems}문제</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-content-sections">
          {member.memorableProblem && (
            <div className="modal-section">
              <h4>🏆 가장 기억에 남는 문제</h4>
              <p className="modal-problem">{member.memorableProblem}</p>
            </div>
          )}
          
          {member.whatIGained && (
            <div className="modal-section">
              <h4>💡 테코테코에서 얻은 것</h4>
              <p className="modal-gained">{member.whatIGained}</p>
            </div>
          )}
          
          {member.testimonial && (
            <div className="modal-section">
              <h4>💬 동료의 한마디</h4>
              <p className="modal-testimonial">"{member.testimonial}"</p>
              {member.from && (
                <span className="testimonial-author">- {member.from}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 통계 섹션
const StatsSection: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return null;
  
  return (
    <div className="members-stats-container">
      <h3 className="stats-title">우리의 여정</h3>
      <div className="stats-grid">
        {stats.totalMembers && (
          <div className="stat-item">
            <span className="stat-number">{stats.totalMembers}</span>
            <span className="stat-label">전체 멤버</span>
          </div>
        )}
        {stats.activeMembers && (
          <div className="stat-item">
            <span className="stat-number">{stats.activeMembers}</span>
            <span className="stat-label">활동 멤버</span>
          </div>
        )}
        {stats.totalHours && (
          <div className="stat-item">
            <span className="stat-number">{stats.totalHours}시간</span>
            <span className="stat-label">함께한 시간</span>
          </div>
        )}
        {stats.customStats && stats.customStats.map((stat: any, idx: number) => (
          <div key={idx} className="stat-item">
            {stat.icon && <span className="stat-icon">{stat.icon}</span>}
            <span className="stat-number">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 메인 MembersSection 컴포넌트
const MembersSection: React.FC<MembersSectionProps> = ({ data, studyId }) => {
  const { 
    members: initialMembers = [], 
    title = '함께하는 사람들',
    subtitle,
    layout = 'carousel',
    showStats = false,
    stats,
    weeklyMvp
  } = data;
  
  const [members, setMembers] = useState<MemberProfile[]>(initialMembers);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  // tecoteco 상호작용 상태
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<MemberProfile | null>(null);
  
  // Fetch real member data when studyId is provided
  useEffect(() => {
    const loadMemberData = async () => {
      if (!studyId) {
        // No studyId, use initial members as-is
        setMembers(initialMembers);
        return;
      }
      
      setIsLoadingMembers(true);
      try {
        const mergedMembers = await fetchAndMergeMembersData(studyId, initialMembers);
        setMembers(mergedMembers);
      } catch (error) {
        console.error('Failed to fetch member data:', error);
        // Fallback to initial members
        setMembers(initialMembers);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    loadMemberData();
  }, [studyId, initialMembers]);
  
  if (members.length === 0 && !isLoadingMembers) {
    return null;
  }
  
  // Show loading state while fetching real member data
  if (isLoadingMembers) {
    return (
      <section className="study-detail-members-section tecoteco-members-section">
        <div className="section-tag-header">함께하는 멤버들이에요</div>
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          멤버 정보를 불러오는 중...
        </div>
      </section>
    );
  }
  
  const handleMemberClick = (member: MemberProfile) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };
  
  
  return (
    <section className="study-detail-members-section tecoteco-members-section">
      {/* 태그 헤더 및 타이틀 (좌측 정렬) */}
      <div className="section-tag-header">함께하는 멤버들이에요</div>
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className="section-subtitle">{subtitle}</p>}

      {/* 멤버 카드 캐러셀: 두 번 렌더링하여 무한 스크롤 효과 */}
      <div className="scrolling-members-wrapper">
        <div className="scrolling-members-inner">
          <div className="tecoteco-contributors-list">
            {members.map((member, index) => (
              <MemberCard
                key={index}
                member={member}
                onClick={() => handleMemberClick(member)}
                onHoverChange={(h) => {
                  setHoveredName(h ? member.name : null);
                  setHoveredMember(h ? member : null);
                }}
                hoveredActiveName={hoveredName}
                isMvpHint={weeklyMvp ? member.name === weeklyMvp : false}
              />
            ))}
          </div>
          <div className="tecoteco-contributors-list" aria-hidden="true">
            {members.map((member, index) => (
              <MemberCard
                key={`duplicate-${index}`}
                member={member}
                onClick={() => handleMemberClick(member)}
                onHoverChange={(h) => {
                  setHoveredName(h ? member.name : null);
                  setHoveredMember(h ? member : null);
                }}
                hoveredActiveName={hoveredName}
                isMvpHint={weeklyMvp ? member.name === weeklyMvp : false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 인터랙션 힌트 */}
      <p className="members-intro">
        각자의 성장 스토리가 모여 더 큰 시너지를 만들어가고 있어요.
        <br />
        <span className="interactive-hint">💡 멤버 카드를 클릭해서 더 자세한 이야기를 확인해보세요!</span>
      </p>

      {/* 연결성 장식 라인 */}
      <div className="connection-lines">
        <svg className="connections-svg" viewBox="0 0 100 20">
          <path
            d="M 10 10 Q 30 5 50 10 T 90 10"
            className="connection-path"
            stroke="rgba(195, 232, 141, 0.3)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <span className="connection-text">서로 영감을 주고받으며</span>
      </div>

      {/* 통계 섹션 (테코테코 스타일) */}
      {showStats && stats && (
        <div className="stats-container">
          <h3 className="stats-title">한땀 한땀 쌓인 작지만 확실한 성취들</h3>
          <div className="stats-grid">
            {stats.totalProblems && (
              <div className="stat-item">
                <span className="stat-number">{stats.totalProblems.toLocaleString()}</span>
                <span className="stat-label">총 해결한 문제</span>
              </div>
            )}
            {stats.totalHours && (
              <div className="stat-item">
                <span className="stat-number">{stats.totalHours}시간+</span>
                <span className="stat-label">함께한 시간</span>
              </div>
            )}
            {stats.participationRate && (
              <div className="stat-item">
                <span className="stat-number">{stats.participationRate}%</span>
                <span className="stat-label">평균 참여율</span>
              </div>
            )}
            {Array.isArray(stats.popularAlgorithms) && (
              <div className="stat-item popular-algorithms">
                <span className="stat-label">인기 알고리즘</span>
                <div className="algorithm-tags">
                  {stats.popularAlgorithms.map((algo, index) => (
                    <span key={index} className="algorithm-tag">{algo}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 멤버 상세 모달 */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </section>
  );
};

export default MembersSection;
import React, { useState, useEffect } from 'react';
import styles from './MembersSection.module.css';
/* MembersSection using standard styles */
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
  
  // 랜덤 색상 생성
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // 기본 이미지 처리 - 물음표가 있는 깔끔한 배경 생성
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const bg = getRandomColor();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <circle cx="32" cy="32" r="32" fill="${bg}"/>
        <text x="32" y="42" font-size="32" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif">?</text>
      </svg>
    `;
    e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    e.currentTarget.alt = '프로필 이미지 없음';
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
      className={`${styles.contributorCard} ${isHovered ? styles.hovered : ''} ${isBlurred ? styles.blurred : ''} ${isMvpHint ? styles.mvpCard : ''}`}
      onClick={onClick}
      onMouseEnter={(e) => { setIsHovered(true); onHoverChange?.(true); setHoverPos({ x: e.clientX, y: e.clientY }); }}
      onMouseMove={(e) => { if (isHovered) setHoverPos({ x: e.clientX, y: e.clientY }); }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false); }}
    >
      {/* MVP 배지 */}
      {(isMvpHint || (member.badges && member.badges.some(b => b.type === 'mvp'))) && (
        <div className={styles.mvpBadge}>👑 이주의 MVP</div>
      )}
      
      {/* 프로필 이미지 */}
      <div className={styles.profileWrapper}>
        <img 
          src={member.imageUrl || '/images/default-avatar.png'} 
          alt={member.name}
          onError={handleImageError}
          className={styles.profileImg}
        />
        {member.isActive && <div className={styles.activityIndicator} />}
      </div>
      
      {/* 기본 정보 */}
      <h3 className={styles.contributorName}>{member.name}</h3>
      
      {/* 가입 기간 */}
      {member.joinDate && (
        <p className={styles.contributorDuration}>{getMemberDuration(member.joinDate)}</p>
      )}
      
      {/* 한 줄 소개 */}
      {member.tagline && (
        <p className={styles.contributorContribution}>
          {member.tagline}
        </p>
      )}
      

      {/* 미니 통계 프리뷰 (streak) */}
      {typeof member.streak === 'number' && (
        <div className={styles.memberStatsPreview}>
          <span className={styles.streakPreview}>🔥 {member.streak}</span>
        </div>
      )}
      
      {/* 호버 디테일(화면 중앙 고정) */}
      {isHovered && (
        <div className={styles.hoverDetailOverlay}>
          <div className={styles.hoverDetailPopup}>
            <div className={styles.hoverDetailHeader}>
              <span className={styles.hoverDetailRole}>{member.role}</span>
              <span className={styles.hoverDetailStreak}>🔥 {(() => {
                return typeof member.streak === 'number' ? member.streak : '';
              })()}일 연속</span>
            </div>
            {member.memorableProblem && (
              <div className={styles.hoverDetailProblem}>
                <strong>최근 도전한 문제</strong>
                {member.memorableProblem.split(' - ')[1] || member.memorableProblem}
              </div>
            )}
            {member.testimonial && (
              <div className={styles.hoverDetailTestimonial}>"{member.testimonial}"</div>
            )}
            <div className={styles.hoverDetailFooter}>클릭해서 더 자세한 이야기 보기 →</div>
          </div>
        </div>
      )}
      
      {/* 레거시 bio 지원 */}
      {!member.tagline && member.bio && (
        <p className={styles.memberBio}>{member.bio}</p>
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
    <div className={styles.memberModalOverlay} onClick={onClose}>
      <div className={styles.memberModalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <img 
            src={member.imageUrl || '/images/default-avatar.png'} 
            alt={member.name}
            className={styles.modalProfileImg}
          />
          <div className={styles.modalMemberInfo}>
            <h3>{member.name}</h3>
            <span className={styles.modalRole}>{member.role}</span>
            {member.recentActivity && (
              <span className={styles.modalRecentActivity}>{member.recentActivity}</span>
            )}
            {member.currentFocus && (
              <span className={styles.modalCurrentFocus}>📚 {member.currentFocus}</span>
            )}
            <div className={styles.modalStats}>
              {typeof member.streak === 'number' && member.streak > 0 && (
                <span className={styles.modalStreak}>🔥 {member.streak}일 연속</span>
              )}
              {typeof member.solvedProblems === 'number' && member.solvedProblems > 0 && (
                <span className={styles.modalSolved}>✅ {member.solvedProblems}문제</span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.modalContentSections}>
          {member.memorableProblem && (
            <div className={styles.modalSection}>
              <h4>🏆 가장 기억에 남는 문제</h4>
              <p className={styles.modalProblem}>{member.memorableProblem}</p>
            </div>
          )}
          
          {member.whatIGained && (
            <div className={styles.modalSection}>
              <h4>💡 스터디에서 얻은 것</h4>
              <p className={styles.modalGained}>{member.whatIGained}</p>
            </div>
          )}
          
          {member.testimonial && (
            <div className={styles.modalSection}>
              <h4>💬 동료의 한마디</h4>
              <p className={styles.modalTestimonial}>"{member.testimonial}"</p>
              {member.from && (
                <span className={styles.testimonialAuthor}>- {member.from}</span>
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
    <div className={styles.membersStatsContainer}>
      <h3 className={styles.statsTitle}>우리의 여정</h3>
      <div className={styles.statsGrid}>
        {stats.totalMembers && (
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.totalMembers}</span>
            <span className={styles.statLabel}>전체 멤버</span>
          </div>
        )}
        {stats.activeMembers && (
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.activeMembers}</span>
            <span className={styles.statLabel}>활동 멤버</span>
          </div>
        )}
        {stats.totalHours && (
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.totalHours}시간</span>
            <span className={styles.statLabel}>함께한 시간</span>
          </div>
        )}
        {stats.customStats && stats.customStats.map((stat: any, idx: number) => (
          <div key={idx} className={styles.statItem}>
            {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
            <span className={styles.statNumber}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 메인 MembersSection 컴포넌트
const MembersSection: React.FC<MembersSectionProps> = ({ data, studyId }) => {
  const { 
    tagHeader = '함께하는 멤버들이에요',
    members: initialMembers = [], 
    title = '',
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
  // 표준 상호작용 상태
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
      <section className={styles.studyDetailMembersSection}>
        {tagHeader && <div className={styles.sectionTagHeader}>{tagHeader}</div>}
        {title && <h2 className={styles.sectionTitle}>{title}</h2>}
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
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
    <section className={styles.studyDetailMembersSection}>
      {/* 태그 헤더 및 타이틀 (좌측 정렬) */}
      {tagHeader && <div className={styles.sectionTagHeader}>{tagHeader}</div>}
      {title && <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }} />}
      {subtitle && <p className={styles.sectionSubtitle} dangerouslySetInnerHTML={{ __html: subtitle.replace(/\n/g, '<br />') }} />}

      {/* 멤버 카드 캐러셀: 두 번 렌더링하여 무한 스크롤 효과 */}
      <div className={styles.scrollingMembersWrapper}>
        <div className={styles.scrollingMembersInner}>
          <div className={styles.contributorsList}>
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
          <div className={styles.contributorsList} aria-hidden="true">
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
      <p className={styles.membersIntro}>
        각자의 성장 스토리가 모여 더 큰 시너지를 만들어가고 있어요.
        <br />
        <span className={styles.interactiveHint}>💡 멤버 카드를 클릭해서 더 자세한 이야기를 확인해보세요!</span>
      </p>

      {/* 연결성 장식 라인 */}
      <div className={styles.connectionLines}>
        <svg className={styles.connectionsSvg} viewBox="0 0 100 20">
          <path
            d="M 10 10 Q 30 5 50 10 T 90 10"
            className={styles.connectionPath}
            stroke="rgba(195, 232, 141, 0.3)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <span className={styles.connectionText}>서로 영감을 주고받으며</span>
      </div>

      {/* 통계 섹션 (표준 스타일) */}
      {showStats && stats && (
        <div className={styles.statsContainer}>
          <h3 className={styles.statsTitle}>한땀 한땀 쌓인 작지만 확실한 성취들</h3>
          <div className={styles.statsGrid}>
            {stats.totalProblems && (
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.totalProblems.toLocaleString()}</span>
                <span className={styles.statLabel}>총 해결한 문제</span>
              </div>
            )}
            {stats.totalHours && (
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.totalHours}시간+</span>
                <span className={styles.statLabel}>함께한 시간</span>
              </div>
            )}
            {stats.participationRate && (
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.participationRate}%</span>
                <span className={styles.statLabel}>평균 참여율</span>
              </div>
            )}
            {Array.isArray(stats.popularAlgorithms) && (
              <div className={`${styles.statItem} ${styles.popularAlgorithms}`}>
                <span className={styles.statLabel}>인기 알고리즘</span>
                <div className={styles.algorithmTags}>
                  {stats.popularAlgorithms.map((algo, index) => (
                    <span key={index} className={styles.algorithmTag}>{algo}</span>
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
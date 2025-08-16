// src/pages/TecoTecoPage/sections/MembersSection.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { tecotecoMembers, MEMBER_DETAILS } from '../utils/constants';
import { handleImgError } from '../utils/helpers';
import { Contributor } from '../utils/types';
import './MembersSection.css';

// 통계 데이터 (실제 데이터로 교체 필요)
const TECOTECO_STATS = {
  totalProblems: 1247,
  totalHours: 180,
  participationRate: 85,
  popularAlgorithms: ['DP', '그래프', '이분탐색', '그리디'],
  weeklyMvp: 'renechoi', // 이 주의 MVP
};

interface MemberDetailModalProps {
  member: Contributor;
  isOpen: boolean;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, isOpen, onClose }) => {
  const details = MEMBER_DETAILS[member.name as keyof typeof MEMBER_DETAILS];
  // 스크롤 위치 저장을 위한 ref
  const scrollPositionRef = useRef(0);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // 현재 스크롤 위치 저장
      scrollPositionRef.current = window.scrollY;
      document.addEventListener('keydown', handleEscKey);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
      // 저장된 스크롤 위치로 복원
      if (!isOpen && scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !details) return null;

  return (
    <div className="member-modal-overlay" onClick={onClose}>
      <div className="member-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <img
            src={member.imageUrl}
            alt={`${member.name} 프로필`}
            className="modal-profile-img"
            onError={handleImgError}
          />
          <div className="modal-member-info">
            <h3>{member.name}</h3>
            <span className="modal-role">{details.role}</span>
            <span className="modal-recent-activity">{details.recentActivity}</span>
            <span className="modal-current-focus">📚 {details.currentFocus}</span>
            <div className="modal-stats">
              <span className="modal-streak">🔥 {details.streak}일 연속</span>
              <span className="modal-solved">✅ {details.solvedProblems}문제</span>
            </div>
          </div>
        </div>

        <div className="modal-content-sections">
          <div className="modal-section">
            <h4>🏆 가장 기억에 남는 문제</h4>
            <p className="modal-problem">{details.memorableProblem}</p>
          </div>

          <div className="modal-section">
            <h4>💡 테코테코에서 얻은 것</h4>
            <p className="modal-gained">{details.whatIGained}</p>
          </div>

          <div className="modal-section">
            <h4>💬 동료의 한마디</h4>
            <p className="modal-testimonial">"{details.testimonial}"</p>
            <span className="testimonial-author">- {details.from}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContributorCardProps {
  contributor: Contributor;
  onClick: () => void;
  isMvp: boolean;
  isHovered: boolean;
  onHover: (memberId: string | null) => void;
  hoveredMemberId: string | null;
}

const ContributorCard: React.FC<ContributorCardProps> = ({
  contributor,
  onClick,
  isMvp,
  isHovered,
  onHover,
  hoveredMemberId,
}) => {
  const getMonthsSinceJoined = (joinDate: string | undefined): string => {
    if (!joinDate) return '';
    const joined = new Date(joinDate);
    const today = new Date();
    const months =
      (today.getFullYear() - joined.getFullYear()) * 12 + today.getMonth() - joined.getMonth();
    return `함께한 지 ${months}개월`;
  };

  const details = MEMBER_DETAILS[contributor.name as keyof typeof MEMBER_DETAILS];

  const handleMouseEnter = () => {
    onHover(contributor.name);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  // 현재 카드가 hover되지 않았고, 다른 카드가 hover된 경우 블러 처리
  const shouldBlur = hoveredMemberId && hoveredMemberId !== contributor.name;

  return (
    <div
      className={`tecoteco-contributor-card ${isMvp ? 'mvp-card' : ''} ${isHovered ? 'hovered' : ''} ${shouldBlur ? 'blurred' : ''}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isMvp && <div className="mvp-badge">👑 이주의 MVP</div>}

      <div className="tecoteco-profile-wrapper">
        <img
          src={contributor.imageUrl}
          alt={`${contributor.name} 프로필`}
          className="tecoteco-profile-img"
          onError={handleImgError}
        />
        {details && <div className="activity-indicator"></div>}
      </div>

      <span className="tecoteco-contributor-name">{contributor.name}</span>

      {contributor.joinDate && (
        <span className="tecoteco-contributor-duration">
          {getMonthsSinceJoined(contributor.joinDate)}
        </span>
      )}

      {contributor.tecotecoContribution && (
        <span className="tecoteco-contributor-contribution">
          {contributor.tecotecoContribution}
        </span>
      )}

      {details && (
        <>
          <div className="member-stats-preview">
            <span className="streak-preview">🔥 {details.streak}</span>
          </div>
        </>
      )}

      {/* 호버 팝업을 카드 내부로 이동 */}
      {isHovered && details && (
        <div className="hover-detail-overlay">
          <div className="hover-detail-popup">
            <div className="hover-detail-header">
              <span className="hover-detail-role">{details.role}</span>
              <span className="hover-detail-streak">🔥 {details.streak}일 연속</span>
            </div>
            <div className="hover-detail-problem">
              <strong>최근 도전한 문제</strong>
              {details.memorableProblem.split(' - ')[1] || details.memorableProblem}
            </div>
            <div className="hover-detail-testimonial">"{details.testimonial}"</div>
            <div className="hover-detail-footer">클릭해서 더 자세한 이야기 보기 →</div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <div className="stats-container">
      <h3 className="stats-title">한땀 한땀 쌓인 작지만 확실한 성취들</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-number">{TECOTECO_STATS.totalProblems.toLocaleString()}</span>
          <span className="stat-label">총 해결한 문제</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{TECOTECO_STATS.totalHours}시간+</span>
          <span className="stat-label">함께한 시간</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{TECOTECO_STATS.participationRate}%</span>
          <span className="stat-label">평균 참여율</span>
        </div>
        <div className="stat-item popular-algorithms">
          <span className="stat-label">인기 알고리즘</span>
          <div className="algorithm-tags">
            {TECOTECO_STATS.popularAlgorithms.map((algo, index) => (
              <span key={index} className="algorithm-tag">
                {algo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MembersSection: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<Contributor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  const handleMemberClick = (member: Contributor) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMember(null);
  }, []);

  const handleMemberHover = (memberId: string | null) => {
    setHoveredMemberId(memberId);
  };

  return (
    <section className="tecoteco-members-section">
      <div className="section-tag-header">함께하는 멤버들이에요</div>
      <h2 className="section-title">
        더 멋진 여정이 펼쳐질 거예요, <br /> 함께라면.
      </h2>

      {/* 멤버 카드 섹션 */}
      <div className="scrolling-members-wrapper">
        <div className="scrolling-members-inner">
          <div className="tecoteco-contributors-list">
            {tecotecoMembers.map((member, index) => (
              <ContributorCard
                key={index}
                contributor={member}
                onClick={() => handleMemberClick(member)}
                isMvp={member.name === TECOTECO_STATS.weeklyMvp}
                isHovered={hoveredMemberId === member.name}
                onHover={handleMemberHover}
                hoveredMemberId={hoveredMemberId}
              />
            ))}
          </div>
          <div className="tecoteco-contributors-list" aria-hidden="true">
            {tecotecoMembers.map((member, index) => (
              <ContributorCard
                key={index + tecotecoMembers.length}
                contributor={member}
                onClick={() => handleMemberClick(member)}
                isMvp={member.name === TECOTECO_STATS.weeklyMvp}
                isHovered={hoveredMemberId === member.name}
                onHover={handleMemberHover}
                hoveredMemberId={hoveredMemberId}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="members-intro">
        각자의 성장 스토리가 모여 더 큰 시너지를 만들어가고 있어요.
        <br />
        <span className="interactive-hint">
          💡 멤버 카드를 클릭해서 더 자세한 이야기를 확인해보세요!
        </span>
      </p>

      {/* 연결성 표현 */}
      <div className="connection-lines">
        <svg className="connections-svg" viewBox="0 0 100 20">
          <path
            d="M 10 10 Q 30 5 50 10 T 90 10"
            stroke="rgba(195, 232, 141, 0.3)"
            strokeWidth="1"
            fill="none"
            className="connection-path"
          />
        </svg>
        <span className="connection-text">서로 영감을 주고받으며</span>
      </div>

      {/* 통계 섹션 */}
      <StatsSection />

      {/* 멤버 상세 모달 */}
      {selectedMember && (
        <MemberDetailModal member={selectedMember} isOpen={isModalOpen} onClose={closeModal} />
      )}
    </section>
  );
};

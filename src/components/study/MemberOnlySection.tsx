import React from 'react';
import './MemberOnlySection.css';

interface MemberOnlySectionProps {
  studyId: string;
  studyStatus: string;
}

const MemberOnlySection: React.FC<MemberOnlySectionProps> = ({ studyId, studyStatus }) => {
  return (
    <div className="member-only-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="lock-icon">🔒</span>
          멤버 전용 공간
        </h2>
        <span className="member-badge">Member Only</span>
      </div>

      <div className="member-content-grid">
        {/* 공지사항 */}
        <div className="member-card announcements">
          <h3 className="card-title">📢 공지사항</h3>
          <div className="card-content">
            <div className="announcement-item">
              <span className="announcement-date">2025.08.12</span>
              <p className="announcement-text">다음 주 세션은 온라인으로 진행됩니다.</p>
            </div>
            <div className="announcement-item">
              <span className="announcement-date">2025.08.10</span>
              <p className="announcement-text">과제 제출 마감일이 변경되었습니다.</p>
            </div>
          </div>
        </div>

        {/* 스터디 자료 */}
        <div className="member-card resources">
          <h3 className="card-title">📚 스터디 자료</h3>
          <div className="card-content">
            <div className="resource-item">
              <span className="resource-icon">📄</span>
              <div className="resource-info">
                <p className="resource-name">Week 1 - 알고리즘 기초</p>
                <span className="resource-meta">PDF, 2.3MB</span>
              </div>
              <button className="download-button">다운로드</button>
            </div>
            <div className="resource-item">
              <span className="resource-icon">🎥</span>
              <div className="resource-info">
                <p className="resource-name">세션 녹화본</p>
                <span className="resource-meta">동영상 링크</span>
              </div>
              <button className="download-button">보기</button>
            </div>
          </div>
        </div>

        {/* 다음 세션 정보 */}
        <div className="member-card next-session">
          <h3 className="card-title">📅 다음 세션</h3>
          <div className="card-content">
            <div className="session-info">
              <p className="session-date">2025년 8월 19일 (월)</p>
              <p className="session-time">오후 7:30 - 9:30</p>
              <p className="session-location">온라인 (Zoom)</p>
              <div className="session-topic">
                <strong>주제:</strong> 다이나믹 프로그래밍 심화
              </div>
            </div>
          </div>
        </div>

        {/* 출석 현황 */}
        <div className="member-card attendance">
          <h3 className="card-title">✅ 나의 출석 현황</h3>
          <div className="card-content">
            <div className="attendance-stats">
              <div className="stat-item">
                <span className="stat-label">총 세션</span>
                <span className="stat-value">12회</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">출석</span>
                <span className="stat-value">10회</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">출석률</span>
                <span className="stat-value highlight">83%</span>
              </div>
            </div>
            <div className="attendance-history">
              <div className="history-item attended">
                <span className="date">8/5</span>
                <span className="status">출석</span>
              </div>
              <div className="history-item attended">
                <span className="date">7/29</span>
                <span className="status">출석</span>
              </div>
              <div className="history-item absent">
                <span className="date">7/22</span>
                <span className="status">결석</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {studyStatus === 'IN_PROGRESS' && (
        <div className="quick-actions">
          <button className="action-btn primary">
            <span className="btn-icon">✋</span>
            출석 체크
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📝</span>
            과제 제출
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">💬</span>
            토론방 입장
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberOnlySection;
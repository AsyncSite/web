import React, { useState } from 'react';
import { JobItemResponse } from '../../../api/jobNavigatorService';
import { highlightText } from '../../../utils/highlightText';
import './NavigatorList.css';

interface NavigatorListProps {
  jobs: JobItemResponse[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    companies: string[];
    skills: string[];
    experience: string[];
  };
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onJobClick?: (jobId: number) => void;
  showOnlyActive?: boolean;
  onShowOnlyActiveChange?: (value: boolean) => void;
}

const NavigatorList: React.FC<NavigatorListProps> = ({ 
  jobs, 
  loading, 
  error, 
  searchQuery, 
  filters, 
  currentPage, 
  totalPages, 
  totalElements,
  onPageChange,
  onJobClick,
  showOnlyActive = true,
  onShowOnlyActiveChange 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('matchScore');
  
  const sortOptions = [
    { value: 'matchScore', label: '매칭률 높은순', icon: '🎯' },
    { value: 'latest', label: '최신순', icon: '🆕' },
    { value: 'deadline', label: '마감임박순', icon: '⏰' },
    { value: 'popular', label: '인기순', icon: '🔥' }
  ];
  
  const currentSortOption = sortOptions.find(opt => opt.value === selectedSort) || sortOptions[0];
  // Show loading state
  if (loading) {
    return (
      <div className="ignition-nav-list">
        <div className="ignition-nav-loading">
          <div className="ignition-nav-spinner"></div>
          <p>채용공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="ignition-nav-list">
        <div className="ignition-nav-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ignition-nav-list">
      {/* List Controls */}
      <div className="ignition-nav-list-controls">
        <span className="ignition-nav-results-count">총 {totalElements}개의 채용공고</span>
        <div className="ignition-nav-view-options">
          {/* Custom Sort Dropdown */}
          <div className="ignition-nav-sort-group">
            <button 
              className="ignition-nav-sort-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="ignition-nav-sort-icon">{currentSortOption.icon}</span>
              <span className="ignition-nav-sort-label">{currentSortOption.label}</span>
              <span className={`ignition-nav-sort-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
            </button>
            
            {isDropdownOpen && (
              <div className="ignition-nav-sort-dropdown">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`ignition-nav-sort-option ${selectedSort === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSort(option.value);
                      setIsDropdownOpen(false);
                      // TODO: Add actual sort logic here
                    }}
                  >
                    <span className="ignition-nav-sort-option-icon">{option.icon}</span>
                    <span className="ignition-nav-sort-option-label">{option.label}</span>
                    {selectedSort === option.value && (
                      <span className="ignition-nav-sort-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Active Jobs Toggle */}
          <div className="ignition-nav-active-toggle">
            <label className="ignition-nav-toggle-label">
              <input 
                type="checkbox"
                className="ignition-nav-toggle-checkbox"
                checked={showOnlyActive}
                onChange={(e) => onShowOnlyActiveChange && onShowOnlyActiveChange(e.target.checked)}
              />
              <span className="ignition-nav-toggle-slider"></span>
              <span className="ignition-nav-toggle-text">활성 공고만</span>
            </label>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="ignition-nav-job-items">
        {jobs.map((job) => (
          <article key={job.id} className="ignition-nav-job-item">
            {job.hasWarRoom && (
              <div className="ignition-nav-war-room-indicator"></div>
            )}
            
            <div className="ignition-nav-job-item-header">
              <div className="ignition-nav-job-info">
                <div className="ignition-nav-job-company">
                  <div className="ignition-nav-company-logo">{job.companyLogo}</div>
                  <span className="ignition-nav-company-name">{highlightText(job.company, searchQuery)}</span>
                </div>
                <h3 className="ignition-nav-job-title">{highlightText(job.title, searchQuery)}</h3>
              </div>
              <div className="ignition-nav-job-badges">
                {/* 매칭 점수 임시 비활성화 - 서버 측 개인화 구현 후 활성화 예정 */}
                {/* <div className="ignition-nav-match-badge">{job.matchScore}% 매칭</div> */}
                {job.hasWarRoom && (
                  <div className="ignition-nav-war-room-badge">
                    <span>👥</span>
                    <span>{job.warRoomCount}명 작전회의중</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="ignition-nav-job-description">{job.description}</p>
            
            <div className="ignition-nav-job-skills">
              {job.skills.map((skill, index) => (
                <span key={index} className="ignition-nav-skill-tag">{skill}</span>
              ))}
            </div>
            
            <div className="ignition-nav-job-footer">
              <div className="ignition-nav-job-meta">
                <div className="ignition-nav-job-meta-item">🏢 {job.experience}</div>
                <div className="ignition-nav-job-meta-item">📍 {job.location}</div>
                <div className="ignition-nav-job-meta-item">📅 {job.deadline}</div>
                {job.postedAt && (
                  <div className="ignition-nav-job-meta-item">🕐 공고 일자: {job.postedAt}</div>
                )}
              </div>
              <div className="ignition-nav-job-action">
                <button 
                  className="ignition-nav-action-btn"
                  onClick={() => onJobClick && onJobClick(job.id)}
                >
                  상세보기
                </button>
                {/* 로드맵 분석 버튼 임시 비활성화 - 서버 측 개인화 구현 후 활성화 예정 */}
                {/* <button className="ignition-nav-action-btn primary">로드맵 분석</button> */}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="ignition-nav-pagination">
        <button 
          className="ignition-nav-page-btn" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          &lt;
        </button>
        
        {/* Generate page buttons */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNum = i;
          return (
            <button
              key={pageNum}
              className={`ignition-nav-page-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum + 1}
            </button>
          );
        })}
        
        <button 
          className="ignition-nav-page-btn" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default NavigatorList;
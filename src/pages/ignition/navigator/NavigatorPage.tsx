import React, { useState } from 'react';
import NavigatorDashboard from '../../../components/ignition/navigator/NavigatorDashboard';
import NavigatorList from '../../../components/ignition/navigator/NavigatorList';
import NavigatorFilters from '../../../components/ignition/navigator/NavigatorFilters';
import './NavigatorPage.css';

type ViewMode = 'dashboard' | 'list';

const NavigatorPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 기본값을 list로 변경
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    companies: [] as string[],
    skills: [] as string[],
    experience: [] as string[],
  });


  return (
    <div className="ignition-nav-page">
      {/* Hero Section */}
      <section className="ignition-nav-hero">
        <div className="ignition-nav-container">
          <h1 className="ignition-nav-title">커리어 네비게이터</h1>
          <p className="ignition-nav-subtitle">
            공고를 넘어, 당신의 다음 커리어 여정을 설계합니다.
          </p>
        </div>
      </section>

      {/* Content Wrapper */}
      <div className="ignition-nav-content-wrapper">
        {/* View Mode Toggle */}
        <div className="ignition-nav-view-toggle">
          <button
            className={`ignition-nav-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span className="ignition-nav-view-icon">📋</span>
            공고 목록
          </button>
          <button
            className={`ignition-nav-view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => setViewMode('dashboard')}
          >
            <span className="ignition-nav-view-icon">📊</span>
            대시보드
          </button>
        </div>

        {/* Search Section */}
        <section className="ignition-nav-search-section">
          <div className="ignition-nav-search-box">
            <span className="ignition-nav-search-icon">🔍</span>
            <input
              type="text"
              className="ignition-nav-search-input"
              placeholder="회사, 직무, 기술 스택으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Main Content */}
        <div className="ignition-nav-main-content">
          {viewMode === 'dashboard' ? (
            <NavigatorDashboard />
          ) : (
            <div className="ignition-nav-list-layout">
              <NavigatorFilters filters={filters} onFilterChange={setFilters} />
              <NavigatorList searchQuery={searchQuery} filters={filters} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigatorPage;
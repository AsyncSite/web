import React, { useState, useEffect, useCallback } from 'react';
import NavigatorDashboard from '../../../components/ignition/navigator/NavigatorDashboard';
import NavigatorList from '../../../components/ignition/navigator/NavigatorList';
import NavigatorFilters from '../../../components/ignition/navigator/NavigatorFilters';
import JobDetailModal from '../../../components/ignition/navigator/JobDetailModal';
import jobNavigatorService, { JobItemResponse, CompanyResponse, TechStackResponse } from '../../../api/jobNavigatorService';
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
  
  // API states
  const [jobs, setJobs] = useState<JobItemResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [techStacks, setTechStacks] = useState<TechStackResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Helper function to map company names to IDs
  const getCompanyId = useCallback((companyName: string): number | undefined => {
    const company = companies.find(c => c.name === companyName);
    return company?.id;
  }, [companies]);

  // Helper function to map skill names to IDs
  const getTechStackId = useCallback((skillName: string): number | undefined => {
    const techStack = techStacks.find(t => t.name === skillName);
    return techStack?.id;
  }, [techStacks]);

  // Load filter options (companies and tech stacks)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [companiesData, techStacksData] = await Promise.all([
          jobNavigatorService.getCompanies(),
          jobNavigatorService.getTechStacks()
        ]);
        setCompanies(companiesData);
        setTechStacks(techStacksData);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  // Load jobs based on filters and search query
  const loadJobs = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // Map filter names to IDs
      const companyIds = filters.companies
        .map(getCompanyId)
        .filter((id): id is number => id !== undefined);
        
      const techStackIds = filters.skills
        .map(getTechStackId)
        .filter((id): id is number => id !== undefined);

      const response = await jobNavigatorService.searchJobs({
        keyword: searchQuery,
        companyIds: companyIds.length > 0 ? companyIds : undefined,
        techStackIds: techStackIds.length > 0 ? techStackIds : undefined,
        experienceLevel: filters.experience[0],
        page,
        size: 20,
        sortBy: 'matchScore',
        sortDirection: 'DESC'
      });

      setJobs(response.content);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('채용공고를 불러오는데 실패했습니다.');
      // Fallback to mock data if API fails
      // This allows development to continue even if backend is down
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, getCompanyId, getTechStackId]);

  // Load jobs when filters or search query changes
  useEffect(() => {
    loadJobs(0);
  }, [loadJobs]);

  // Handle page change
  const handlePageChange = (page: number) => {
    loadJobs(page);
  };

  // Handle job click
  const handleJobClick = (jobId: number) => {
    setSelectedJobId(jobId);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedJobId(null);
  };

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
              <NavigatorFilters 
                filters={filters} 
                onFilterChange={setFilters}
                companies={companies}
                techStacks={techStacks}
              />
              <NavigatorList 
                jobs={jobs}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                filters={filters}
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={handlePageChange}
                onJobClick={handleJobClick}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Job Detail Modal */}
      <JobDetailModal 
        jobId={selectedJobId} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default NavigatorPage;
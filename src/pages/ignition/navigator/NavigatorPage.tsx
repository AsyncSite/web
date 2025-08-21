import React, { useState, useEffect, useCallback } from 'react';
import NavigatorDashboard from '../../../components/ignition/navigator/NavigatorDashboard';
import NavigatorList from '../../../components/ignition/navigator/NavigatorList';
import NavigatorFilters from '../../../components/ignition/navigator/NavigatorFilters';
import JobDetailModal from '../../../components/ignition/navigator/JobDetailModal';
import SuggestionFAB from '../../../components/ignition/navigator/SuggestionFAB';
import jobNavigatorService, { 
  JobItemResponse, 
  CompanyResponse, 
  TechStackResponse,
  CompanyWithCountResponse,
  TechStackWithCountResponse,
  ExperienceCategoryWithCountResponse 
} from '../../../api/jobNavigatorService';
import { useDebounce } from '../../../hooks/useDebounce';
import styles from './NavigatorPage.module.css';

type ViewMode = 'dashboard' | 'list';

const NavigatorPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    companies: [] as string[],
    skills: [] as string[],
    experience: [] as string[],
    locations: [] as string[],
    jobTypes: [] as string[],
    techCategories: [] as string[],
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // API states
  const [jobs, setJobs] = useState<JobItemResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [techStacks, setTechStacks] = useState<TechStackResponse[]>([]);
  const [companiesWithCount, setCompaniesWithCount] = useState<CompanyWithCountResponse[]>([]);
  const [techStacksWithCount, setTechStacksWithCount] = useState<TechStackWithCountResponse[]>([]);
  const [experienceCategoriesWithCount, setExperienceCategoriesWithCount] = useState<ExperienceCategoryWithCountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const getCompanyId = useCallback((companyName: string): number | undefined => {
    const company = companies.find(c => c.name === companyName);
    return company?.id;
  }, [companies]);

  const getTechStackId = useCallback((skillName: string): number | undefined => {
    const techStack = techStacks.find(t => t.name === skillName);
    return techStack?.id;
  }, [techStacks]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [companiesData, techStacksData] = await Promise.all([
          jobNavigatorService.getCompanies(),
          jobNavigatorService.getTechStacks()
        ]);
        setCompanies(companiesData);
        setTechStacks(techStacksData);
        
        try {
          const [companiesWithCountData, techStacksWithCountData, experienceCategoriesWithCountData] = await Promise.all([
            jobNavigatorService.getCompaniesWithCount(),
            jobNavigatorService.getTechStacksWithCount(),
            jobNavigatorService.getExperienceCategoriesWithCount()
          ]);
          setCompaniesWithCount(companiesWithCountData);
          setTechStacksWithCount(techStacksWithCountData);
          setExperienceCategoriesWithCount(experienceCategoriesWithCountData);
        } catch (countErr) {
          console.warn('Failed to load count data, using basic filters:', countErr);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  const loadJobs = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const companyIds = filters.companies
        .map(getCompanyId)
        .filter((id): id is number => id !== undefined);
        
      const techStackIds = filters.skills
        .map(getTechStackId)
        .filter((id): id is number => id !== undefined);

      const response = await jobNavigatorService.searchJobs({
        keyword: debouncedSearchQuery,
        companyIds: companyIds.length > 0 ? companyIds : undefined,
        techStackIds: techStackIds.length > 0 ? techStackIds : undefined,
        experienceLevel: filters.experience[0],
        location: filters.locations[0] || undefined,
        jobType: filters.jobTypes[0] || undefined,
        isActive: showOnlyActive,
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
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, filters, getCompanyId, getTechStackId, showOnlyActive]);

  useEffect(() => {
    loadJobs(0);
  }, [loadJobs]);

  const handlePageChange = (page: number) => {
    loadJobs(page);
  };

  const handleJobClick = (jobId: number) => {
    setSelectedJobId(jobId);
  };

  const handleModalClose = () => {
    setSelectedJobId(null);
  };

  const handleRemoveFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const currentValue = prev[category] as string[];
      return {
        ...prev,
        [category]: currentValue.filter(item => item !== value)
      };
    });
  };

  // 인기 필터만 가져오기 (상위 3개씩)
  const getPopularFilters = () => {
    const popularCompanies = companiesWithCount?.slice(0, 3) || [];
    const popularTechStacks = techStacksWithCount?.slice(0, 3) || [];
    return { popularCompanies, popularTechStacks };
  };

  const { popularCompanies, popularTechStacks } = getPopularFilters();
  const totalActiveFilters = filters.companies.length + filters.skills.length + filters.experience.length + 
    filters.locations.length + filters.jobTypes.length + filters.techCategories.length;

  const locations = [...new Set(jobs.map(job => job.location))].filter(Boolean).sort();
  
  const techCategories = [
    { value: 'LANGUAGE', label: '프로그래밍 언어' },
    { value: 'FRAMEWORK', label: '프레임워크' },
    { value: 'DATABASE', label: '데이터베이스' },
    { value: 'CLOUD', label: '클라우드' },
    { value: 'TOOL', label: '도구' },
    { value: 'OTHER', label: '기타' }
  ];

  return (
    <div className={styles['ignition-nav-page']}>
      <section className={styles['ignition-nav-hero']}>
        <div className={styles['ignition-nav-container']}>
          <h1 className={styles['ignition-nav-title']}>커리어 네비게이터</h1>
          <p className={styles['ignition-nav-subtitle']}>
            검색바 아래 통합 필터로 더 빠르게 찾아보세요.
          </p>
        </div>
      </section>

      <div className={styles['ignition-nav-content-wrapper']}>
        <section className={styles['ignition-nav-search-section']}>
          <div className={styles['ignition-nav-search-container']}>
            <div className={styles['ignition-nav-search-box']}>
              <span className={styles['ignition-nav-search-icon']}>🔍</span>
              <input
                type="text"
                className={styles['ignition-nav-search-input']}
                placeholder="회사, 직무, 기술 스택으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {loading && searchQuery !== debouncedSearchQuery && (
                <div className={styles['ignition-nav-search-loading']}>
                  <span className={styles['ignition-nav-search-loading-spinner']}>⏳</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles['ignition-nav-filter-area']}>
            {/* Selected Filters Tags */}
            {totalActiveFilters > 0 && (
              <div className={styles['ignition-nav-selected-filters']}>
                {filters.companies.map(company => (
                  <span key={`company-${company}`} className={styles['ignition-nav-filter-tag']}>
                    🏢 {company}
                    <button 
                      className={styles['ignition-nav-filter-tag-remove']}
                      onClick={() => handleRemoveFilter('companies', company)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.skills.map(skill => (
                  <span key={`skill-${skill}`} className={styles['ignition-nav-filter-tag']}>
                    💻 {skill}
                    <button 
                      className={styles['ignition-nav-filter-tag-remove']}
                      onClick={() => handleRemoveFilter('skills', skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.experience.map(exp => (
                  <span key={`exp-${exp}`} className={styles['ignition-nav-filter-tag']}>
                    👤 {exp === 'ENTRY' ? '신입' : 
                     exp === 'JUNIOR' ? '주니어' :
                     exp === 'MID' ? '미드레벨' :
                     exp === 'SENIOR' ? '시니어' :
                     exp === 'LEAD' ? '리드/수석급' :
                     exp === 'ANY' ? '경력무관' : exp}
                    <button 
                      className={styles['ignition-nav-filter-tag-remove']}
                      onClick={() => handleRemoveFilter('experience', exp)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.locations.map(location => (
                  <span key={`location-${location}`} className={styles['ignition-nav-filter-tag']}>
                    📍 {location}
                    <button 
                      className={styles['ignition-nav-filter-tag-remove']}
                      onClick={() => handleRemoveFilter('locations', location)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.jobTypes.map(jobType => (
                  <span key={`jobType-${jobType}`} className={styles['ignition-nav-filter-tag']}>
                    💼 {jobType === 'BACKEND' ? '백엔드' :
                        jobType === 'FRONTEND' ? '프론트엔드' :
                        jobType === 'MOBILE' ? '모바일' : jobType}
                    <button 
                      className={styles['ignition-nav-filter-tag-remove']}
                      onClick={() => handleRemoveFilter('jobTypes', jobType)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.techCategories.map(techCategory => (
                  <span key={`techCat-${techCategory}`} className={styles['ignition-nav-filter-tag']}>
                    🏷️ {techCategories.find(tc => tc.value === techCategory)?.label || techCategory}
                    <button 
                      className={styles['ignition-nav-filter-tag-remove']}
                      onClick={() => handleRemoveFilter('techCategories', techCategory)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button 
                  className={styles['ignition-nav-clear-all']}
                  onClick={() => setFilters({ companies: [], skills: [], experience: [], locations: [], jobTypes: [], techCategories: [] })}
                >
                  모두 지우기
                </button>
              </div>
            )}

            {/* Quick Filter Buttons - 인기 필터만 노출 (옵션 2) */}
            <div className={styles['ignition-nav-quick-filters']}>
              {/* 인기 회사 */}
              {popularCompanies.map(company => (
                <button
                  key={company.name}
                  className={`${styles['ignition-nav-quick-filter-btn']} ${
                    filters.companies.includes(company.name) ? styles['active'] : ''
                  }`}
                  onClick={() => {
                    if (filters.companies.includes(company.name)) {
                      handleRemoveFilter('companies', company.name);
                    } else {
                      setFilters(prev => ({
                        ...prev,
                        companies: [...prev.companies, company.name]
                      }));
                    }
                  }}
                >
                  {company.name}
                </button>
              ))}
              
              {/* 인기 기술 */}
              {popularTechStacks.map(tech => (
                <button
                  key={tech.name}
                  className={`${styles['ignition-nav-quick-filter-btn']} ${
                    filters.skills.includes(tech.name) ? styles['active'] : ''
                  }`}
                  onClick={() => {
                    if (filters.skills.includes(tech.name)) {
                      handleRemoveFilter('skills', tech.name);
                    } else {
                      setFilters(prev => ({
                        ...prev,
                        skills: [...prev.skills, tech.name]
                      }));
                    }
                  }}
                >
                  {tech.name}
                </button>
              ))}
              
              {/* 신입/주니어 */}
              <button
                className={`${styles['ignition-nav-quick-filter-btn']} ${
                  filters.experience.includes('ENTRY') ? styles['active'] : ''
                }`}
                onClick={() => {
                  if (filters.experience.includes('ENTRY')) {
                    handleRemoveFilter('experience', 'ENTRY');
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      experience: [...prev.experience, 'ENTRY']
                    }));
                  }
                }}
              >
                신입
              </button>
              
              <button
                className={`${styles['ignition-nav-quick-filter-btn']} ${
                  filters.experience.includes('JUNIOR') ? styles['active'] : ''
                }`}
                onClick={() => {
                  if (filters.experience.includes('JUNIOR')) {
                    handleRemoveFilter('experience', 'JUNIOR');
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      experience: [...prev.experience, 'JUNIOR']
                    }));
                  }
                }}
              >
                주니어
              </button>
              
              <span className={styles['ignition-nav-filter-divider']}>|</span>
              
              {/* 더 많은 필터 */}
              <button 
                className={styles['ignition-nav-more-filters-btn']}
                onClick={() => setShowSidebar(!showSidebar)}
              >
                ➕ 더 많은 필터
              </button>
            </div>
          </div>
        </section>

        <div className={styles['ignition-nav-main-content']}>
          <div className={`${styles['ignition-nav-list-layout']} ${!showSidebar ? styles['no-sidebar'] : ''}`}>
            {showSidebar && (
              <NavigatorFilters 
                filters={{
                  companies: filters.companies,
                  skills: filters.skills,
                  experience: filters.experience,
                  locations: filters.locations,
                  jobTypes: filters.jobTypes
                }} 
                onFilterChange={(newFilters) => {
                  setFilters(prev => ({
                    ...prev,
                    ...newFilters
                  }));
                }}
                companies={companies}
                techStacks={techStacks}
                companiesWithCount={companiesWithCount}
                techStacksWithCount={techStacksWithCount}
                experienceCategoriesWithCount={experienceCategoriesWithCount}
              />
            )}
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
              showOnlyActive={showOnlyActive}
              onShowOnlyActiveChange={setShowOnlyActive}
            />
          </div>
        </div>
      </div>
      
      <JobDetailModal 
        jobId={selectedJobId} 
        onClose={handleModalClose} 
      />
      
      <SuggestionFAB />
    </div>
  );
};

export default NavigatorPage;
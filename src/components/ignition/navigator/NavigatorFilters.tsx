import React, { useMemo } from 'react';
import { 
  CompanyResponse, 
  TechStackResponse,
  CompanyWithCountResponse,
  TechStackWithCountResponse,
  ExperienceCategoryWithCountResponse 
} from '../../../api/jobNavigatorService';
import './NavigatorFilters.css';

interface NavigatorFiltersProps {
  filters: {
    companies: string[];
    skills: string[];
    experience: string[];
    locations?: string[];
    jobTypes?: string[];
  };
  onFilterChange: (filters: {
    companies?: string[];
    skills?: string[];
    experience?: string[];
    locations?: string[];
    jobTypes?: string[];
  }) => void;
  companies: CompanyResponse[];
  techStacks: TechStackResponse[];
  companiesWithCount?: CompanyWithCountResponse[];
  techStacksWithCount?: TechStackWithCountResponse[];
  experienceCategoriesWithCount?: ExperienceCategoryWithCountResponse[];
}

const NavigatorFilters: React.FC<NavigatorFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  companies,
  techStacks,
  companiesWithCount,
  techStacksWithCount,
  experienceCategoriesWithCount 
}) => {
  const availableFilters = useMemo(() => {
    // Use real count data if available, otherwise fallback to companies list
    const companiesData = companiesWithCount && companiesWithCount.length > 0
      ? companiesWithCount.map(company => ({
          name: company.name,
          count: company.jobCount
        }))
      : companies.map(company => ({
          name: company.name,
          count: 0 // No count available
        }));

    // Use real count data if available, otherwise fallback to tech stacks list
    const skillsData = techStacksWithCount && techStacksWithCount.length > 0
      ? techStacksWithCount.map(tech => ({
          name: tech.name,
          count: tech.jobCount
        }))
      : techStacks.map(tech => ({
          name: tech.name,
          count: 0 // No count available
        }));

    // Use real count data if available, otherwise fallback to static list
    const experienceLevels = experienceCategoriesWithCount && experienceCategoriesWithCount.length > 0
      ? experienceCategoriesWithCount.map(exp => ({
          name: exp.displayName,
          value: exp.category,
          count: exp.jobCount
        }))
      : [
          { name: '신입', value: 'ENTRY', count: 0 },
          { name: '주니어 (1-3년)', value: 'JUNIOR', count: 0 },
          { name: '미드레벨 (3-7년)', value: 'MID', count: 0 },
          { name: '시니어 (7년+)', value: 'SENIOR', count: 0 },
          { name: '리드/수석급', value: 'LEAD', count: 0 },
          { name: '경력무관', value: 'ANY', count: 0 },
        ];

    return {
      companies: companiesData.length > 0 ? companiesData : [
        { name: '회사 정보를 불러오는 중...', count: 0 }
      ],
      skills: skillsData.length > 0 ? skillsData : [
        { name: '기술 스택을 불러오는 중...', count: 0 }
      ],
      experience: experienceLevels,
      locations: [
        { name: '서울', value: '서울', count: 0 },
        { name: '경기', value: '경기', count: 0 },
        { name: '인천', value: '인천', count: 0 },
        { name: '부산', value: '부산', count: 0 },
        { name: '대구', value: '대구', count: 0 },
        { name: '대전', value: '대전', count: 0 },
        { name: '광주', value: '광주', count: 0 },
        { name: '울산', value: '울산', count: 0 },
        { name: '세종', value: '세종', count: 0 },
        { name: '제주', value: '제주', count: 0 },
      ],
      jobTypes: [
        { name: '백엔드', value: 'BACKEND', count: 0 },
        { name: '프론트엔드', value: 'FRONTEND', count: 0 },
        { name: '풀스택', value: 'FULLSTACK', count: 0 },
        { name: '모바일', value: 'MOBILE', count: 0 },
        { name: 'AI/ML', value: 'AI_ML', count: 0 },
        { name: '데이터', value: 'DATA', count: 0 },
        { name: 'DevOps', value: 'DEVOPS', count: 0 },
        { name: '보안', value: 'SECURITY', count: 0 },
        { name: '게임', value: 'GAME', count: 0 },
      ],
    };
  }, [companies, techStacks, companiesWithCount, techStacksWithCount]);

  const handleFilterToggle = (category: keyof typeof filters, value: string, enumValue?: string) => {
    const currentFilters = { ...filters };
    const filterValue = enumValue || value;
    
    // Initialize arrays if they don't exist
    if (category === 'locations' && !currentFilters.locations) {
      currentFilters.locations = [];
    }
    if (category === 'jobTypes' && !currentFilters.jobTypes) {
      currentFilters.jobTypes = [];
    }
    
    const categoryArray = currentFilters[category] || [];
    const index = categoryArray.indexOf(filterValue);
    
    if (index > -1) {
      currentFilters[category] = categoryArray.filter(item => item !== filterValue);
    } else {
      currentFilters[category] = [...categoryArray, filterValue];
    }
    
    onFilterChange(currentFilters);
  };

  return (
    <aside className="ignition-nav-filters">
      {/* 성장 로드맵 CTA 임시 비활성화 - 서버 측 개인화 구현 후 활성화 예정 */}
      {/* <div className="ignition-nav-filter-cta">
        <h3 className="ignition-nav-filter-cta-title">🚀 성장 로드맵</h3>
        <p className="ignition-nav-filter-cta-desc">목표 공고까지의 최적 경로를 찾아보세요</p>
        <button className="ignition-nav-filter-cta-btn">내 로드맵 만들기</button>
      </div> */}

      {/* Company Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="ignition-nav-filter-title">회사</h3>
        {availableFilters.companies.map((company) => (
          <div
            key={company.name}
            className="ignition-nav-filter-option"
            onClick={() => handleFilterToggle('companies', company.name)}
          >
            <div className={`ignition-nav-filter-checkbox ${filters.companies.includes(company.name) ? 'checked' : ''}`}></div>
            <span className="ignition-nav-filter-name">{company.name}</span>
            <span className="ignition-nav-filter-count">{company.count}</span>
          </div>
        ))}
      </div>

      {/* Skill Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="ignition-nav-filter-title">기술 스택</h3>
        {availableFilters.skills.map((skill) => (
          <div
            key={skill.name}
            className="ignition-nav-filter-option"
            onClick={() => handleFilterToggle('skills', skill.name)}
          >
            <div className={`ignition-nav-filter-checkbox ${filters.skills.includes(skill.name) ? 'checked' : ''}`}></div>
            <span className="ignition-nav-filter-name">{skill.name}</span>
            <span className="ignition-nav-filter-count">{skill.count}</span>
          </div>
        ))}
      </div>

      {/* Experience Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="ignition-nav-filter-title">경력</h3>
        {availableFilters.experience.map((exp) => (
          <div
            key={exp.name}
            className="ignition-nav-filter-option"
            onClick={() => handleFilterToggle('experience', exp.value, exp.value)}
          >
            <div className={`ignition-nav-filter-checkbox ${filters.experience.includes(exp.value) ? 'checked' : ''}`}></div>
            <span className="filter-name">{exp.name}</span>
            <span className="filter-count">{exp.count}</span>
          </div>
        ))}
      </div>

      {/* Location Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="ignition-nav-filter-title">위치</h3>
        {availableFilters.locations.map((location) => (
          <div
            key={location.value}
            className="ignition-nav-filter-option"
            onClick={() => handleFilterToggle('locations', location.value)}
          >
            <div className={`ignition-nav-filter-checkbox ${filters.locations?.includes(location.value) ? 'checked' : ''}`}></div>
            <span className="ignition-nav-filter-name">{location.name}</span>
            <span className="ignition-nav-filter-count">{location.count}</span>
          </div>
        ))}
      </div>

      {/* Job Type Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="ignition-nav-filter-title">직무 유형</h3>
        {availableFilters.jobTypes.map((jobType) => (
          <div
            key={jobType.value}
            className="ignition-nav-filter-option"
            onClick={() => handleFilterToggle('jobTypes', jobType.value)}
          >
            <div className={`ignition-nav-filter-checkbox ${filters.jobTypes?.includes(jobType.value) ? 'checked' : ''}`}></div>
            <span className="ignition-nav-filter-name">{jobType.name}</span>
            <span className="ignition-nav-filter-count">{jobType.count}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NavigatorFilters;
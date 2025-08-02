import React, { useMemo } from 'react';
import { CompanyResponse, TechStackResponse } from '../../../api/jobNavigatorService';
import './NavigatorFilters.css';

interface NavigatorFiltersProps {
  filters: {
    companies: string[];
    skills: string[];
    experience: string[];
  };
  onFilterChange: (filters: {
    companies: string[];
    skills: string[];
    experience: string[];
  }) => void;
  companies: CompanyResponse[];
  techStacks: TechStackResponse[];
}

const NavigatorFilters: React.FC<NavigatorFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  companies,
  techStacks 
}) => {
  const availableFilters = useMemo(() => {
    // Map companies with mock counts for now
    const companiesWithCount = companies.map(company => ({
      name: company.name,
      count: Math.floor(Math.random() * 20) + 1 // Mock count for now
    }));

    // Map tech stacks with mock counts for now
    const skillsWithCount = techStacks.map(tech => ({
      name: tech.name,
      count: Math.floor(Math.random() * 40) + 5 // Mock count for now
    }));

    // Experience levels are static - updated to match new categories
    const experienceLevels = [
      { name: '신입', count: 0 },
      { name: '주니어 (1-3년)', count: 0 },
      { name: '미드레벨 (3-7년)', count: 0 },
      { name: '시니어 (7년+)', count: 0 },
      { name: '리드/수석급', count: 0 },
      { name: '경력무관', count: 0 },
    ];

    return {
      companies: companiesWithCount.length > 0 ? companiesWithCount : [
        { name: '회사 정보를 불러오는 중...', count: 0 }
      ],
      skills: skillsWithCount.length > 0 ? skillsWithCount : [
        { name: '기술 스택을 불러오는 중...', count: 0 }
      ],
      experience: experienceLevels,
    };
  }, [companies, techStacks]);

  const handleFilterToggle = (category: keyof typeof filters, value: string) => {
    const currentFilters = { ...filters };
    const index = currentFilters[category].indexOf(value);
    
    if (index > -1) {
      currentFilters[category] = currentFilters[category].filter(item => item !== value);
    } else {
      currentFilters[category] = [...currentFilters[category], value];
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
            onClick={() => handleFilterToggle('experience', exp.name)}
          >
            <div className={`ignition-nav-filter-checkbox ${filters.experience.includes(exp.name) ? 'checked' : ''}`}></div>
            <span className="filter-name">{exp.name}</span>
            <span className="filter-count">{exp.count}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NavigatorFilters;
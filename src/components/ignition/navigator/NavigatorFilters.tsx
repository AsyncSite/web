import React from 'react';
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
}

const NavigatorFilters: React.FC<NavigatorFiltersProps> = ({ filters, onFilterChange }) => {
  const availableFilters = {
    companies: [
      { name: '네이버', count: 12 },
      { name: '카카오', count: 8 },
      { name: '쿠팡', count: 15 },
      { name: '배달의민족', count: 6 },
      { name: '토스', count: 10 },
      { name: '당근마켓', count: 7 },
      { name: '라인', count: 5 },
    ],
    skills: [
      { name: 'Java', count: 45 },
      { name: 'Spring', count: 38 },
      { name: 'Kotlin', count: 22 },
      { name: 'Python', count: 18 },
      { name: 'React', count: 25 },
      { name: 'TypeScript', count: 20 },
      { name: 'Node.js', count: 15 },
      { name: 'Go', count: 12 },
      { name: 'Kubernetes', count: 28 },
      { name: 'Docker', count: 30 },
    ],
    experience: [
      { name: '신입', count: 23 },
      { name: '경력 (1-3년)', count: 35 },
      { name: '경력 (4-7년)', count: 28 },
      { name: '경력 (8년+)', count: 14 },
    ],
  };

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
      {/* Roadmap CTA */}
      <div className="ignition-nav-filter-cta">
        <h3 className="filter-cta-title">🚀 성장 로드맵</h3>
        <p className="filter-cta-desc">목표 공고까지의 최적 경로를 찾아보세요</p>
        <button className="filter-cta-btn">내 로드맵 만들기</button>
      </div>

      {/* Company Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="filter-title">회사</h3>
        {availableFilters.companies.map((company) => (
          <div
            key={company.name}
            className="filter-option"
            onClick={() => handleFilterToggle('companies', company.name)}
          >
            <div className={`filter-checkbox ${filters.companies.includes(company.name) ? 'checked' : ''}`}></div>
            <span className="filter-name">{company.name}</span>
            <span className="filter-count">{company.count}</span>
          </div>
        ))}
      </div>

      {/* Skill Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="filter-title">기술 스택</h3>
        {availableFilters.skills.map((skill) => (
          <div
            key={skill.name}
            className="filter-option"
            onClick={() => handleFilterToggle('skills', skill.name)}
          >
            <div className={`filter-checkbox ${filters.skills.includes(skill.name) ? 'checked' : ''}`}></div>
            <span className="filter-name">{skill.name}</span>
            <span className="filter-count">{skill.count}</span>
          </div>
        ))}
      </div>

      {/* Experience Filter */}
      <div className="ignition-nav-filter-section">
        <h3 className="filter-title">경력</h3>
        {availableFilters.experience.map((exp) => (
          <div
            key={exp.name}
            className="filter-option"
            onClick={() => handleFilterToggle('experience', exp.name)}
          >
            <div className={`filter-checkbox ${filters.experience.includes(exp.name) ? 'checked' : ''}`}></div>
            <span className="filter-name">{exp.name}</span>
            <span className="filter-count">{exp.count}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NavigatorFilters;
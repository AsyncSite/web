import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoginRedirect } from '../hooks/useLoginRedirect';
import projectService from '../api/projectService';
import type {
  Project,
  ProjectType,
  ProjectStatus,
  MeetingType,
  ProjectFilters
} from '../types/project';
import {
  getProjectTypeLabel,
  getProjectStatusLabel,
  getMeetingTypeLabel,
  calculateDday,
  getProjectThemeByType
} from '../types/project';
import EmptyState from '../components/ui/EmptyState';
import styles from './ProjectListPage.module.css';

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { redirectToLogin } = useLoginRedirect();


  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Single filter: Project Type (simplified)
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const filters: ProjectFilters = {};
        if (typeFilter !== 'all') filters.projectType = typeFilter;
        if (searchQuery) filters.searchQuery = searchQuery;

        const data = await projectService.getAllProjects(filters);
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [typeFilter, searchQuery]);

  const handleCreateProject = () => {
    if (!isAuthenticated) {
      redirectToLogin('/project/new');
      return;
    }
    navigate('/project/new');
  };

  if (loading) {
    return (
      <div className={styles['project-list-page']}>
        <div className={styles['loading']}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles['project-list-page']}>
      {/* Hero Section */}
      <div className={styles['hero']}>
        <h1 className={styles['title']}>프로젝트</h1>
        <p className={styles['subtitle']}>
          함께 만들어갈 프로젝트를 찾고, 팀을 구성하세요
        </p>
        <button className={styles['create-button']} onClick={handleCreateProject}>
          + 프로젝트 등록하기
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles['search-section']}>
        <div className={styles['search-bar']}>
          <svg
            className={styles['search-icon']}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles['search-input']}
          />
        </div>
      </div>

      {/* Type Tabs (Simplified) */}
      <div className={styles['type-tabs']}>
        <button
          className={`${styles['type-tab']} ${typeFilter === 'all' ? styles['active'] : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          전체
        </button>
        <button
          className={`${styles['type-tab']} ${styles['tab-side-project']} ${typeFilter === 'SIDE_PROJECT' ? styles['active'] : ''}`}
          onClick={() => setTypeFilter('SIDE_PROJECT')}
        >
          🚀 사이드 프로젝트
        </button>
        <button
          className={`${styles['type-tab']} ${styles['tab-startup']} ${typeFilter === 'STARTUP' ? styles['active'] : ''}`}
          onClick={() => setTypeFilter('STARTUP')}
        >
          💡 스타트업
        </button>
        <button
          className={`${styles['type-tab']} ${styles['tab-open-source']} ${typeFilter === 'OPEN_SOURCE' ? styles['active'] : ''}`}
          onClick={() => setTypeFilter('OPEN_SOURCE')}
        >
          🌐 오픈소스
        </button>
      </div>

      {/* QueryDaily Promotional Banner */}
      <div className={styles['querydaily-promo-banner']}>
        <div className={styles['promo-pulse']}></div>
        <div className={styles['promo-content']}>
          <div className={styles['promo-left']}>
            <span className={styles['promo-badge']}>NEW</span>
            <h3>🎯 뻔한 질문은 그만, 진짜 면접 질문</h3>
            <p>QueryDaily - 당신의 이력서에서 나온 날카로운 질문</p>
            <div className={styles['promo-features']}>
              <span>✅ 이력서 맞춤형 꼬리 질문</span>
              <span>✅ 실전 면접 시뮬레이션</span>
              <span>✅ 매일 오전 9시 질문 도착</span>
            </div>
          </div>
          <div className={styles['promo-right']}>
            <button
              onClick={() => window.open('https://querydaily.asyncsite.com/', '_blank')}
              className={styles['promo-cta']}
            >
              지금 시작하기 →
            </button>
            <span className={styles['promo-subtext']}>30초면 충분해요</span>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className={styles['results-info']}>
        <p className={styles['results-count']}>
          총 <strong>{projects.length}개</strong>의 프로젝트
        </p>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <EmptyState
          title="프로젝트가 없습니다"
          description="조건에 맞는 프로젝트가 없습니다. 필터를 변경하거나 새 프로젝트를 등록해보세요."
        />
      ) : (
        <div className={styles['project-grid']}>
          {projects.map((project) => {
            const typeColors = getProjectThemeByType(project.projectType);
            return (
              <Link
                key={project.projectId}
                to={`/project/${project.slug}`}
                className={styles['project-card']}
                style={{
                  '--type-color': typeColors.primary,
                  '--type-glow': typeColors.glow,
                  '--type-light': typeColors.light,
                  '--type-border': typeColors.border
                } as React.CSSProperties}
              >
                {/* Header */}
                <div className={styles['card-header']}>
                  <div className={styles['badges']}>
                    <span className={`${styles['badge']} ${styles['type-badge']}`}>
                      {getProjectTypeLabel(project.projectType)}
                    </span>
                    <span
                      className={`${styles['badge']} ${styles['status-badge']} ${styles[`status-${project.status.toLowerCase()}`]}`}
                    >
                      {getProjectStatusLabel(project.status)}
                    </span>
                    {project.recruitmentDeadline && (
                      <span className={`${styles['badge']} ${styles['dday-badge']}`}>
                        {calculateDday(project.recruitmentDeadline)}
                      </span>
                    )}
                  </div>
                  <div className={styles['meeting-type']}>
                    {getMeetingTypeLabel(project.meetingType)}
                  </div>
                </div>

              {/* Title */}
              <h3 className={styles['card-title']}>{project.name}</h3>
              <p className={styles['card-tagline']}>{project.tagline}</p>

              {/* Tech Stack */}
              <div className={styles['tech-stacks']}>
                {project.techStacks.slice(0, 5).map((tech) => (
                  <span key={tech.techStackId} className={styles['tech-tag']}>
                    {tech.technology}
                  </span>
                ))}
                {project.techStacks.length > 5 && (
                  <span className={styles['tech-tag-more']}>
                    +{project.techStacks.length - 5}
                  </span>
                )}
              </div>

              {/* Positions Summary */}
              <div className={styles['positions-summary']}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {project.positions.map((p) => p.positionName).join(', ')} 모집
                </span>
              </div>

              {/* Footer */}
              <div className={styles['card-footer']}>
                <div className={styles['owner-info']}>
                  {project.owner.profileImage && (
                    <img
                      src={project.owner.profileImage}
                      alt={project.owner.name}
                      className={styles['owner-avatar']}
                    />
                  )}
                  <span className={styles['owner-name']}>{project.owner.name}</span>
                </div>
                <div className={styles['meta-info']}>
                  <span className={styles['views']}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {project.views}
                  </span>
                  <span className={styles['duration']}>{project.expectedDuration}</span>
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;

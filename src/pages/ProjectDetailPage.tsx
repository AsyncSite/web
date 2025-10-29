import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoginRedirect } from '../hooks/useLoginRedirect';
import projectService from '../api/projectService';
import type { Project } from '../types/project';
import {
  getProjectTypeLabel,
  getProjectStatusLabel,
  getMeetingTypeLabel,
  getTechCategoryLabel,
  calculateDday,
  getProjectThemeByType
} from '../types/project';
import RichTextDisplay from '../components/common/RichTextDisplay';
import styles from './ProjectDetailPage.module.css';

type TabType = 'overview' | 'positions' | 'techstack' | 'collaboration';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { redirectToLogin } = useLoginRedirect();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await projectService.getProjectBySlug(slug);
        setProject(data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  const handleOpenChatClick = () => {
    if (project?.owner.openChatUrl) {
      window.open(project.owner.openChatUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEditClick = () => {
    navigate(`/project/${slug}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!project || !user) return;

    try {
      setIsDeleting(true);
      await projectService.deleteProject(project.projectId, user.id);
      navigate('/project');
    } catch (error: any) {
      alert(error.message || '프로젝트 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatus: 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!project || !user) return;

    try {
      const updatedProject = await projectService.updateProjectStatus(project.projectId, newStatus, user.id);
      setProject(updatedProject);
    } catch (error: any) {
      alert(error.message || '상태 변경에 실패했습니다.');
    }
  };

  // Check if current user is the project owner
  // TODO: 백엔드 연동 후 실제 오너십 체크로 변경
  const isOwner = true; // 프로토타입: 모든 사용자가 관리 가능

  if (loading) {
    return (
      <div className={styles['project-detail-page']}>
        <div className={styles['loading']}>로딩 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles['project-detail-page']}>
        <div className={styles['not-found']}>
          <h2>프로젝트를 찾을 수 없습니다</h2>
          <button onClick={() => navigate('/project')}>목록으로 돌아가기</button>
        </div>
      </div>
    );
  }

  // Group tech stacks by category
  const techStacksByCategory = project.techStacks.reduce(
    (acc, tech) => {
      if (!acc[tech.category]) {
        acc[tech.category] = [];
      }
      acc[tech.category].push(tech.technology);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const typeColors = getProjectThemeByType(project.projectType);

  return (
    <div className={styles['project-detail-page']}>
      {/* Hero Section */}
      <div
        className={styles['hero']}
        style={{
          '--type-color': typeColors.primary,
          '--type-glow': typeColors.glow,
          '--type-light': typeColors.light,
          '--type-gradient': typeColors.gradient
        } as React.CSSProperties}
      >
        <div className={styles['hero-content']}>
          <div className={styles['badges']}>
            <span className={styles['type-badge']}>
              {getProjectTypeLabel(project.projectType)}
            </span>
            <span className={`${styles['status-badge']} ${styles[`status-${project.status.toLowerCase()}`]}`}>
              {getProjectStatusLabel(project.status)}
            </span>
            {project.recruitmentDeadline && (
              <span className={styles['dday-badge']}>
                {calculateDday(project.recruitmentDeadline)}
              </span>
            )}
          </div>

          <h1 className={styles['title']}>{project.name}</h1>
          <p className={styles['tagline']}>{project.tagline}</p>

          <div className={styles['meta']}>
            <div className={styles['meta-item']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span>
                {project.currentMembers}
                {project.totalCapacity && `/${project.totalCapacity}`}명
              </span>
            </div>
            <div className={styles['meta-item']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{project.expectedDuration}</span>
            </div>
            <div className={styles['meta-item']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{getMeetingTypeLabel(project.meetingType)}</span>
            </div>
            <div className={styles['meta-item']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{project.views} 조회</span>
            </div>
          </div>

          {project.status === 'RECRUITING' && (
            <button className={styles['apply-button']} onClick={handleOpenChatClick}>
              오픈 카톡으로 연락하기
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles['main-content']}>
        <div className={styles['content-area']}>
          {/* Tabs */}
          <div className={styles['tabs']}>
            <button
              className={`${styles['tab']} ${activeTab === 'overview' ? styles['active'] : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              개요
            </button>
            <button
              className={`${styles['tab']} ${activeTab === 'positions' ? styles['active'] : ''}`}
              onClick={() => setActiveTab('positions')}
            >
              모집 포지션 ({project.positions.length})
            </button>
            <button
              className={`${styles['tab']} ${activeTab === 'techstack' ? styles['active'] : ''}`}
              onClick={() => setActiveTab('techstack')}
            >
              기술 스택
            </button>
            <button
              className={`${styles['tab']} ${activeTab === 'collaboration' ? styles['active'] : ''}`}
              onClick={() => setActiveTab('collaboration')}
            >
              협업 방식
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles['tab-content']}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className={styles['overview-tab']}>
                <div className={styles['section']}>
                  <h2 className={styles['section-title']}>프로젝트 소개</h2>
                  <div className={styles['section-content']}>
                    <RichTextDisplay content={project.description} />
                  </div>
                </div>

                {project.vision && (
                  <div className={styles['section']}>
                    <h2 className={styles['section-title']}>비전 & 목표</h2>
                    <div className={styles['vision-box']}>
                      <p>{project.vision}</p>
                    </div>
                  </div>
                )}

                {project.category && (
                  <div className={styles['section']}>
                    <h2 className={styles['section-title']}>카테고리</h2>
                    <span className={styles['category-tag']}>{project.category}</span>
                  </div>
                )}

                {project.compensationDescription && (
                  <div className={styles['section']}>
                    <h2 className={styles['section-title']}>보상 & 혜택</h2>
                    <div className={styles['compensation-box']}>
                      <p>{project.compensationDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Positions Tab */}
            {activeTab === 'positions' && (
              <div className={styles['positions-tab']}>
                {project.positions.map((position) => (
                  <div key={position.positionId} className={styles['position-card']}>
                    <div className={styles['position-header']}>
                      <h3 className={styles['position-name']}>{position.positionName}</h3>
                      <div className={styles['position-count']}>
                        {position.currentCount}/{position.requiredCount}명 모집
                      </div>
                    </div>

                    <div className={styles['position-skills']}>
                      <div className={styles['skill-group']}>
                        <span className={styles['skill-label']}>필수 스킬</span>
                        <div className={styles['skill-tags']}>
                          {position.requiredSkills.map((skill, i) => (
                            <span key={i} className={styles['skill-tag-required']}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {position.preferredSkills.length > 0 && (
                        <div className={styles['skill-group']}>
                          <span className={styles['skill-label']}>우대 스킬</span>
                          <div className={styles['skill-tags']}>
                            {position.preferredSkills.map((skill, i) => (
                              <span key={i} className={styles['skill-tag-preferred']}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles['position-responsibilities']}>
                      <span className={styles['responsibilities-label']}>주요 업무</span>
                      <p>{position.responsibilities}</p>
                    </div>

                    {/* 포지션별 버튼 제거 - 상단 오픈 카톡 버튼만 사용 */}
                  </div>
                ))}
              </div>
            )}

            {/* Tech Stack Tab */}
            {activeTab === 'techstack' && (
              <div className={styles['techstack-tab']}>
                {Object.entries(techStacksByCategory).map(([category, technologies]) => (
                  <div key={category} className={styles['tech-category']}>
                    <h3 className={styles['tech-category-title']}>
                      {getTechCategoryLabel(category as any)}
                    </h3>
                    <div className={styles['tech-tags']}>
                      {technologies.map((tech, i) => (
                        <span key={i} className={styles['tech-tag']}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collaboration Tab */}
            {activeTab === 'collaboration' && (
              <div className={styles['collaboration-tab']}>
                <div className={styles['section']}>
                  <h2 className={styles['section-title']}>미팅 정보</h2>
                  <div className={styles['info-grid']}>
                    <div className={styles['info-item']}>
                      <span className={styles['info-label']}>미팅 방식</span>
                      <span className={styles['info-value']}>
                        {getMeetingTypeLabel(project.meetingType)}
                      </span>
                    </div>
                    {project.meetingFrequency && (
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>미팅 빈도</span>
                        <span className={styles['info-value']}>{project.meetingFrequency}</span>
                      </div>
                    )}
                  </div>
                </div>

                {project.collaborationTools.length > 0 && (
                  <div className={styles['section']}>
                    <h2 className={styles['section-title']}>협업 도구</h2>
                    <div className={styles['tools-grid']}>
                      {project.collaborationTools.map((tool, i) => (
                        <div key={i} className={styles['tool-card']}>
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles['sidebar']}>
          {/* Owner Controls - Only visible to project owner */}
          {isOwner && (
            <div className={styles['sidebar-card']}>
              <h3 className={styles['sidebar-title']}>프로젝트 관리</h3>
              <div className={styles['owner-controls']}>
                <button className={styles['edit-button']} onClick={handleEditClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  수정
                </button>
                <button className={styles['delete-button']} onClick={handleDeleteClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  삭제
                </button>
                {project.status === 'RECRUITING' && (
                  <button
                    className={styles['status-button']}
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                  >
                    모집 마감
                  </button>
                )}
                {project.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      className={styles['status-button-secondary']}
                      onClick={() => handleStatusChange('RECRUITING')}
                    >
                      모집 재개
                    </button>
                    <button
                      className={styles['status-button']}
                      onClick={() => handleStatusChange('COMPLETED')}
                    >
                      완료 처리
                    </button>
                  </>
                )}
                {project.status === 'COMPLETED' && (
                  <button
                    className={styles['status-button-secondary']}
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                  >
                    진행 중으로 되돌리기
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Owner Card */}
          <div className={styles['sidebar-card']}>
            <h3 className={styles['sidebar-title']}>프로젝트 주최자</h3>
            <div className={styles['owner-card']}>
              {project.owner.profileImage && (
                <img
                  src={project.owner.profileImage}
                  alt={project.owner.name}
                  className={styles['owner-avatar']}
                />
              )}
              <div className={styles['owner-info']}>
                <p className={styles['owner-name']}>{project.owner.name}</p>
                <p className={styles['owner-email']}>{project.owner.email}</p>
              </div>
              {(project.owner.github || project.owner.portfolio) && (
                <div className={styles['owner-links']}>
                  {project.owner.github && (
                    <a
                      href={project.owner.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles['owner-link']}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.owner.portfolio && (
                    <a
                      href={project.owner.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles['owner-link']}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Project Info Card */}
          <div className={styles['sidebar-card']}>
            <h3 className={styles['sidebar-title']}>프로젝트 정보</h3>
            <div className={styles['info-list']}>
              {project.recruitmentDeadline && (
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>모집 마감</span>
                  <span className={styles['info-value']}>
                    {project.recruitmentDeadline.toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
              {project.startDate && (
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>시작 예정</span>
                  <span className={styles['info-value']}>
                    {project.startDate.toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>등록일</span>
                <span className={styles['info-value']}>
                  {project.createdAt.toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowDeleteModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <h3>프로젝트 삭제</h3>
            <p>정말로 이 프로젝트를 삭제하시겠습니까?</p>
            <p className={styles['modal-warning']}>
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className={styles['modal-buttons']}>
              <button
                className={styles['modal-cancel']}
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                className={styles['modal-confirm']}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;

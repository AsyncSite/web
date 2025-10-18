import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../api/projectService';
import type { ProjectFormData, ProjectType, MeetingType, TechCategory, Project } from '../types/project';
import RichTextEditor from '../components/common/RichTextEditor';
import styles from './ProjectEditPage.module.css';

const ProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    tagline: '',
    description: '',
    vision: '',
    category: '',
    projectType: 'SIDE_PROJECT',
    techStacks: [],
    positions: [],
    recruitmentDeadline: '',
    startDate: '',
    expectedDuration: '3개월',
    meetingType: 'ONLINE',
    meetingFrequency: '주 2회',
    collaborationTools: [],
    compensationDescription: '',
    ownerGithub: '',
    ownerPortfolio: '',
    openChatUrl: ''
  });

  const [newTech, setNewTech] = useState({ category: 'FRONTEND' as TechCategory, technology: '' });
  const [newPosition, setNewPosition] = useState({
    positionName: '',
    requiredCount: 1,
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    responsibilities: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await projectService.getProjectBySlug(slug);

        if (!data) {
          toast.error('프로젝트를 찾을 수 없습니다.');
          navigate('/project');
          return;
        }

        // Check ownership
        // TODO: 백엔드 연동 후 활성화
        // if (data.owner.id !== user?.id) {
        //   toast.error('프로젝트를 수정할 권한이 없습니다.');
        //   navigate(`/project/${slug}`);
        //   return;
        // }

        setProject(data);

        // Set form data
        setFormData({
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          vision: data.vision || '',
          category: data.category || '',
          projectType: data.projectType,
          techStacks: data.techStacks.map(t => ({ category: t.category, technology: t.technology })),
          positions: data.positions.map(p => ({
            positionName: p.positionName,
            requiredCount: p.requiredCount,
            requiredSkills: p.requiredSkills,
            preferredSkills: p.preferredSkills,
            responsibilities: p.responsibilities
          })),
          recruitmentDeadline: data.recruitmentDeadline
            ? new Date(data.recruitmentDeadline).toISOString().split('T')[0]
            : '',
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split('T')[0]
            : '',
          expectedDuration: data.expectedDuration,
          meetingType: data.meetingType,
          meetingFrequency: data.meetingFrequency || '',
          collaborationTools: data.collaborationTools,
          compensationDescription: data.compensationDescription || '',
          ownerGithub: data.owner.github || '',
          ownerPortfolio: data.owner.portfolio || '',
          openChatUrl: data.owner.openChatUrl || ''
        });
      } catch (error: any) {
        toast.error(error.message || '프로젝트를 불러오는데 실패했습니다.');
        navigate('/project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [slug, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    // Validation
    if (!formData.name || !formData.tagline || !formData.description) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.positions.length === 0) {
      toast.error('최소 1개의 포지션을 추가해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const updatedProject = await projectService.updateProject(project.id, formData, user?.id || 'user-1');
      toast.success('프로젝트가 수정되었습니다!');
      navigate(`/project/${updatedProject.slug}`);
    } catch (error: any) {
      toast.error(error.message || '프로젝트 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const addTechStack = () => {
    if (!newTech.technology) return;
    setFormData({
      ...formData,
      techStacks: [...formData.techStacks, { ...newTech }]
    });
    setNewTech({ category: 'FRONTEND', technology: '' });
  };

  const removeTechStack = (index: number) => {
    setFormData({
      ...formData,
      techStacks: formData.techStacks.filter((_, i) => i !== index)
    });
  };

  const addSkillToPosition = () => {
    if (!newSkill) return;
    setNewPosition({
      ...newPosition,
      requiredSkills: [...newPosition.requiredSkills, newSkill]
    });
    setNewSkill('');
  };

  const addPreferredSkillToPosition = () => {
    if (!newPreferredSkill) return;
    setNewPosition({
      ...newPosition,
      preferredSkills: [...newPosition.preferredSkills, newPreferredSkill]
    });
    setNewPreferredSkill('');
  };

  const addPosition = () => {
    if (!newPosition.positionName || newPosition.requiredSkills.length === 0) {
      toast.error('포지션명과 필수 스킬을 입력해주세요.');
      return;
    }

    setFormData({
      ...formData,
      positions: [...formData.positions, { ...newPosition }]
    });

    setNewPosition({
      positionName: '',
      requiredCount: 1,
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: ''
    });
  };

  const removePosition = (index: number) => {
    setFormData({
      ...formData,
      positions: formData.positions.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className={styles['create-page']}>
        <div className={styles['container']}>
          <p style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className={styles['create-page']}>
      <div className={styles['container']}>
        <h1 className={styles['page-title']}>프로젝트 수정</h1>
        <p className={styles['page-subtitle']}>
          프로젝트 정보를 수정합니다
        </p>

        <form onSubmit={handleSubmit} className={styles['form']}>
          {/* Basic Info */}
          <div className={styles['section']}>
            <h2 className={styles['section-title']}>
              1. 기본 정보 <span className={styles['required']}>*</span>
            </h2>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']}>
                <label className={styles['label']}>
                  프로젝트명 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: AI 학습 도우미"
                  required
                />
              </div>

              <div className={styles['form-group-full']}>
                <label className={styles['label']}>
                  한 줄 소개 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="프로젝트를 한 문장으로 설명해주세요 (예: AI 기반 학습 관리 플랫폼)"
                  required
                />
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>
                  프로젝트 타입 <span className={styles['required']}>*</span>
                </label>
                <select
                  className={styles['select']}
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                >
                  <option value="SIDE_PROJECT">🚀 사이드 프로젝트</option>
                  <option value="STARTUP">💡 스타트업</option>
                  <option value="OPEN_SOURCE">🌐 오픈소스</option>
                </select>
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>모집 마감일</label>
                <input
                  type="date"
                  className={styles['input']}
                  value={formData.recruitmentDeadline}
                  onChange={(e) => setFormData({ ...formData, recruitmentDeadline: e.target.value })}
                />
              </div>

              <div className={styles['form-group-full']}>
                <label className={styles['label']}>
                  프로젝트 설명 <span className={styles['required']}>*</span>
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                  placeholder="프로젝트에 대해 자세히 설명해주세요..."
                  maxLength={2000}
                />
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className={styles['section']}>
            <h2 className={styles['section-title']}>
              2. 모집 포지션 <span className={styles['required']}>* 최소 1개</span>
            </h2>
            <div className={styles['position-form']}>
              <input
                type="text"
                className={styles['input']}
                value={newPosition.positionName}
                onChange={(e) => setNewPosition({ ...newPosition, positionName: e.target.value })}
                placeholder="포지션명 (예: Frontend Developer)"
              />
              <input
                type="number"
                className={styles['input-small']}
                value={newPosition.requiredCount}
                onChange={(e) => setNewPosition({ ...newPosition, requiredCount: parseInt(e.target.value) || 1 })}
                min="1"
              />
              <div className={styles['skills-input']}>
                <label>필수 스킬:</label>
                <input
                  type="text"
                  className={styles['input-small']}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="React"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToPosition())}
                />
                <button type="button" className={styles['add-button-sm']} onClick={addSkillToPosition}>+</button>
                <div className={styles['skill-tags']}>
                  {newPosition.requiredSkills.map((skill, i) => (
                    <span key={i} className={styles['skill-tag']}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => setNewPosition({ ...newPosition, requiredSkills: newPosition.requiredSkills.filter((_, idx) => idx !== i) })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles['skills-input']}>
                <label>우대 스킬:</label>
                <input
                  type="text"
                  className={styles['input-small']}
                  value={newPreferredSkill}
                  onChange={(e) => setNewPreferredSkill(e.target.value)}
                  placeholder="Next.js"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkillToPosition())}
                />
                <button type="button" className={styles['add-button-sm']} onClick={addPreferredSkillToPosition}>+</button>
                <div className={styles['skill-tags']}>
                  {newPosition.preferredSkills.map((skill, i) => (
                    <span key={i} className={styles['skill-tag']}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => setNewPosition({ ...newPosition, preferredSkills: newPosition.preferredSkills.filter((_, idx) => idx !== i) })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                className={styles['textarea']}
                value={newPosition.responsibilities}
                onChange={(e) => setNewPosition({ ...newPosition, responsibilities: e.target.value })}
                placeholder="주요 업무 설명"
                rows={3}
              />
              <button type="button" className={styles['add-button']} onClick={addPosition}>
                포지션 추가
              </button>
            </div>
            <div className={styles['positions-list']}>
              {formData.positions.map((pos, i) => (
                <div key={i} className={styles['position-item']}>
                  <div className={styles['position-header']}>
                    <strong>{pos.positionName}</strong> ({pos.requiredCount}명)
                    <button type="button" onClick={() => removePosition(i)}>×</button>
                  </div>
                  <div className={styles['position-skills']}>
                    필수: {pos.requiredSkills.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Details */}
          <div className={styles['section']}>
            <h2 className={styles['section-title']}>3. 추가 정보 (선택)</h2>
            <p className={styles['section-description']}>나중에 언제든지 수정할 수 있어요</p>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']}>
                <label className={styles['label']}>기술 스택</label>
                <div className={styles['add-item-form']}>
                  <select
                    className={styles['select-small']}
                    value={newTech.category}
                    onChange={(e) => setNewTech({ ...newTech, category: e.target.value as TechCategory })}
                  >
                    <option value="FRONTEND">프론트엔드</option>
                    <option value="BACKEND">백엔드</option>
                    <option value="DATABASE">데이터베이스</option>
                  </select>
                  <input
                    type="text"
                    className={styles['input-small']}
                    value={newTech.technology}
                    onChange={(e) => setNewTech({ ...newTech, technology: e.target.value })}
                    placeholder="React, Spring Boot 등"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                  />
                  <button type="button" className={styles['add-button']} onClick={addTechStack}>
                    +
                  </button>
                </div>
                <div className={styles['tags']}>
                  {formData.techStacks.map((tech, i) => (
                    <span key={i} className={styles['tag']}>
                      {tech.technology}
                      <button type="button" onClick={() => removeTechStack(i)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>시작 예정일</label>
                <input
                  type="date"
                  className={styles['input']}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>미팅 방식</label>
                <select
                  className={styles['select']}
                  value={formData.meetingType}
                  onChange={(e) => setFormData({ ...formData, meetingType: e.target.value as MeetingType })}
                >
                  <option value="ONLINE">온라인</option>
                  <option value="OFFLINE">오프라인</option>
                  <option value="HYBRID">온/오프라인 병행</option>
                </select>
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>협업 도구</label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.collaborationTools.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    collaborationTools: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="Slack, Notion, GitHub (쉼표로 구분)"
                />
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>
                  오픈 카톡 링크 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="url"
                  className={styles['input']}
                  value={formData.openChatUrl}
                  onChange={(e) => setFormData({ ...formData, openChatUrl: e.target.value })}
                  placeholder="https://open.kakao.com/o/..."
                  required
                />
                <small style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                  프로젝트에 관심 있는 분들이 이 링크로 연락합니다
                </small>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className={styles['submit-section']}>
            <button
              type="button"
              className={styles['cancel-button']}
              onClick={() => navigate(`/project/${project.slug}`)}
              disabled={submitting}
            >
              취소
            </button>
            <button type="submit" className={styles['submit-button']} disabled={submitting}>
              {submitting ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditPage;

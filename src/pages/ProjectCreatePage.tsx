import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../api/projectService';
import type { ProjectFormData, ProjectType, MeetingType, TechCategory } from '../types/project';
import styles from './ProjectCreatePage.module.css';

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    ownerPortfolio: ''
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
  const [newTool, setNewTool] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const project = await projectService.createProject(formData, user?.id || 'user-1');
      toast.success('프로젝트가 등록되었습니다!');
      navigate(`/project/${project.slug}`);
    } catch (error: any) {
      toast.error(error.message || '프로젝트 등록에 실패했습니다.');
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

  const addTool = () => {
    if (!newTool) return;
    setFormData({
      ...formData,
      collaborationTools: [...formData.collaborationTools, newTool]
    });
    setNewTool('');
  };

  const removeTool = (index: number) => {
    setFormData({
      ...formData,
      collaborationTools: formData.collaborationTools.filter((_, i) => i !== index)
    });
  };

  return (
    <div className={styles['create-page']}>
      <div className={styles['container']}>
        <h1 className={styles['page-title']}>프로젝트 등록</h1>
        <p className={styles['page-subtitle']}>
          함께 만들어갈 프로젝트를 등록하고 팀원을 모집하세요
        </p>

        <form onSubmit={handleSubmit} className={styles['form']}>
          {/* Basic Info */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>기본 정보</h2>
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

              <div className={styles['form-group']}>
                <label className={styles['label']}>
                  한 줄 소개 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="프로젝트를 한 문장으로 설명해주세요"
                  required
                />
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>프로젝트 타입</label>
                <select
                  className={styles['select']}
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                >
                  <option value="SIDE_PROJECT">사이드 프로젝트</option>
                  <option value="STARTUP">스타트업</option>
                  <option value="OPEN_SOURCE">오픈소스</option>
                </select>
              </div>

              <div className={styles['form-group']}>
                <label className={styles['label']}>카테고리</label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="예: EdTech, FinTech, SaaS"
                />
              </div>

              <div className={styles['form-group-full']}>
                <label className={styles['label']}>
                  프로젝트 설명 <span className={styles['required']}>*</span>
                </label>
                <textarea
                  className={styles['textarea']}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="프로젝트에 대해 자세히 설명해주세요"
                  rows={6}
                  required
                />
              </div>

              <div className={styles['form-group-full']}>
                <label className={styles['label']}>비전 & 목표</label>
                <textarea
                  className={styles['textarea']}
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  placeholder="이 프로젝트를 통해 이루고자 하는 것은 무엇인가요?"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>기술 스택</h2>
            <div className={styles['add-item-form']}>
              <select
                className={styles['select-small']}
                value={newTech.category}
                onChange={(e) => setNewTech({ ...newTech, category: e.target.value as TechCategory })}
              >
                <option value="FRONTEND">프론트엔드</option>
                <option value="BACKEND">백엔드</option>
                <option value="DATABASE">데이터베이스</option>
                <option value="DEVOPS">DevOps</option>
                <option value="MOBILE">모바일</option>
                <option value="DESIGN">디자인</option>
                <option value="ETC">기타</option>
              </select>
              <input
                type="text"
                className={styles['input-small']}
                value={newTech.technology}
                onChange={(e) => setNewTech({ ...newTech, technology: e.target.value })}
                placeholder="예: React, Spring Boot"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
              />
              <button type="button" className={styles['add-button']} onClick={addTechStack}>
                추가
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
          </section>

          {/* Positions */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>
              모집 포지션 <span className={styles['required']}>*</span>
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
          </section>

          {/* Schedule */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>일정</h2>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']}>
                <label className={styles['label']}>모집 마감일</label>
                <input
                  type="date"
                  className={styles['input']}
                  value={formData.recruitmentDeadline}
                  onChange={(e) => setFormData({ ...formData, recruitmentDeadline: e.target.value })}
                />
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
                <label className={styles['label']}>예상 기간</label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.expectedDuration}
                  onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
                  placeholder="3개월, 6개월, 지속적"
                />
              </div>
            </div>
          </section>

          {/* Collaboration */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>협업 방식</h2>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']}>
                <label className={styles['label']}>미팅 방식</label>
                <select
                  className={styles['select']}
                  value={formData.meetingType}
                  onChange={(e) => setFormData({ ...formData, meetingType: e.target.value as MeetingType })}
                >
                  <option value="ONLINE">온라인</option>
                  <option value="OFFLINE">오프라인</option>
                  <option value="HYBRID">하이브리드</option>
                </select>
              </div>
              <div className={styles['form-group']}>
                <label className={styles['label']}>미팅 빈도</label>
                <input
                  type="text"
                  className={styles['input']}
                  value={formData.meetingFrequency}
                  onChange={(e) => setFormData({ ...formData, meetingFrequency: e.target.value })}
                  placeholder="주 2회, 주말만, 자율"
                />
              </div>
              <div className={styles['form-group-full']}>
                <label className={styles['label']}>협업 도구</label>
                <div className={styles['add-item-form']}>
                  <input
                    type="text"
                    className={styles['input']}
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="Slack, Notion, GitHub 등"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                  />
                  <button type="button" className={styles['add-button']} onClick={addTool}>
                    추가
                  </button>
                </div>
                <div className={styles['tags']}>
                  {formData.collaborationTools.map((tool, i) => (
                    <span key={i} className={styles['tag']}>
                      {tool}
                      <button type="button" onClick={() => removeTool(i)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>보상 & 혜택</h2>
            <textarea
              className={styles['textarea']}
              value={formData.compensationDescription}
              onChange={(e) => setFormData({ ...formData, compensationDescription: e.target.value })}
              placeholder="예: 무료 / 포트폴리오 활용 가능&#10;예: 지분 배분 협의 / 초기 멤버 우대&#10;예: 시급 2만원 / 주 10시간"
              rows={4}
            />
          </section>

          {/* Owner Info */}
          <section className={styles['section']}>
            <h2 className={styles['section-title']}>주최자 정보</h2>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']}>
                <label className={styles['label']}>GitHub</label>
                <input
                  type="url"
                  className={styles['input']}
                  value={formData.ownerGithub}
                  onChange={(e) => setFormData({ ...formData, ownerGithub: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className={styles['form-group']}>
                <label className={styles['label']}>Portfolio</label>
                <input
                  type="url"
                  className={styles['input']}
                  value={formData.ownerPortfolio}
                  onChange={(e) => setFormData({ ...formData, ownerPortfolio: e.target.value })}
                  placeholder="https://portfolio.com"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className={styles['submit-section']}>
            <button
              type="button"
              className={styles['cancel-button']}
              onClick={() => navigate('/project')}
              disabled={submitting}
            >
              취소
            </button>
            <button type="submit" className={styles['submit-button']} disabled={submitting}>
              {submitting ? '등록 중...' : '프로젝트 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreatePage;

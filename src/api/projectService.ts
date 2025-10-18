import type {
  Project,
  ProjectFormData,
  ProjectApplication,
  ProjectFilters,
  Position,
  TechStack,
  ProjectType,
  ProjectStatus,
  ApplicationStatus,
  TechCategory,
  MeetingType
} from '../types/project';
import { getProjectThemeByType } from '../types/project';

// Mock data storage (localStorage)
const STORAGE_KEY = 'asyncsite_projects';
const APPLICATIONS_KEY = 'asyncsite_project_applications';

// Helper: Generate UUID
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper: Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
};

// Helper: Load projects from localStorage
const loadProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getMockProjects();

  try {
    const projects = JSON.parse(stored);
    // Parse dates
    return projects.map((p: any) => ({
      ...p,
      recruitmentDeadline: p.recruitmentDeadline ? new Date(p.recruitmentDeadline) : null,
      startDate: p.startDate ? new Date(p.startDate) : null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  } catch {
    return getMockProjects();
  }
};

// Helper: Save projects to localStorage
const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

// Helper: Load applications from localStorage
const loadApplications = (): ProjectApplication[] => {
  const stored = localStorage.getItem(APPLICATIONS_KEY);
  if (!stored) return [];

  try {
    const applications = JSON.parse(stored);
    return applications.map((app: any) => ({
      ...app,
      appliedAt: new Date(app.appliedAt),
      reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined
    }));
  } catch {
    return [];
  }
};

// Helper: Save applications to localStorage
const saveApplications = (applications: ProjectApplication[]): void => {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
};

// Mock Projects Data
const getMockProjects = (): Project[] => {
  const projects: Project[] = [
    {
      id: generateId(),
      slug: 'ai-study-helper',
      name: 'AI 학습 도우미',
      tagline: 'AI를 활용한 개인 맞춤형 학습 관리 플랫폼',
      description: `대학생과 직장인을 위한 AI 기반 학습 관리 플랫폼을 개발합니다.

사용자의 학습 패턴을 분석하고, 최적의 학습 계획을 추천하며, 학습 진도를 추적합니다.

주요 기능:
- AI 학습 플랜 생성
- 학습 진도 트래킹
- 스터디 그룹 매칭
- 학습 통계 및 분석`,
      vision: '모든 사람이 효율적으로 학습할 수 있는 세상을 만듭니다.',
      category: 'EdTech',
      projectType: 'SIDE_PROJECT',
      status: 'RECRUITING',
      totalCapacity: 6,
      currentMembers: 2,
      recruitmentDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      expectedDuration: '3개월',
      meetingType: 'HYBRID',
      meetingFrequency: '주 2회 (화, 목)',
      collaborationTools: ['Slack', 'Notion', 'Figma', 'GitHub'],
      compensationDescription: '무료 / 포트폴리오 활용 가능 / 우수 기여자 추천서 제공',
      positions: [
        {
          id: generateId(),
          positionName: 'Frontend Developer',
          requiredCount: 2,
          currentCount: 1,
          requiredSkills: ['React', 'TypeScript', 'CSS'],
          preferredSkills: ['Next.js', 'Tailwind CSS', 'React Query'],
          responsibilities: '사용자 인터페이스 개발, 컴포넌트 설계, API 연동'
        },
        {
          id: generateId(),
          positionName: 'Backend Developer',
          requiredCount: 2,
          currentCount: 1,
          requiredSkills: ['Java', 'Spring Boot', 'MySQL'],
          preferredSkills: ['JPA', 'Redis', 'AWS'],
          responsibilities: 'RESTful API 설계 및 개발, 데이터베이스 설계, 인프라 구축'
        },
        {
          id: generateId(),
          positionName: 'AI/ML Engineer',
          requiredCount: 1,
          currentCount: 0,
          requiredSkills: ['Python', 'TensorFlow', 'ML 기초'],
          preferredSkills: ['PyTorch', 'NLP', 'LangChain'],
          responsibilities: '학습 추천 알고리즘 개발, AI 모델 학습 및 배포'
        },
        {
          id: generateId(),
          positionName: 'UI/UX Designer',
          requiredCount: 1,
          currentCount: 0,
          requiredSkills: ['Figma', 'UI/UX 디자인'],
          preferredSkills: ['Prototype', '사용자 리서치'],
          responsibilities: 'UI/UX 디자인, 프로토타입 제작, 사용성 테스트'
        }
      ],
      techStacks: [
        { id: generateId(), category: 'FRONTEND', technology: 'React' },
        { id: generateId(), category: 'FRONTEND', technology: 'TypeScript' },
        { id: generateId(), category: 'FRONTEND', technology: 'Next.js' },
        { id: generateId(), category: 'BACKEND', technology: 'Spring Boot' },
        { id: generateId(), category: 'BACKEND', technology: 'Python' },
        { id: generateId(), category: 'DATABASE', technology: 'MySQL' },
        { id: generateId(), category: 'DATABASE', technology: 'Redis' },
        { id: generateId(), category: 'DEVOPS', technology: 'Docker' },
        { id: generateId(), category: 'DEVOPS', technology: 'AWS' }
      ],
      owner: {
        id: 'user-1',
        name: '김개발',
        email: 'kim@example.com',
        github: 'https://github.com/kimdev',
        portfolio: 'https://kimdev.portfolio.com',
        profileImage: '/avatars/avatar-1.svg',
        openChatUrl: 'https://open.kakao.com/o/ai-study-helper'
      },
      views: 245,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      color: { primary: '#D4F1A8', glow: 'rgba(212, 241, 168, 0.25)' }
    },
    {
      id: generateId(),
      slug: 'blockchain-voting',
      name: '블록체인 투표 시스템',
      tagline: '투명하고 안전한 온라인 투표 플랫폼',
      description: `블록체인 기술을 활용한 탈중앙화 투표 시스템을 구축합니다.

투표의 투명성과 보안성을 보장하며, 실시간 개표 결과를 제공합니다.

주요 기능:
- 블록체인 기반 투표 저장
- 실시간 개표 현황
- 투표자 익명성 보장
- 부정 투표 방지`,
      vision: '기술로 민주주의를 더 투명하고 안전하게',
      category: 'Blockchain',
      projectType: 'STARTUP',
      status: 'RECRUITING',
      totalCapacity: 8,
      currentMembers: 3,
      recruitmentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      expectedDuration: '6개월',
      meetingType: 'ONLINE',
      meetingFrequency: '주 3회 (월, 수, 금)',
      collaborationTools: ['Discord', 'Notion', 'GitHub', 'Miro'],
      compensationDescription: '초기 지분 배분 협의 / 성공 시 스톡옵션 제공',
      positions: [
        {
          id: generateId(),
          positionName: 'Blockchain Developer',
          requiredCount: 2,
          currentCount: 1,
          requiredSkills: ['Solidity', 'Ethereum', 'Web3.js'],
          preferredSkills: ['Hardhat', 'IPFS', 'Chainlink'],
          responsibilities: '스마트 컨트랙트 개발, 블록체인 인프라 구축'
        },
        {
          id: generateId(),
          positionName: 'Full-stack Developer',
          requiredCount: 3,
          currentCount: 2,
          requiredSkills: ['React', 'Node.js', 'TypeScript'],
          preferredSkills: ['GraphQL', 'MongoDB', 'AWS'],
          responsibilities: '프론트엔드 및 백엔드 개발, Web3 통합'
        },
        {
          id: generateId(),
          positionName: 'Security Engineer',
          requiredCount: 1,
          currentCount: 0,
          requiredSkills: ['보안 기초', '암호학', 'Penetration Testing'],
          preferredSkills: ['Smart Contract Audit', 'Bug Bounty'],
          responsibilities: '보안 감사, 취약점 분석, 보안 테스트'
        },
        {
          id: generateId(),
          positionName: 'Product Manager',
          requiredCount: 1,
          currentCount: 0,
          requiredSkills: ['Product Management', '기획', '커뮤니케이션'],
          preferredSkills: ['Blockchain 지식', 'Agile'],
          responsibilities: '제품 기획, 요구사항 정의, 프로젝트 관리'
        }
      ],
      techStacks: [
        { id: generateId(), category: 'BACKEND', technology: 'Solidity' },
        { id: generateId(), category: 'BACKEND', technology: 'Ethereum' },
        { id: generateId(), category: 'BACKEND', technology: 'Node.js' },
        { id: generateId(), category: 'FRONTEND', technology: 'React' },
        { id: generateId(), category: 'FRONTEND', technology: 'Web3.js' },
        { id: generateId(), category: 'DATABASE', technology: 'MongoDB' },
        { id: generateId(), category: 'DEVOPS', technology: 'AWS' }
      ],
      owner: {
        id: 'user-2',
        name: '박블록',
        email: 'park@example.com',
        github: 'https://github.com/parkblock',
        profileImage: '/avatars/avatar-2.svg',
        openChatUrl: 'https://open.kakao.com/o/blockchain-voting'
      },
      views: 512,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: { primary: '#FFB59A', glow: 'rgba(255, 181, 154, 0.25)' }
    },
    {
      id: generateId(),
      slug: 'opensource-cms',
      name: 'Open CMS',
      tagline: '개발자를 위한 오픈소스 CMS 플랫폼',
      description: `개발자 친화적인 오픈소스 CMS를 만듭니다.

Markdown 지원, Git 기반 버전 관리, 플러그인 시스템을 제공합니다.

주요 기능:
- Markdown 에디터
- Git 기반 컨텐츠 관리
- 플러그인 아키텍처
- RESTful API 제공`,
      vision: '개발자가 사랑하는 CMS를 만들자',
      category: 'Developer Tools',
      projectType: 'OPEN_SOURCE',
      status: 'IN_PROGRESS',
      currentMembers: 12,
      recruitmentDeadline: null,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expectedDuration: '지속적',
      meetingType: 'ONLINE',
      meetingFrequency: '자율 참여',
      collaborationTools: ['GitHub', 'Discord', 'Notion'],
      compensationDescription: '무료 / 오픈소스 기여 경험 / 커뮤니티 구축',
      positions: [
        {
          id: generateId(),
          positionName: 'Core Contributor',
          requiredCount: 0,
          currentCount: 5,
          requiredSkills: ['TypeScript', 'React', 'Node.js'],
          preferredSkills: ['Plugin Architecture', 'CMS 경험'],
          responsibilities: '코어 기능 개발, 아키텍처 설계, 코드 리뷰'
        },
        {
          id: generateId(),
          positionName: 'Plugin Developer',
          requiredCount: 0,
          currentCount: 4,
          requiredSkills: ['JavaScript', 'Plugin 개발'],
          preferredSkills: ['TypeScript', 'npm 배포'],
          responsibilities: '플러그인 개발, 문서화, 샘플 제작'
        },
        {
          id: generateId(),
          positionName: 'Documentation Writer',
          requiredCount: 0,
          currentCount: 3,
          requiredSkills: ['기술 문서 작성', '영어'],
          preferredSkills: ['Markdown', 'Docusaurus'],
          responsibilities: '사용자 가이드 작성, API 문서화, 튜토리얼 제작'
        }
      ],
      techStacks: [
        { id: generateId(), category: 'FRONTEND', technology: 'React' },
        { id: generateId(), category: 'FRONTEND', technology: 'TypeScript' },
        { id: generateId(), category: 'BACKEND', technology: 'Node.js' },
        { id: generateId(), category: 'DATABASE', technology: 'PostgreSQL' },
        { id: generateId(), category: 'ETC', technology: 'Git' }
      ],
      owner: {
        id: 'user-3',
        name: '이오픈',
        email: 'lee@example.com',
        github: 'https://github.com/leeopen',
        portfolio: 'https://leeopen.dev',
        profileImage: '/avatars/avatar-3.svg',
        openChatUrl: 'https://open.kakao.com/o/opensource-cms'
      },
      views: 1024,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      color: { primary: '#A8C5FF', glow: 'rgba(168, 197, 255, 0.25)' }
    }
  ];

  // Save to localStorage
  saveProjects(projects);
  return projects;
};

// Service Methods
const projectService = {
  // Get all projects
  getAllProjects: async (filters?: ProjectFilters): Promise<Project[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

    let projects = loadProjects();

    // Apply filters
    if (filters) {
      if (filters.projectType) {
        projects = projects.filter((p) => p.projectType === filters.projectType);
      }
      if (filters.status) {
        projects = projects.filter((p) => p.status === filters.status);
      }
      if (filters.techStacks && filters.techStacks.length > 0) {
        projects = projects.filter((p) =>
          filters.techStacks!.some((tech) =>
            p.techStacks.some((t) => t.technology.toLowerCase().includes(tech.toLowerCase()))
          )
        );
      }
      if (filters.meetingType) {
        projects = projects.filter((p) => p.meetingType === filters.meetingType);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        projects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.tagline.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
      }
    }

    return projects;
  },

  // Get project by slug
  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const projects = loadProjects();
    const project = projects.find((p) => p.slug === slug);

    if (project) {
      // Increment views
      project.views += 1;
      saveProjects(projects);
    }

    return project || null;
  },

  // Create project
  createProject: async (formData: ProjectFormData, userId: string): Promise<Project> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const projects = loadProjects();
    const newProject: Project = {
      id: generateId(),
      slug: generateSlug(formData.name),
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      vision: formData.vision,
      category: formData.category,
      projectType: formData.projectType,
      status: 'RECRUITING',
      totalCapacity: formData.positions.reduce((sum, p) => sum + p.requiredCount, 0),
      currentMembers: 1,
      recruitmentDeadline: formData.recruitmentDeadline
        ? new Date(formData.recruitmentDeadline)
        : null,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      expectedDuration: formData.expectedDuration,
      meetingType: formData.meetingType,
      meetingFrequency: formData.meetingFrequency,
      collaborationTools: formData.collaborationTools,
      compensationDescription: formData.compensationDescription,
      positions: formData.positions.map((p) => ({
        id: generateId(),
        positionName: p.positionName,
        requiredCount: p.requiredCount,
        currentCount: 0,
        requiredSkills: p.requiredSkills,
        preferredSkills: p.preferredSkills,
        responsibilities: p.responsibilities
      })),
      techStacks: formData.techStacks.map((t) => ({
        id: generateId(),
        category: t.category,
        technology: t.technology
      })),
      owner: {
        id: userId,
        name: '사용자', // Should come from auth context
        email: 'user@example.com',
        github: formData.ownerGithub,
        portfolio: formData.ownerPortfolio,
        openChatUrl: formData.openChatUrl
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      color: {
        primary: getProjectThemeByType(formData.projectType).primary,
        glow: getProjectThemeByType(formData.projectType).glow
      }
    };

    projects.push(newProject);
    saveProjects(projects);

    return newProject;
  },

  // Apply to project
  applyToProject: async (
    projectId: string,
    positionId: string,
    userId: string,
    applicationData: {
      introduction: string;
      motivation: string;
      githubUrl?: string;
      portfolioUrl?: string;
      resumeUrl?: string;
    }
  ): Promise<ProjectApplication> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const applications = loadApplications();

    // Check if already applied
    const existing = applications.find(
      (app) =>
        app.projectId === projectId &&
        app.positionId === positionId &&
        app.userId === userId &&
        app.status !== 'WITHDRAWN'
    );

    if (existing) {
      throw new Error('이미 지원한 포지션입니다.');
    }

    const newApplication: ProjectApplication = {
      id: generateId(),
      projectId,
      positionId,
      userId,
      status: 'PENDING',
      introduction: applicationData.introduction,
      motivation: applicationData.motivation,
      githubUrl: applicationData.githubUrl,
      portfolioUrl: applicationData.portfolioUrl,
      resumeUrl: applicationData.resumeUrl,
      appliedAt: new Date()
    };

    applications.push(newApplication);
    saveApplications(applications);

    return newApplication;
  },

  // Get my applications
  getMyApplications: async (userId: string): Promise<ProjectApplication[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const applications = loadApplications();
    return applications.filter((app) => app.userId === userId);
  },

  // Get applications for a project
  getProjectApplications: async (
    projectId: string,
    positionId?: string
  ): Promise<ProjectApplication[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const applications = loadApplications();
    return applications.filter(
      (app) => app.projectId === projectId && (!positionId || app.positionId === positionId)
    );
  }
};

export default projectService;

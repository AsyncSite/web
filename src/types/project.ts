// Project Types and Interfaces

export const ProjectType = {
  SIDE_PROJECT: 'SIDE_PROJECT',
  STARTUP: 'STARTUP',
  OPEN_SOURCE: 'OPEN_SOURCE'
} as const;

export type ProjectType = typeof ProjectType[keyof typeof ProjectType];

export const ProjectStatus = {
  DRAFT: 'DRAFT',
  RECRUITING: 'RECRUITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const TechCategory = {
  FRONTEND: 'FRONTEND',
  BACKEND: 'BACKEND',
  DATABASE: 'DATABASE',
  DEVOPS: 'DEVOPS',
  MOBILE: 'MOBILE',
  DESIGN: 'DESIGN',
  ETC: 'ETC'
} as const;

export type TechCategory = typeof TechCategory[keyof typeof TechCategory];

export const MeetingType = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  HYBRID: 'HYBRID'
} as const;

export type MeetingType = typeof MeetingType[keyof typeof MeetingType];

// Position Interface
export interface Position {
  id: string;
  positionName: string;
  requiredCount: number;
  currentCount: number;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string;
}

// Tech Stack Interface
export interface TechStack {
  id: string;
  category: TechCategory;
  technology: string;
}

// Project Owner Interface
export interface ProjectOwner {
  id: string;
  name: string;
  email: string;
  github?: string;
  portfolio?: string;
  profileImage?: string;
}

// Project Interface
export interface Project {
  id: string;
  slug: string;

  // Basic Info
  name: string;
  tagline: string;
  description: string;
  vision?: string;
  category?: string;

  // Type & Status
  projectType: ProjectType;
  status: ProjectStatus;

  // Recruitment Info
  totalCapacity?: number;
  currentMembers: number;
  recruitmentDeadline: Date | null;

  // Schedule Info
  startDate?: Date | null;
  expectedDuration: string;

  // Collaboration Info
  meetingType: MeetingType;
  meetingFrequency?: string;
  collaborationTools: string[];

  // Compensation
  compensationDescription?: string;

  // Relations
  positions: Position[];
  techStacks: TechStack[];
  owner: ProjectOwner;

  // Meta
  views: number;
  createdAt: Date;
  updatedAt: Date;

  // UI helpers
  color: {
    primary: string;
    glow: string;
  };
}

// Application Interface
export interface ProjectApplication {
  id: string;
  projectId: string;
  positionId: string;
  userId: string;
  status: ApplicationStatus;

  // Application Content
  introduction: string;
  motivation: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;

  // Meta
  appliedAt: Date;
  reviewedAt?: Date;
}

// Form Data Types
export interface ProjectFormData {
  // Step 1: Basic Info
  name: string;
  tagline: string;
  description: string;
  vision: string;
  category: string;
  projectType: ProjectType;

  // Step 2: Tech Stack
  techStacks: Array<{ category: TechCategory; technology: string }>;

  // Step 3: Positions
  positions: Array<{
    positionName: string;
    requiredCount: number;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string;
  }>;

  // Step 4: Schedule
  recruitmentDeadline: string;
  startDate: string;
  expectedDuration: string;
  meetingType: MeetingType;
  meetingFrequency: string;
  collaborationTools: string[];

  // Step 5: Compensation
  compensationDescription: string;

  // Step 6: Owner Info
  ownerGithub: string;
  ownerPortfolio: string;
}

// Filter Types
export interface ProjectFilters {
  projectType?: ProjectType;
  status?: ProjectStatus;
  techStacks?: string[];
  meetingType?: MeetingType;
  searchQuery?: string;
}

// Helper: Get project type label
export const getProjectTypeLabel = (type: ProjectType): string => {
  const labels: Record<ProjectType, string> = {
    SIDE_PROJECT: '사이드 프로젝트',
    STARTUP: '스타트업',
    OPEN_SOURCE: '오픈소스'
  };
  return labels[type];
};

// Helper: Get project status label
export const getProjectStatusLabel = (status: ProjectStatus): string => {
  const labels: Record<ProjectStatus, string> = {
    DRAFT: '임시저장',
    RECRUITING: '모집중',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소됨'
  };
  return labels[status];
};

// Helper: Get meeting type label
export const getMeetingTypeLabel = (type: MeetingType): string => {
  const labels: Record<MeetingType, string> = {
    ONLINE: '온라인',
    OFFLINE: '오프라인',
    HYBRID: '하이브리드'
  };
  return labels[type];
};

// Helper: Get tech category label
export const getTechCategoryLabel = (category: TechCategory): string => {
  const labels: Record<TechCategory, string> = {
    FRONTEND: '프론트엔드',
    BACKEND: '백엔드',
    DATABASE: '데이터베이스',
    DEVOPS: 'DevOps',
    MOBILE: '모바일',
    DESIGN: '디자인',
    ETC: '기타'
  };
  return labels[category];
};

// Helper: Calculate D-day
export const calculateDday = (deadline: Date | null): string | null => {
  if (!deadline) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(deadline);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return '마감';
  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
};

// Helper: Get project theme color
export const getProjectTheme = (id: string) => {
  const themes = [
    { primary: '#C3E88D', glow: 'rgba(195, 232, 141, 0.3)' },
    { primary: '#82AAFF', glow: 'rgba(130, 170, 255, 0.3)' },
    { primary: '#F78C6C', glow: 'rgba(247, 140, 108, 0.3)' },
    { primary: '#C792EA', glow: 'rgba(199, 146, 234, 0.3)' },
    { primary: '#FFCB6B', glow: 'rgba(255, 203, 107, 0.3)' }
  ];

  const hash = id.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return themes[Math.abs(hash) % themes.length];
};

import publicApiClient, { handlePublicApiError } from './publicClient';
import apiClient from './client';
import type {
  Project,
  ProjectFormData,
  ProjectApplication,
  ProjectFilters,
  ProjectType,
  ProjectStatus,
  ApplicationStatus,
  TechCategory,
  MeetingType
} from '../types/project';
import { getProjectThemeByType } from '../types/project';

// Backend DTO types
interface ProjectDTO {
  projectId: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  vision?: string;
  category: string;
  projectType: ProjectType;
  status: ProjectStatus;
  totalCapacity?: number;
  currentMembers?: number;
  recruitmentDeadline?: string | number[];
  startDate?: string | number[];
  expectedDuration?: string;
  meetingType?: MeetingType;
  meetingFrequency?: string;
  collaborationTools?: string[];
  compensationDescription?: string;
  positions: PositionDTO[];
  techStacks: TechStackDTO[];
  owner: OwnerDTO;
  ownerId: string;
  views: number;
  createdAt: string | number[];
  updatedAt: string | number[];
  color?: { primary: string; glow: string };
}

interface OwnerDTO {
  name: string;
  email: string;
  profileImage?: string;
  github?: string;
  portfolio?: string;
  openChatUrl?: string;
}

interface PositionDTO {
  positionId: string;
  positionName: string;
  requiredCount: number;
  currentCount: number;
  requiredSkills: string[];
  preferredSkills?: string[];
  responsibilities?: string;
}

interface TechStackDTO {
  techStackId: string;
  category: TechCategory;
  technology: string;
}

// Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Utility: Parse backend date format
const parseDate = (date: string | number[] | null | undefined): Date | null => {
  if (!date) return null;

  if (Array.isArray(date)) {
    // Backend LocalDateTime format: [year, month, day, hour, minute, second, nano]
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    return new Date(year, month - 1, day, hour, minute, second);
  }

  return new Date(date);
};

// DTO to Domain mapper
const mapDtoToProject = (dto: ProjectDTO): Project => {
  return {
    projectId: dto.projectId,
    slug: dto.slug,
    name: dto.name,
    tagline: dto.tagline,
    description: dto.description,
    vision: dto.vision,
    category: dto.category,
    projectType: dto.projectType,
    status: dto.status,
    totalCapacity: dto.totalCapacity,
    currentMembers: dto.currentMembers ?? 0,
    recruitmentDeadline: parseDate(dto.recruitmentDeadline),
    startDate: parseDate(dto.startDate),
    expectedDuration: dto.expectedDuration ?? '',
    meetingType: dto.meetingType ?? 'ONLINE',
    meetingFrequency: dto.meetingFrequency,
    collaborationTools: dto.collaborationTools ?? [],
    compensationDescription: dto.compensationDescription,
    positions: dto.positions.map(p => ({
      positionId: p.positionId,
      positionName: p.positionName,
      requiredCount: p.requiredCount,
      currentCount: p.currentCount,
      requiredSkills: p.requiredSkills,
      preferredSkills: p.preferredSkills ?? [],
      responsibilities: p.responsibilities ?? ''
    })),
    techStacks: dto.techStacks.map(t => ({
      techStackId: t.techStackId,
      category: t.category,
      technology: t.technology
    })),
    owner: {
      name: dto.owner.name,
      email: dto.owner.email,
      profileImage: dto.owner.profileImage,
      github: dto.owner.github,
      portfolio: dto.owner.portfolio,
      openChatUrl: dto.owner.openChatUrl
    },
    ownerId: dto.ownerId,
    views: dto.views,
    createdAt: parseDate(dto.createdAt) || new Date(),
    updatedAt: parseDate(dto.updatedAt) || new Date(),
    color: dto.color || {
      primary: getProjectThemeByType(dto.projectType).primary,
      glow: getProjectThemeByType(dto.projectType).glow
    }
  };
};

// Service Methods
const projectService = {
  // Get all projects
  getAllProjects: async (filters?: ProjectFilters): Promise<Project[]> => {
    try {
      const params = new URLSearchParams();

      if (filters?.projectType) {
        params.append('projectType', filters.projectType);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.meetingType) {
        params.append('meetingType', filters.meetingType);
      }
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }

      const url = `/api/projects${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await publicApiClient.get<ApiResponse<ProjectDTO[]>>(url);

      if (response.data.success && response.data.data) {
        let projects = response.data.data.map(mapDtoToProject);

        // Client-side filtering for tech stacks (if backend doesn't support)
        if (filters?.techStacks && filters.techStacks.length > 0) {
          projects = projects.filter((p) =>
            filters.techStacks!.some((tech) =>
              p.techStacks.some((t) => t.technology.toLowerCase().includes(tech.toLowerCase()))
            )
          );
        }

        return projects;
      }

      return [];
    } catch (error) {
      throw handlePublicApiError(error);
    }
  },

  // Get project by slug
  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    try {
      const response = await publicApiClient.get<ApiResponse<ProjectDTO>>(`/api/projects/slug/${slug}`);

      if (response.data.success && response.data.data) {
        return mapDtoToProject(response.data.data);
      }

      return null;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw handlePublicApiError(error);
    }
  },

  // Create project
  createProject: async (formData: ProjectFormData, userId: string): Promise<Project> => {
    try {
      const requestBody = {
        // slug는 백엔드에서 name으로 자동 생성
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        vision: formData.vision,
        category: formData.category,
        projectType: formData.projectType,
        recruitmentDeadline: formData.recruitmentDeadline
          ? new Date(formData.recruitmentDeadline).toISOString()
          : null,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        expectedDuration: formData.expectedDuration,
        meetingType: formData.meetingType,
        meetingFrequency: formData.meetingFrequency,
        collaborationTools: formData.collaborationTools,
        compensationDescription: formData.compensationDescription,
        ownerGithub: formData.ownerGithub,
        ownerPortfolio: formData.ownerPortfolio,
        openChatUrl: formData.openChatUrl,
        positions: formData.positions.map(p => ({
          positionName: p.positionName,
          requiredCount: p.requiredCount,
          requiredSkills: p.requiredSkills,
          preferredSkills: p.preferredSkills,
          responsibilities: p.responsibilities
        })),
        techStacks: formData.techStacks.map(t => ({
          category: t.category,
          technology: t.technology
        }))
      };

      const response = await apiClient.post<ApiResponse<{ projectId: string }>>(
        '/api/projects',
        requestBody
      );

      if (response.data.success && response.data.data) {
        const projectId = response.data.data.projectId;

        // 생성된 프로젝트의 기본 정보만 반환 (slug는 projectId 사용)
        // 상세 정보는 프로젝트 상세 페이지에서 다시 조회
        return {
          projectId,
          slug: projectId, // slug 대신 projectId 사용
          name: formData.name,
          tagline: formData.tagline,
          description: formData.description,
          vision: formData.vision,
          category: formData.category || '',
          projectType: formData.projectType,
          status: 'RECRUITING' as const,
          totalCapacity: 0,
          currentMembers: 0,
          recruitmentDeadline: formData.recruitmentDeadline ? new Date(formData.recruitmentDeadline) : null,
          startDate: formData.startDate ? new Date(formData.startDate) : null,
          expectedDuration: formData.expectedDuration || '',
          meetingType: formData.meetingType || 'ONLINE',
          meetingFrequency: formData.meetingFrequency,
          collaborationTools: formData.collaborationTools || [],
          compensationDescription: formData.compensationDescription,
          positions: formData.positions.map((p, i) => ({
            positionId: `temp-${i}`,
            positionName: p.positionName,
            requiredCount: p.requiredCount,
            currentCount: 0,
            requiredSkills: p.requiredSkills,
            preferredSkills: p.preferredSkills,
            responsibilities: p.responsibilities
          })),
          techStacks: formData.techStacks.map((t, i) => ({
            techStackId: `temp-${i}`,
            category: t.category,
            technology: t.technology
          })),
          owner: {
            name: '',
            email: '',
            profileImage: undefined,
            github: formData.ownerGithub,
            portfolio: formData.ownerPortfolio,
            openChatUrl: formData.openChatUrl
          },
          ownerId: userId,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          color: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' }
        };
      }

      throw new Error('프로젝트 생성에 실패했습니다.');
    } catch (error: any) {
      // 백엔드 에러 메시지 파싱 (올바른 경로)
      const errorMessage = error.response?.data?.error?.message;
      const errorCode = error.response?.data?.error?.code;

      // 409 Conflict - 중복 에러
      if (error.response?.status === 409) {
        if (errorCode === 'PROJECT-4009' || errorMessage?.includes('존재하는 프로젝트')) {
          throw new Error('이미 존재하는 프로젝트 이름입니다. 다른 이름을 사용해주세요.');
        }
        throw new Error(errorMessage || '중복된 데이터가 존재합니다.');
      }

      // 400 Bad Request - 유효성 검증 실패
      if (error.response?.status === 400) {
        throw new Error(errorMessage || '입력값을 확인해주세요.');
      }

      // 기타 에러
      throw new Error(errorMessage || '프로젝트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  },

  // Get project by ID (for editing)
  getProjectById: async (projectId: string): Promise<Project | null> => {
    try {
      const response = await publicApiClient.get<ApiResponse<ProjectDTO>>(`/api/projects/${projectId}`);

      if (response.data.success && response.data.data) {
        return mapDtoToProject(response.data.data);
      }

      return null;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw handlePublicApiError(error);
    }
  },

  // Update project
  updateProject: async (projectId: string, formData: ProjectFormData, userId: string): Promise<Project> => {
    try {
      const requestBody = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        vision: formData.vision,
        category: formData.category,
        projectType: formData.projectType,
        recruitmentDeadline: formData.recruitmentDeadline
          ? new Date(formData.recruitmentDeadline).toISOString()
          : null,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        expectedDuration: formData.expectedDuration,
        meetingType: formData.meetingType,
        meetingFrequency: formData.meetingFrequency,
        collaborationTools: formData.collaborationTools,
        compensationDescription: formData.compensationDescription,
        ownerGithub: formData.ownerGithub,
        ownerPortfolio: formData.ownerPortfolio,
        openChatUrl: formData.openChatUrl,
        positions: formData.positions.map(p => ({
          positionName: p.positionName,
          requiredCount: p.requiredCount,
          requiredSkills: p.requiredSkills,
          preferredSkills: p.preferredSkills,
          responsibilities: p.responsibilities
        })),
        techStacks: formData.techStacks.map(t => ({
          category: t.category,
          technology: t.technology
        }))
      };

      await apiClient.put(`/api/projects/${projectId}`, requestBody);

      // Fetch updated project
      const updatedProject = await projectService.getProjectById(projectId);
      if (updatedProject) {
        return updatedProject;
      }

      throw new Error('프로젝트를 찾을 수 없습니다.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message;
      throw new Error(errorMessage || '프로젝트 수정에 실패했습니다.');
    }
  },

  // Delete project
  deleteProject: async (projectId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/projects/${projectId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message;
      throw new Error(errorMessage || '프로젝트 삭제에 실패했습니다.');
    }
  },

  // Update project status
  updateProjectStatus: async (
    projectId: string,
    newStatus: ProjectStatus,
    userId: string
  ): Promise<Project> => {
    try {
      await apiClient.patch(`/api/projects/${projectId}/status`, {
        newStatus
      });

      // Fetch updated project
      const updatedProject = await projectService.getProjectById(projectId);
      if (updatedProject) {
        return updatedProject;
      }

      throw new Error('프로젝트를 찾을 수 없습니다.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message;
      throw new Error(errorMessage || '프로젝트 상태 변경에 실패했습니다.');
    }
  },

  // Get my projects
  getMyProjects: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ProjectDTO[]>>('/api/projects/my');

      if (response.data.success && response.data.data) {
        return response.data.data.map(mapDtoToProject);
      }

      return [];
    } catch (error) {
      throw new Error('내 프로젝트 목록을 불러오는데 실패했습니다.');
    }
  },

  // Increment views
  incrementViews: async (projectId: string): Promise<void> => {
    try {
      await publicApiClient.post(`/api/projects/${projectId}/views`);
    } catch (error) {
      // Silently fail - view counting is not critical
      console.warn('Failed to increment project views', error);
    }
  },

  // Application-related methods (to be implemented when backend is ready)
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
    // TODO: Implement when backend API is available
    throw new Error('지원 기능은 아직 구현되지 않았습니다.');
  },

  getMyApplications: async (userId: string): Promise<ProjectApplication[]> => {
    // TODO: Implement when backend API is available
    return [];
  },

  getProjectApplications: async (
    projectId: string,
    positionId?: string
  ): Promise<ProjectApplication[]> => {
    // TODO: Implement when backend API is available
    return [];
  }
};

export default projectService;

import publicApiClient, { handlePublicApiError } from './publicClient';
import apiClient from './client';

// Constants
export const StudyStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  TERMINATED: 'TERMINATED'
} as const;

export type StudyStatus = typeof StudyStatus[keyof typeof StudyStatus];

// Backend Study Type
export const StudyType = {
  PARTICIPATORY: 'PARTICIPATORY',
  EDUCATIONAL: 'EDUCATIONAL'
} as const;

export type StudyType = typeof StudyType[keyof typeof StudyType];

// Backend Study DTO
export interface StudyDTO {
  id: string;
  title: string;
  description: string;
  proposerId: string;
  status: StudyStatus;
  createdAt: string | number[];
  updatedAt: string | number[];
  rejectionReason?: string;
  generation?: number;
  slug?: string;
  type?: StudyType;
  tagline?: string;
  schedule?: string;
  duration?: string;
  capacity?: number;
  enrolled?: number;
  recruitDeadline?: string | number[];
  startDate?: string | number[];
  endDate?: string | number[];
  deleted?: boolean;
  deletedAt?: string | number[];
}

// Paginated response
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Frontend Study model (for UI display)
export interface Study {
  id: string; // UUID 문자열
  slug: string;
  name: string;
  generation: number;
  tagline: string;
  description?: string;
  type: 'participatory' | 'educational';
  typeLabel: string;
  leader: {
    name: string;
    profileImage: string;
    welcomeMessage: string;
  };
  schedule: string;
  duration: string;
  capacity: number;
  enrolled: number;
  deadline: Date | null;
  status: 'recruiting' | 'ongoing' | 'closed';
  recentTestimonial?: {
    content: string;
    author: string;
  };
  color: {
    primary: string;
    glow: string;
  };
}

// Helper: Parse date from various formats
const parseDate = (dateValue: string | number[] | undefined): Date | null => {
  if (!dateValue) {
    return null;
  }
  
  if (Array.isArray(dateValue)) {
    // Handle array format [year, month, day, hour, minute, second]
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  return new Date(dateValue);
};

// Helper: Determine study status
const determineStudyStatus = (dto: StudyDTO): Study['status'] => {
  if (dto.status !== 'APPROVED') {
    return 'closed';
  }
  
  // 날짜 정보가 없는 경우 기본적으로 진행중으로 처리
  if (!dto.recruitDeadline && !dto.endDate) {
    return 'ongoing';
  }
  
  const now = new Date();
  
  // 모집 마감일이 있는 경우에만 체크
  if (dto.recruitDeadline) {
    const deadline = parseDate(dto.recruitDeadline);
    if (deadline && deadline > now) {
      return 'recruiting';
    }
  }
  
  // 종료일이 있는 경우에만 체크
  if (dto.endDate) {
    const endDate = parseDate(dto.endDate);
    if (endDate) {
      if (endDate > now) {
        return 'ongoing';
      }
      return 'closed';
    }
  }
  
  // 모집 마감일만 있고 지났다면 진행중으로 간주
  return 'ongoing';
};

// Helper: Get study theme color
const getStudyTheme = (id: string) => {
  const themes = [
    { primary: '#C3E88D', glow: 'rgba(195, 232, 141, 0.3)' },
    { primary: '#82AAFF', glow: 'rgba(130, 170, 255, 0.3)' },
    { primary: '#F78C6C', glow: 'rgba(247, 140, 108, 0.3)' },
    { primary: '#C792EA', glow: 'rgba(199, 146, 234, 0.3)' },
    { primary: '#89DDFF', glow: 'rgba(137, 221, 255, 0.3)' }
  ];
  
  const parsedId = parseInt(id);
  const index = isNaN(parsedId) ? 0 : parsedId % themes.length;
  
  return themes[index];
};

// Transform backend DTO to frontend model
const transformStudy = (dto: StudyDTO): Study => {
  const typeMap = {
    PARTICIPATORY: 'participatory',
    EDUCATIONAL: 'educational'
  } as const;
  
  const typeLabelMap = {
    PARTICIPATORY: '참여형',
    EDUCATIONAL: '교육형'
  } as const;
  
  return {
    id: dto.id, // UUID 문자열 그대로 사용
    slug: dto.slug || dto.title.toLowerCase().replace(/\s+/g, '-'),
    name: dto.title,
    generation: dto.generation || 1,
    tagline: dto.tagline || (dto.description ? dto.description.substring(0, 50) + (dto.description.length > 50 ? '...' : '') : ''),
    description: dto.description,
    type: typeMap[dto.type || 'PARTICIPATORY'],
    typeLabel: typeLabelMap[dto.type || 'PARTICIPATORY'],
    leader: {
      // TODO: Fetch from user service - 실제 사용자 정보가 없으면 임시 데이터
      name: '스터디 리더',
      profileImage: `https://i.pravatar.cc/150?img=${parseInt(dto.id) % 10}`,
      welcomeMessage: '함께 성장해요!'
    },
    schedule: dto.schedule || '', // 기본값 제거
    duration: dto.duration || '', // 기본값 제거
    capacity: dto.capacity || 0, // 기본값을 0으로 (UI에서 처리)
    enrolled: dto.enrolled || 0,
    deadline: dto.recruitDeadline ? (parseDate(dto.recruitDeadline) || null) : null,
    status: determineStudyStatus(dto),
    recentTestimonial: undefined, // TODO: Fetch from testimonial service
    color: getStudyTheme(dto.id)
  };
};

// API Params
export interface GetStudiesParams {
  status?: StudyStatus;
  type?: StudyType;
  recruiting?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// Study Proposal Request Type
export interface StudyProposalRequest {
  title: string;
  description: string;
  proposerId: string;
  generation?: number;
  slug?: string;
  type?: StudyType;
  tagline?: string;
  schedule?: string;
  duration?: string;
  capacity?: number;
  recruitDeadline?: string;
  startDate?: string;
  endDate?: string;
}

// Service class following JobNavigatorService pattern
class StudyService {
  private readonly STUDY_API_PATH = '/api/studies/v1/studies';

  /**
   * Get all studies (public endpoint)
   */
  async getAllStudies(): Promise<Study[]> {
    const response = await publicApiClient.get<{
      success: boolean;
      data: StudyDTO[];
      error: any;
      timestamp: number[];
    }>(this.STUDY_API_PATH);
    
    // API가 success/data 구조로 응답하는 경우 처리
    const studies = response.data?.data || response.data || [];
    
    // 배열이 아닌 경우 빈 배열 반환
    if (!Array.isArray(studies)) {
      return [];
    }
    
    return studies
      .filter(study => study.status === 'APPROVED' && !study.deleted)
      .map(transformStudy);
  }

  /**
   * Get paginated studies with optional filters
   */
  async getPagedStudies(params: GetStudiesParams = {}): Promise<PagedResponse<Study>> {
    const response = await publicApiClient.get<{
      success: boolean;
      data: PagedResponse<StudyDTO>;
      error: any;
      timestamp: number[];
    } | PagedResponse<StudyDTO>>(
      `${this.STUDY_API_PATH}/paged`,
      {
        params: {
          page: params.page || 0,
          size: params.size || 10,
          sort: params.sort || 'createdAt,desc',
          ...params
        }
      }
    );
    
    // API가 success/data 구조로 응답하는 경우 처리
    const pageData = (response.data as any)?.data || response.data;
    
    return {
      ...pageData,
      content: (pageData.content || [])
        .filter((study: StudyDTO) => study.status === 'APPROVED' && !study.deleted)
        .map(transformStudy)
    };
  }

  /**
   * Get study by ID
   */
  async getStudyById(id: string | number): Promise<Study | null> {
    const response = await publicApiClient.get<{
      success: boolean;
      data: StudyDTO;
      error: any;
      timestamp: number[];
    } | StudyDTO>(`${this.STUDY_API_PATH}/${id}`);
    
    // API가 success/data 구조로 응답하는 경우 처리
    const study = (response.data as any)?.data || response.data;
    
    if (!study || study.status !== 'APPROVED' || study.deleted) {
      return null;
    }
    
    return transformStudy(study);
  }

  /**
   * Get study by slug
   */
  async getStudyBySlug(slug: string): Promise<Study | null> {
    try {
      // 먼저 slug 전용 엔드포인트 시도
      const response = await publicApiClient.get<{
        success: boolean;
        data: StudyDTO;
        error: any;
        timestamp: number[];
      } | StudyDTO>(`${this.STUDY_API_PATH}/slug/${slug}`);
      
      // API가 success/data 구조로 응답하는 경우 처리
      const study = (response.data as any)?.data || response.data;
      
      if (!study || study.status !== 'APPROVED' || study.deleted) {
        return null;
      }
      
      return transformStudy(study);
    } catch (error) {
      console.log('Slug endpoint not available, falling back to getAllStudies');
      // 백엔드에 slug 엔드포인트가 없으면 fallback으로 전체 조회 후 필터링
      const studies = await this.getAllStudies();
      return studies.find(study => study.slug === slug) || null;
    }
  }

  /**
   * Get active studies (recruiting or ongoing)
   */
  async getActiveStudies(): Promise<Study[]> {
    const studies = await this.getAllStudies();
    return studies.filter(study => 
      study.status === 'recruiting' || study.status === 'ongoing'
    );
  }

  /**
   * Get recruiting studies only
   */
  async getRecruitingStudies(): Promise<Study[]> {
    const studies = await this.getAllStudies();
    return studies.filter(study => study.status === 'recruiting');
  }

  /**
   * Get studies by type
   */
  async getStudiesByType(type: 'participatory' | 'educational'): Promise<Study[]> {
    const studies = await this.getAllStudies();
    return studies.filter(study => study.type === type);
  }

  /**
   * Search studies by keyword
   */
  async searchStudies(keyword: string): Promise<Study[]> {
    const studies = await this.getAllStudies();
    const lowerKeyword = keyword.toLowerCase();
    
    return studies.filter(study => 
      study.name.toLowerCase().includes(lowerKeyword) ||
      study.tagline.toLowerCase().includes(lowerKeyword) ||
      (study.description?.toLowerCase().includes(lowerKeyword) ?? false)
    );
  }

  /**
   * Propose a new study (requires authentication)
   */
  async proposeStudy(proposal: StudyProposalRequest): Promise<StudyDTO> {
    const response = await apiClient.post<{
      success: boolean;
      data: StudyDTO;
      error: any;
      timestamp: number[];
    }>(this.STUDY_API_PATH, proposal);
    
    // API가 success/data 구조로 응답하는 경우 처리
    const study = response.data?.data || response.data;
    
    return study;
  }
}

// Export singleton instance
const studyService = new StudyService();
export default studyService;

// Utility: Get study URL
export const getStudyUrl = (study: Study): string => {
  // UUID 문자열이 유효한지 확인
  const validId = study.id && study.id.length > 0 ? study.id : 'unknown';
  return `/study/${validId}-${study.slug}`;
};
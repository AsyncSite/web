import publicApiClient, { handlePublicApiError } from './publicClient';
import apiClient from './client';

// Constants
export const StudyStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
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

// Backend Recurrence Type
export const RecurrenceType = {
  ONE_TIME: 'ONE_TIME',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY'
} as const;

export type RecurrenceType = typeof RecurrenceType[keyof typeof RecurrenceType];

// Backend Study DTO
export interface StudyDTO {
  id: string;
  title: string;
  description?: string;
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
  recurrenceType?: RecurrenceType;
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
  proposerId: string; // 스터디 제안자 ID
  type: 'participatory' | 'educational' | 'one-time';
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
  status: StudyStatus; // 백엔드 status 타입 그대로 사용
  recurrenceType?: RecurrenceType;
  startDate?: Date | string | number[] | null;
  endDate?: Date | string | number[] | null;
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

// 이 함수는 더 이상 사용되지 않습니다.
// utils/studyStatusUtils.ts의 getStudyDisplayInfo를 사용하세요.
// const determineStudyStatus = (dto: StudyDTO): Study['status'] => { ... }

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
    EDUCATIONAL: 'educational',
    ONE_TIME: 'one-time'
  } as const;
  
  const typeLabelMap = {
    PARTICIPATORY: '참여형',
    EDUCATIONAL: '교육형',
    ONE_TIME: '1회성'
  } as const;
  
  return {
    id: dto.id, // UUID 문자열 그대로 사용
    slug: dto.slug || '',
    name: dto.title,
    generation: dto.generation || 1,
    tagline: dto.tagline || (dto.description ? dto.description.substring(0, 50) + (dto.description.length > 50 ? '...' : '') : ''),
    description: dto.description,
    proposerId: dto.proposerId, // 스터디 제안자 ID 포함
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
    status: dto.status, // 백엔드 status 값을 그대로 사용
    recurrenceType: dto.recurrenceType,
    startDate: dto.startDate,
    endDate: dto.endDate,
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
  proposerId: string;
  generation?: number;
  type?: StudyType;
  tagline?: string;
  schedule?: string;
  duration?: string;
  capacity?: number;
  recruitDeadline?: string;
  startDate?: string;
  endDate?: string;
  recurrenceType?: RecurrenceType;
  detailPage?: {
    sections: Array<{
      type: string;
      content: any;
    }>;
  };
}

// Application related types
export const ApplicationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED', 
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export interface ApplicationRequest {
  applicantId: string;
  answers: Record<string, string>;
}

export interface ApplicationResponse {
  id: string;
  studyId: string;
  applicantId: string;
  answers: Record<string, string>;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string;
  reviewedBy?: string;
}

// My Applications (for My Page)
export interface MyApplicationItem {
  applicationId: string;
  studyId: string;
  studyTitle: string;
  status: ApplicationStatus;
  appliedAt: string; // ISO string
  reviewNote?: string;
}

export interface AcceptApplicationRequest {
  reviewerId: string;
  note?: string;
}

export interface RejectApplicationRequest {
  reviewerId: string;
  reason: string;
}

// Member related types
export interface MemberResponse {
  id: string;
  studyId: string;
  userId: string;
  profileImage?: string;  // 사용자 프로필 이미지
  role: string;
  joinedAt: string;
  status: string;
}

// Service class following JobNavigatorService pattern
class StudyService {
  private readonly STUDY_API_PATH = '/api/studies';
  private readonly MY_API_PATH = '/api/studies/my';

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
   * Get study by ID or slug
   */
  async getStudyById(idOrSlug: string | number): Promise<Study | null> {
    // UUID 패턴 체크 (UUID v4 형식)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(idOrSlug));
    
    // slug인 경우 slug 엔드포인트 사용
    const endpoint = isUuid 
      ? `${this.STUDY_API_PATH}/${idOrSlug}`
      : `${this.STUDY_API_PATH}/slug/${idOrSlug}`;
    
    const response = await publicApiClient.get<{
      success: boolean;
      data: StudyDTO;
      error: any;
      timestamp: number[];
    } | StudyDTO>(endpoint);
    
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
      
      if (!study || study.deleted) {
        return null;
      }
      
      // APPROVED, IN_PROGRESS, COMPLETED 상태의 스터디는 모두 표시
      const allowedStatuses = ['APPROVED', 'IN_PROGRESS', 'COMPLETED'];
      if (!allowedStatuses.includes(study.status)) {
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
   * Get active studies (APPROVED or IN_PROGRESS)
   */
  async getActiveStudies(): Promise<Study[]> {
    const studies = await this.getAllStudies();
    return studies.filter(study => 
      study.status === 'APPROVED' || study.status === 'IN_PROGRESS'
    );
  }

  /**
   * Get recruiting studies only (APPROVED with deadline not passed)
   * Note: This should use getStudyDisplayInfo from utils/studyStatusUtils.ts
   * for accurate recruitment status checking
   */
  async getRecruitingStudies(): Promise<Study[]> {
    const studies = await this.getAllStudies();
    return studies.filter(study => study.status === 'APPROVED');
  }

  /**
   * Get my study memberships (requires authentication)
   * Uses authenticated user context via gateway headers; no userId param.
   */
  async getMyMemberships(): Promise<Array<{
    memberId: string;
    studyId: string;
    studyTitle: string;
    studyStatus?: string;
    role: string;
    joinedAt: string | number[];
    isActive: boolean;
    attendanceRate: number | null;
    warningCount: number;
  }>> {
    const response = await apiClient.get<{
      success: boolean;
      data: any[];
      error: any;
      timestamp: any;
    } | any[]>(`${this.MY_API_PATH}/memberships`);

    const list = (response.data as any)?.data || response.data || [];
    if (!Array.isArray(list)) return [];

    return list.map(item => ({
      memberId: item.memberId || item.id,
      studyId: item.studyId || item.id,
      studyTitle: item.studyTitle || item.title,
      studyStatus: item.studyStatus || item.status,
      role: item.role || 'OWNER',
      joinedAt: item.joinedAt || item.createdAt,
      isActive: item.isActive ?? true,
      attendanceRate: item.attendanceRate ?? null,
      warningCount: item.warningCount ?? 0,
    }));
  }

  /**
   * Get my studies grouped by role/type
   * @returns 제안한, 신청한, 리드하는, 참여하는, 완료된 스터디를 구분하여 반환
   */
  async getMyStudiesGrouped(): Promise<{
    proposed: any[];
    applications: any[];
    leading: any[];
    participating: any[];
    completed: any[];
  }> {
    try {
      console.log('Calling getMyStudiesGrouped, URL:', this.MY_API_PATH);
      const response = await apiClient.get<{
        success: boolean;
        data: any;
        error: any;
        timestamp: any;
      } | any>(this.MY_API_PATH, { params: { format: 'grouped' } });
      
      console.log('getMyStudiesGrouped response:', response.data);
      
      const data = (response.data as any)?.data || response.data || {};
      return {
        proposed: data.proposed || [],
        applications: data.applications || [],
        leading: data.leading || [],
        participating: data.participating || [],
        completed: data.completed || []
      };
    } catch (error) {
      console.error('getMyStudiesGrouped error:', error);
      throw error;
    }
  }

  /**
   * Get my studies 
   * @param type - 필터링할 타입 (PROPOSER, OWNER, MEMBER, APPLICANT)
   * @returns 모든 스터디를 하나의 리스트로 반환
   */
  async getMyStudies(type?: string): Promise<any[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get<{
      success: boolean;
      data: any[];
      error: any;
      timestamp: any;
    } | any[]>(this.MY_API_PATH, { params });
    
    const list = (response.data as any)?.data || response.data || [];
    return Array.isArray(list) ? list : [];
  }

  /**
   * Get my applications (requires authentication)
   */
  async getMyApplications(): Promise<MyApplicationItem[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: any[];
      error: any;
      timestamp: any;
    } | any[]>(`${this.MY_API_PATH}/applications`);

    const list = (response.data as any)?.data || response.data || [];
    if (!Array.isArray(list)) return [];

    return list.map((item: any) => {
      const appliedAtDate = parseDate(item.appliedAt);
      return {
        applicationId: item.applicationId,
        studyId: item.studyId,
        studyTitle: item.studyTitle,
        status: (item.status as ApplicationStatus) || ApplicationStatus.PENDING,
        appliedAt: appliedAtDate ? appliedAtDate.toISOString() : new Date().toISOString(),
        reviewNote: item.reviewNote || undefined,
      } as MyApplicationItem;
    });
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

  /**
   * Apply to study (requires authentication)
   */
  async applyToStudy(studyId: string, application: ApplicationRequest): Promise<ApplicationResponse> {
    const response = await apiClient.post<{
      success: boolean;
      data: ApplicationResponse;
      error: any;
      timestamp: number[];
    }>(`${this.STUDY_API_PATH}/${studyId}/applications`, application);
    
    return response.data?.data || response.data;
  }

  /**
   * Get applications for a study (host only)
   */
  async getStudyApplications(studyId: string, page: number = 0, size: number = 10): Promise<PagedResponse<ApplicationResponse>> {
    const response = await apiClient.get<{
      success: boolean;
      data: PagedResponse<ApplicationResponse>;
      error: any;
      timestamp: number[];
    } | PagedResponse<ApplicationResponse>>(`${this.STUDY_API_PATH}/${studyId}/applications`, {
      params: { page, size }
    });
    
    return (response.data as any)?.data || response.data;
  }

  /**
   * Get single application details
   */
  async getApplication(studyId: string, applicationId: string): Promise<ApplicationResponse> {
    const response = await apiClient.get<{
      success: boolean;
      data: ApplicationResponse;
      error: any;
      timestamp: number[];
    }>(`${this.STUDY_API_PATH}/${studyId}/applications/${applicationId}`);
    
    return response.data?.data || response.data;
  }

  /**
   * Accept application (host only)
   */
  async acceptApplication(studyId: string, applicationId: string, request: AcceptApplicationRequest): Promise<{ memberId: string; studyId: string; applicationId: string; acceptedAt: string; }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { memberId: string; studyId: string; applicationId: string; acceptedAt: string; };
      error: any;
      timestamp: number[];
    }>(`${this.STUDY_API_PATH}/${studyId}/applications/${applicationId}/accept`, request);
    
    return response.data?.data || response.data;
  }

  /**
   * Reject application (host only) 
   */
  async rejectApplication(studyId: string, applicationId: string, request: RejectApplicationRequest): Promise<void> {
    await apiClient.post(`${this.STUDY_API_PATH}/${studyId}/applications/${applicationId}/reject`, request);
  }

  /**
   * Cancel application (applicant only)
   */
  async cancelApplication(studyId: string, applicationId: string, applicantId: string): Promise<void> {
    await apiClient.delete(`${this.STUDY_API_PATH}/${studyId}/applications/${applicationId}`, {
      params: { applicantId }
    });
  }

  /**
   * Get study members (requires authentication)
   */
  async getStudyMembers(studyId: string, page: number = 0, size: number = 10): Promise<PagedResponse<MemberResponse>> {
    const response = await apiClient.get<{
      success: boolean;
      data: PagedResponse<MemberResponse>;
      error: any;
      timestamp: number[];
    } | PagedResponse<MemberResponse>>(`${this.STUDY_API_PATH}/${studyId}/members`, {
      params: { page, size }
    });
    
    return (response.data as any)?.data || response.data;
  }

  /**
   * Get member count for study
   */
  async getStudyMemberCount(studyId: string): Promise<number> {
    const response = await apiClient.get<{
      success: boolean;
      data: number;
      error: any;
      timestamp: number[];
    } | number>(`${this.STUDY_API_PATH}/${studyId}/members/count`);
    
    // Handle both wrapped and direct response formats
    if (typeof response.data === 'number') {
      return response.data;
    }
    return (response.data as any)?.data || 0;
  }

  /**
   * Leave study (member only)
   */
  async leaveStudy(studyId: string, userId: string): Promise<void> {
    await apiClient.post(`${this.STUDY_API_PATH}/${studyId}/members/leave`, null, {
      params: { userId }
    });
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
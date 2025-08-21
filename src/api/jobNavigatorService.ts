import apiClient from './client';

// Types
export interface SearchJobsParams {
  keyword?: string;
  companyIds?: number[];
  techStackIds?: number[];
  experienceLevel?: string;
  jobType?: string;
  location?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface JobItemResponse {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
  deadline: string;
  matchScore: number;
  hasWarRoom: boolean;
  warRoomCount?: number;
  sourceUrl?: string;
  postedAt?: string;
  experienceCategory?: string;
  requirements?: string;
  preferred?: string;
  summary?: string;  // KoBART로 생성된 요약
}

export interface JobSearchResponse {
  content: JobItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface CompanyResponse {
  id: number;
  name: string;
  nameEn: string;
  careerPageUrl?: string;
  logoUrl?: string;
}

export interface TechStackResponse {
  id: number;
  name: string;
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'CLOUD' | 'TOOL' | 'OTHER';
}

export interface CompanyWithCountResponse {
  id: number;
  name: string;
  nameEn?: string;
  jobCount: number;
}

export interface TechStackWithCountResponse {
  id: number;
  name: string;
  category: string;
  jobCount: number;
}

export interface ExperienceCategoryWithCountResponse {
  category: string;
  displayName: string;
  jobCount: number;
}

export interface CreateSuggestionRequest {
  type: 'DATA_ERROR' | 'JOB_CLOSED' | 'ADD_COMPANY' | 'OTHER';
  jobPostingId?: number | null;
  userEmail?: string | null;
  content: string;
}

export interface SuggestionResponse {
  id: number;
  type: string;
  typeDisplayName: string;
  jobPostingId?: number;
  jobTitle?: string;
  companyName?: string;
  userEmail?: string;
  content: string;
  status: string;
  statusDisplayName: string;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

// Service
class JobNavigatorService {
  /**
   * Search jobs with filters (Public API - no auth required)
   */
  async searchJobs(params: SearchJobsParams = {}): Promise<JobSearchResponse> {
    const response = await apiClient.get<JobSearchResponse>('/api/public/jobs', {
      params: {
        ...params,
        page: params.page || 0,
        size: params.size || 20,
        isActive: params.isActive !== false,
      }
    });
    return response.data;
  }

  /**
   * Get job detail by ID (Public API - no auth required)
   */
  async getJobDetail(id: number): Promise<JobItemResponse> {
    const response = await apiClient.get<JobItemResponse>(`/api/public/jobs/${id}`);
    return response.data;
  }

  /**
   * Get all companies (Public API - no auth required)
   */
  async getCompanies(query?: string): Promise<CompanyResponse[]> {
    const response = await apiClient.get<CompanyResponse[]>('/api/public/jobs/companies', {
      params: query ? { q: query } : undefined
    });
    return response.data;
  }

  /**
   * Get all tech stacks (Public API - no auth required)
   */
  async getTechStacks(category?: string): Promise<TechStackResponse[]> {
    const response = await apiClient.get<TechStackResponse[]>('/api/public/jobs/tech-stacks', {
      params: category ? { category } : undefined
    });
    return response.data;
  }

  /**
   * Get companies with job count (Public API - no auth required)
   */
  async getCompaniesWithCount(): Promise<CompanyWithCountResponse[]> {
    const response = await apiClient.get<CompanyWithCountResponse[]>('/api/public/jobs/companies/with-count');
    return response.data;
  }

  /**
   * Get tech stacks with job count (Public API - no auth required)
   */
  async getTechStacksWithCount(): Promise<TechStackWithCountResponse[]> {
    const response = await apiClient.get<TechStackWithCountResponse[]>('/api/public/jobs/tech-stacks/with-count');
    return response.data;
  }

  /**
   * Get experience categories with job count (Public API - no auth required)
   */
  async getExperienceCategoriesWithCount(): Promise<ExperienceCategoryWithCountResponse[]> {
    const response = await apiClient.get<ExperienceCategoryWithCountResponse[]>('/api/public/jobs/experience/categories/with-count');
    return response.data;
  }

  /**
   * Calculate match score for a job (mock implementation for now)
   */
  calculateMatchScore(job: JobItemResponse, userSkills: string[] = []): number {
    // Simple matching algorithm - can be enhanced later
    if (userSkills.length === 0) {
      return Math.floor(Math.random() * 40) + 60; // Random 60-100
    }
    
    const jobSkills = job.skills.map(s => s.toLowerCase());
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const matches = userSkillsLower.filter(skill => jobSkills.includes(skill));
    
    return Math.min(100, Math.floor((matches.length / Math.max(jobSkills.length, 1)) * 100));
  }

  /**
   * Create a new suggestion (Internal API - auth required)
   */
  async createSuggestion(request: CreateSuggestionRequest): Promise<SuggestionResponse> {
    const response = await apiClient.post<SuggestionResponse>('/api/job-navigator/suggestions', request);
    return response.data;
  }
}

export default new JobNavigatorService();
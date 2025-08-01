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

// Service
class JobNavigatorService {
  /**
   * Search jobs with filters
   */
  async searchJobs(params: SearchJobsParams = {}): Promise<JobSearchResponse> {
    const response = await apiClient.get<JobSearchResponse>('/api/job-navigator/jobs', {
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
   * Get job detail by ID
   */
  async getJobDetail(id: number): Promise<JobItemResponse> {
    const response = await apiClient.get<JobItemResponse>(`/api/job-navigator/jobs/${id}`);
    return response.data;
  }

  /**
   * Get all companies
   */
  async getCompanies(query?: string): Promise<CompanyResponse[]> {
    const response = await apiClient.get<CompanyResponse[]>('/api/job-navigator/companies', {
      params: query ? { q: query } : undefined
    });
    return response.data;
  }

  /**
   * Get all tech stacks
   */
  async getTechStacks(category?: string): Promise<TechStackResponse[]> {
    const response = await apiClient.get<TechStackResponse[]>('/api/job-navigator/tech-stacks', {
      params: category ? { category } : undefined
    });
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
}

export default new JobNavigatorService();
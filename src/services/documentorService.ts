import apiClient from '../api/client';
import publicApiClient from '../api/publicClient';
import { DocuMentorSubmitRequest, DocuMentorContent, DocuMentorAnalysis, DocuMentorStats } from '../components/lab/ai-studio/documentor/types';

class DocumentorService {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Submit a URL for AI review (Trial version for non-authenticated users)
   */
  async submitTrialUrl(email: string, url: string): Promise<DocuMentorContent> {
    try {
      const response = await publicApiClient.post(
        '/api/public/documento/contents/trial',
        { email, url }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('이미 무료 체험을 사용하셨습니다.');
      }
      throw new Error(error.response?.data?.message || '처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * Submit a URL for AI review (Authenticated version)
   */
  async submitUrl(request: DocuMentorSubmitRequest): Promise<DocuMentorContent> {
    try {
      const response = await apiClient.post(
        '/api/documento/contents',
        request
      );
      return response.data.data;  // ApiResponse wrapper
    } catch (error: any) {
      if (error.response?.status === 409) {
        if (error.response.data?.errorCode === 'DOC-001') {
          throw new Error('오늘 사용 가능한 횟수를 모두 사용하셨습니다. 자정에 다시 시도해주세요!');
        }
        if (error.response.data?.errorCode === 'DOC-002') {
          throw new Error('이미 24시간 내에 제출한 URL입니다. 다른 URL을 시도해보세요!');
        }
      }
      if (error.response?.status === 400) {
        throw new Error('올바르지 않은 URL 형식입니다. 다시 확인해주세요.');
      }
      if (error.response?.status === 401) {
        throw new Error('로그인이 필요한 서비스입니다.');
      }
      throw new Error(error.response?.data?.message || '처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * Get content details by ID
   */
  async getContent(contentId: string): Promise<DocuMentorContent> {
    try {
      const response = await apiClient.get(
        `/api/documento/contents/${contentId}`
      );
      return response.data.data;  // ApiResponse wrapper
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('콘텐츠를 찾을 수 없습니다.');
      }
      throw new Error(error.response?.data?.message || '콘텐츠 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * Get trial content details by ID
   */
  async getTrialContent(contentId: string, email: string): Promise<DocuMentorContent> {
    try {
      const response = await publicApiClient.get(
        `/api/public/documento/contents/trial/${contentId}`,
        { params: { email } }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('콘텐츠를 찾을 수 없습니다.');
      }
      throw new Error(error.response?.data?.message || '콘텐츠 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * Get analysis results for content
   */
  async getAnalysis(contentId: string): Promise<DocuMentorAnalysis> {
    try {
      const response = await apiClient.get(
        `/api/documento/contents/${contentId}/analysis`
      );
      return response.data.data;  // ApiResponse wrapper
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('분석 결과를 찾을 수 없습니다.');
      }
      throw new Error(error.response?.data?.message || '분석 결과 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * Get user's content list
   */
  async getMyContents(page: number = 0, size: number = 20, status?: string): Promise<{
    content: DocuMentorContent[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    try {
      const params: any = { page, size };
      if (status) params.status = status;
      
      const response = await apiClient.get(
        '/api/documento/contents',
        { params }
      );
      return response.data.data;  // ApiResponse wrapper
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '콘텐츠 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * Get usage statistics
   */
  async getStats(): Promise<DocuMentorStats> {
    try {
      const response = await apiClient.get(
        '/api/documento/contents/stats'
      );
      return response.data.data;  // ApiResponse wrapper
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '사용 통계 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * Poll for content status updates
   */
  async pollContentStatus(contentId: string, maxAttempts: number = 60, intervalMs: number = 3000): Promise<DocuMentorContent> {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          attempts++;
          const content = await this.getContent(contentId);
          
          if (content.status === 'COMPLETED' || content.status === 'FAILED') {
            resolve(content);
            return;
          }
          
          if (attempts >= maxAttempts) {
            reject(new Error('처리 시간이 초과되었습니다. 나중에 다시 확인해주세요.'));
            return;
          }
          
          setTimeout(checkStatus, intervalMs);
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  }

  /**
   * Check if URL is valid and accessible
   */
  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      // Check hostname
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): string[] {
    return [
      'blog.naver.com',
      'tistory.com',
      'brunch.co.kr',
      'velog.io',
      'medium.com',
      'instagram.com',
      'threads.net',
      'notion.so',
      'github.io',
      'wordpress.com',
    ];
  }

  /**
   * Check if URL is from supported platform
   */
  isSupportedPlatform(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      return this.getSupportedPlatforms().some(platform => 
        hostname.includes(platform) || hostname.endsWith(platform)
      );
    } catch {
      return false;
    }
  }
}

const documentorService = new DocumentorService();
export default documentorService;
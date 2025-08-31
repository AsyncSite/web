import axios from 'axios';
import { DocuMentorSubmitRequest, DocuMentorContent, DocuMentorAnalysis, DocuMentorStats } from '../components/lab/ai-studio/documentor/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const DOCUMENTOR_API_URL = `${API_BASE_URL}/documentor`;

class DocumentorService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Submit a URL for AI review
   */
  async submitUrl(request: DocuMentorSubmitRequest): Promise<DocuMentorContent> {
    try {
      const response = await axios.post(
        `${DOCUMENTOR_API_URL}/contents`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
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
      const response = await axios.get(
        `${DOCUMENTOR_API_URL}/contents/${contentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
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
      const response = await axios.get(
        `${DOCUMENTOR_API_URL}/contents/${contentId}/analysis`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
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
      
      const response = await axios.get(
        `${DOCUMENTOR_API_URL}/contents`,
        { 
          headers: this.getAuthHeaders(),
          params
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '콘텐츠 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * Get usage statistics
   */
  async getStats(): Promise<DocuMentorStats> {
    try {
      const response = await axios.get(
        `${DOCUMENTOR_API_URL}/contents/stats`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
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
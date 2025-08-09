import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/environment';
import { translateErrorMessage } from '../constants/errorMessages';

/**
 * Public API Client - For endpoints that don't require authentication
 * This client does NOT automatically add authorization headers
 */
const publicApiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling (no auth handling)
publicApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Simple error handling without auth retry logic
    return Promise.reject(error);
  }
);

export default publicApiClient;

/**
 * Handle errors from public API calls
 */
export const handlePublicApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    // For public content, avoid suggesting login on authorization errors
    if (status === 401 || status === 403) {
      return '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    }
    if (error.response?.data) {
      const data = error.response.data as any;
      
      // Handle error response format from backend
      if (data.error) {
        const errorCode = data.error.code;
        const errorMessage = data.error.message;
        return translateErrorMessage(errorCode, errorMessage);
      }
      
      // Handle simple message format
      if (data.message) {
        return translateErrorMessage(undefined, data.message);
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    
    if (!error.response) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    // Handle axios error messages
    if (error.message) {
      return translateErrorMessage(undefined, error.message);
    }
  }
  
  // Default error message
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};
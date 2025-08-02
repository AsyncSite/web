import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/environment';
import { AUTH_EVENTS, dispatchAuthEvent } from '../utils/authEvents';
import { translateErrorMessage } from '../constants/errorMessages';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: (params) => {
      // Custom params serializer to handle arrays properly
      const searchParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        
        if (Array.isArray(value)) {
          // Serialize arrays without brackets (companyIds=1&companyIds=2)
          value.forEach(item => {
            searchParams.append(key, item.toString());
          });
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      return searchParams.toString();
    }
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Track if we're already refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && originalRequest) {
      // Get the request URL
      const requestUrl = originalRequest.url || '';
      
      // Skip refresh for certain endpoints
      const skipRefreshPaths = [
        '/api/auth/login',
        '/api/auth/logout', // Skip refresh on logout to prevent redirect conflicts
        '/api/auth/validate',
        '/api/auth/refresh',
        '/api/games/', // Game service endpoints (guest play allowed)
      ];
      
      const shouldSkipRefresh = skipRefreshPaths.some(path => requestUrl.includes(path));
      
      if (!shouldSkipRefresh && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${env.apiBaseUrl}/api/auth/refresh`, {
              refreshToken
            });
            
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('authToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            processQueue(null, accessToken);
            return apiClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            // Refresh failed - clear auth and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            dispatchAuthEvent(AUTH_EVENTS.UNAUTHORIZED, { 
              from: requestUrl,
              statusCode: 401 
            });
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token - clear auth and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatchAuthEvent(AUTH_EVENTS.UNAUTHORIZED, { 
            from: requestUrl,
            statusCode: 401 
          });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Export common error handler
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data as any;
      
      // Handle error response format from backend
      // Backend returns: { success: false, error: { code: "AUTH-1001", message: "..." } }
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
    
    // Handle axios error messages
    if (error.message) {
      return translateErrorMessage(undefined, error.message);
    }
  }
  
  // Default error message
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
};
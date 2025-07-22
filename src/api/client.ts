import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/environment';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Get the request URL
      const requestUrl = error.config?.url || '';
      
      // Skip redirect for certain endpoints
      const skipRedirectPaths = [
        '/api/auth/validate',  // Token validation endpoint
        '/api/auth/refresh',   // Token refresh endpoint
        '/api/games/',         // Game service endpoints (guest play allowed)
      ];
      
      const shouldSkipRedirect = skipRedirectPaths.some(path => requestUrl.includes(path));
      
      if (!shouldSkipRedirect) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
      if (data.error?.message) {
        return data.error.message;
      }
      if (data.message) {
        return data.message;
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};
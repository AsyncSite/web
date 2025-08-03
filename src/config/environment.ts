// Environment configuration
interface EnvironmentConfig {
  apiBaseUrl: string;
  authApiUrl: string;
  appEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  isLocal: boolean;
  kakaoAppKey: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV;
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  
  // Check if running on localhost
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  // Determine API base URL based on environment
  let apiBaseUrl: string;
  
  // Force production URL for Vercel deployments
  if (isProduction && !isLocal) {
    // Always use production API for Vercel deployments
    apiBaseUrl = 'https://api.asyncsite.com';
  } else {
    // Use environment variable for local development, fallback to localhost
    apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
  }
  
  return {
    apiBaseUrl,
    authApiUrl: `${apiBaseUrl}/api/auth`,
    appEnv: nodeEnv as 'development' | 'production' | 'test',
    isDevelopment,
    isProduction,
    isLocal,
    kakaoAppKey: process.env.REACT_APP_KAKAO_APP_KEY || 'YOUR_KAKAO_APP_KEY',
  };
};

export const env = getEnvironmentConfig();

// Always log environment info for debugging
console.log('🚀 Environment Configuration:', {
  mode: process.env.NODE_ENV,
  apiBaseUrl: env.apiBaseUrl,
  authApiUrl: env.authApiUrl,
  isLocal: env.isLocal,
  hostname: window.location.hostname,
});
// Environment configuration
interface EnvironmentConfig {
  apiBaseUrl: string;
  authApiUrl: string;
  appEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  isLocal: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV;
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  
  // Check if running on localhost
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  // Determine API base URL based on environment
  let apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
  
  if (!apiBaseUrl) {
    if (isProduction && !isLocal) {
      // Production (Vercel deployment)
      apiBaseUrl = 'https://api.asyncsite.com';
    } else {
      // Development or local
      apiBaseUrl = 'http://localhost:8080';
    }
  }
  
  return {
    apiBaseUrl,
    authApiUrl: `${apiBaseUrl}/api/auth`,
    appEnv: nodeEnv as 'development' | 'production' | 'test',
    isDevelopment,
    isProduction,
    isLocal,
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
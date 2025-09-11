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
  
  // Check if running on localhost (runtime check, not build-time)
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  // Determine API base URL based on environment and hostname
  let apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.asyncsite.com';
  if (window.location.hostname === 'documentor.asyncsite.com') {
    apiBaseUrl = 'https://documentor.asyncsite.com';
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
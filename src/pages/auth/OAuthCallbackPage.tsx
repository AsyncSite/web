import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../api/authService';
import userService from '../../api/userService';
import { LoginResponse } from '../../types/auth';
import StarBackground from '../../components/common/StarBackground';
import './LoginPage.css';

function OAuthCallbackPage(): React.ReactNode {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token from query parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setIsProcessing(false);
          return;
        }

        if (!token || !refreshToken) {
          setError('인증 정보가 누락되었습니다.');
          setIsProcessing(false);
          return;
        }

        // Store tokens and get user info
        const loginResponse: LoginResponse = {
          accessToken: token,
          refreshToken: refreshToken,
          tokenType: 'Bearer',
          expiresIn: 3600, // 1 hour default
          email: '', // Will be filled by validateToken
          username: '',
          roles: [] as string[]
        };

        // Store auth data
        authService.storeAuthData(loginResponse);

        // Validate token and get basic user info
        const userInfo = await authService.validateToken();

        // Update login response with user info
        loginResponse.email = userInfo.email;
        loginResponse.username = userInfo.username || userInfo.email;
        loginResponse.roles = userInfo.roles || [];

        // Store updated auth data
        authService.storeAuthData(loginResponse);
        
        // Fetch full user profile (including name and other details)
        let isNewUser = false;
        try {
          const profile = await userService.getProfile();
          // Check if this is a new user (profile not fully filled)
          if (!profile.role && !profile.quote && !profile.bio) {
            isNewUser = true;
          }
        } catch (error) {
          // If profile fetch fails, continue anyway
          console.error('Failed to fetch user profile:', error);
        }

        // Check if this is first time OAuth login
        const oauthLoginCount = localStorage.getItem(`oauth_login_count_${userInfo.email}`);
        if (!oauthLoginCount) {
          localStorage.setItem(`oauth_login_count_${userInfo.email}`, '1');
          isNewUser = true;
        }

        // Force a page reload to ensure AuthContext picks up the new auth state
        // If new user, add showOnboarding query parameter
        if (isNewUser) {
          window.location.href = '/users/me?showOnboarding=true';
        } else {
          window.location.href = '/users/me';
        }
      } catch (err) {
        setError('OAuth 로그인 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (isProcessing) {
    return (
      <div className="login-page auth-page">
        <StarBackground />
        <div className="login-container auth-container auth-fade-in">
          <div className="login-brand">
            <div className="login-logo">AS</div>
          </div>
          <div className="login-header">
            <h1>로그인 중...</h1>
            <p>Google 계정으로 로그인하고 있습니다</p>
          </div>
          <div className="loading-spinner" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            처리 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page auth-page">
      <StarBackground />
      <div className="login-container auth-container auth-fade-in">
        <div className="login-brand">
          <div className="login-logo">AS</div>
        </div>
        <div className="login-header">
          <h1>로그인 실패</h1>
          <p>Google 로그인 중 문제가 발생했습니다</p>
        </div>
        {error && (
          <div className="error-message general-error auth-error-shake">
            {error}
          </div>
        )}
        <button
          onClick={() => navigate('/login')}
          className="login-button auth-button auth-button-primary"
          style={{ marginTop: '2rem' }}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default OAuthCallbackPage;